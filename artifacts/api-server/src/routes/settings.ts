import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userProfileTable, apiKeysTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

async function getOrCreateProfile() {
  const profiles = await db.select().from(userProfileTable).limit(1);
  if (profiles.length > 0) return profiles[0];
  // Seed default profile
  const [created] = await db.insert(userProfileTable).values({}).returning();
  return created;
}

// ─── Profile Endpoints ───────────────────────────────────────────────────────

router.get("/settings/profile", async (_req, res) => {
  try {
    const profile = await getOrCreateProfile();
    res.json(profile);
  } catch (err) {
    console.error("GET /settings/profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/settings/profile", async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    const {
      name, email, role, timezone, avatarUrl,
      notifyMissionComplete, notifyMissionFailed, notifyAgentActivity, notifyWeeklyReport,
      twoFactorEnabled,
      defaultModel, fallbackModel, maxTokensPerRun, temperature,
    } = req.body;

    const [updated] = await db
      .update(userProfileTable)
      .set({
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(timezone !== undefined && { timezone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(notifyMissionComplete !== undefined && { notifyMissionComplete }),
        ...(notifyMissionFailed !== undefined && { notifyMissionFailed }),
        ...(notifyAgentActivity !== undefined && { notifyAgentActivity }),
        ...(notifyWeeklyReport !== undefined && { notifyWeeklyReport }),
        ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
        ...(defaultModel !== undefined && { defaultModel }),
        ...(fallbackModel !== undefined && { fallbackModel }),
        ...(maxTokensPerRun !== undefined && { maxTokensPerRun: Number(maxTokensPerRun) }),
        ...(temperature !== undefined && { temperature: String(temperature) }),
        updatedAt: new Date(),
      })
      .where(eq(userProfileTable.id, profile.id))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error("PUT /settings/profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ─── API Keys Endpoints ──────────────────────────────────────────────────────

router.get("/settings/api-keys", async (_req, res) => {
  try {
    const keys = await db.select().from(apiKeysTable).orderBy(apiKeysTable.createdAt);
    // Never return the hash in the list
    res.json(keys.map(k => ({ ...k, keyHash: undefined })));
  } catch (err) {
    console.error("GET /settings/api-keys error:", err);
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

router.post("/settings/api-keys", async (req, res) => {
  try {
    const { name, service, key } = req.body;
    if (!name || !service || !key) {
      return res.status(400).json({ error: "name, service, and key are required" });
    }

    const [created] = await db
      .insert(apiKeysTable)
      .values({
        name,
        service,
        keyMasked: maskKey(key),
        keyHash: hashKey(key),
        isActive: true,
      })
      .returning();

    res.status(201).json({ ...created, keyHash: undefined });
  } catch (err) {
    console.error("POST /settings/api-keys error:", err);
    res.status(500).json({ error: "Failed to create API key" });
  }
});

router.patch("/settings/api-keys/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, isActive } = req.body;

    const [updated] = await db
      .update(apiKeysTable)
      .set({
        ...(name !== undefined && { name }),
        ...(isActive !== undefined && { isActive }),
      })
      .where(eq(apiKeysTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "API key not found" });
    res.json({ ...updated, keyHash: undefined });
  } catch (err) {
    console.error("PATCH /settings/api-keys/:id error:", err);
    res.status(500).json({ error: "Failed to update API key" });
  }
});

router.delete("/settings/api-keys/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(apiKeysTable).where(eq(apiKeysTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /settings/api-keys/:id error:", err);
    res.status(500).json({ error: "Failed to delete API key" });
  }
});

export default router;
