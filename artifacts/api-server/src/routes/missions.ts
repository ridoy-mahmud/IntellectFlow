import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { missionsTable, activityLogsTable } from "@workspace/db/schema";
import { eq, desc, asc, and, sql } from "drizzle-orm";

const router: IRouter = Router();

const agentEmojis: Record<string, string> = {
  researcher: "🔍",
  writer: "✍️",
  coder: "💻",
  analyst: "📊",
  designer: "🎨",
  qa_tester: "🛡️",
};

const agentActions: Record<string, string[]> = {
  researcher: [
    "Searching the web for relevant information...",
    "Found 12 relevant sources. Compiling brief...",
    "Analyzing research data and extracting key insights...",
    "Cross-referencing multiple sources for accuracy...",
    "Generating comprehensive research summary...",
  ],
  writer: [
    "Received research brief. Beginning draft outline...",
    "Writing introduction section with compelling hook...",
    "Expanding main body with supporting evidence...",
    "Polishing prose and refining narrative flow...",
    "Finalizing content and running quality checks...",
  ],
  coder: [
    "Analyzing code requirements from project spec...",
    "Setting up project structure and dependencies...",
    "Implementing core functionality...",
    "Writing unit tests for critical paths...",
    "Optimizing performance and reviewing code quality...",
  ],
  analyst: [
    "Loading and preprocessing dataset...",
    "Running statistical analysis on key metrics...",
    "Generating visualization charts...",
    "Identifying trends and anomalies...",
    "Compiling actionable insights report...",
  ],
  designer: [
    "Reviewing design requirements and brand guidelines...",
    "Sketching wireframe concepts...",
    "Generating high-fidelity mockups...",
    "Refining visual hierarchy and spacing...",
    "Exporting final design assets...",
  ],
  qa_tester: [
    "Reviewing all outputs for quality standards...",
    "Running consistency checks across deliverables...",
    "Testing edge cases and error handling...",
    "Validating against original requirements...",
    "Final approval checks complete...",
  ],
};

const activeIntervals = new Map<number, ReturnType<typeof setInterval>>();

function startMissionSimulation(id: number) {
  if (activeIntervals.has(id)) {
    clearInterval(activeIntervals.get(id)!);
  }

  const interval = setInterval(async () => {
    try {
      const [current] = await db
        .select()
        .from(missionsTable)
        .where(eq(missionsTable.id, id))
        .limit(1);

      if (!current || current.status !== "running") {
        clearInterval(interval);
        activeIntervals.delete(id);
        return;
      }

      await simulateMissionProgress(id);
    } catch {
      clearInterval(interval);
      activeIntervals.delete(id);
    }
  }, 8000);

  activeIntervals.set(id, interval);
  setTimeout(() => {
    clearInterval(interval);
    activeIntervals.delete(id);
  }, 30 * 60 * 1000);
}

async function simulateMissionProgress(missionId: number) {
  const mission = await db
    .select()
    .from(missionsTable)
    .where(eq(missionsTable.id, missionId))
    .limit(1);

  if (!mission[0] || mission[0].status !== "running") return;

  const agents = (mission[0].agents as any[]).filter((a: any) => a.enabled);
  if (agents.length === 0) return;

  const agent = agents[Math.floor(Math.random() * agents.length)];
  const actions = agentActions[agent.agentType] || agentActions.researcher;
  const action = actions[Math.floor(Math.random() * actions.length)];

  await db.insert(activityLogsTable).values({
    missionId,
    agentType: agent.agentType,
    action: `${agentEmojis[agent.agentType] || "🤖"} ${action}`,
    details: null,
  });

  const currentProgress = mission[0].progress || 0;
  const newProgress = Math.min(100, currentProgress + Math.random() * 8 + 2);
  const newTokens = (mission[0].tokensUsed || 0) + Math.floor(Math.random() * 500 + 100);
  const newElapsed = (mission[0].elapsedSeconds || 0) + 10;

  let newStatus = "running";
  if (newProgress >= 100) {
    newStatus = "completed";
  }

  await db
    .update(missionsTable)
    .set({
      progress: newProgress >= 100 ? 100 : newProgress,
      tokensUsed: newTokens,
      elapsedSeconds: newElapsed,
      status: newStatus,
      updatedAt: new Date(),
      completedAt: newStatus === "completed" ? new Date() : undefined,
    })
    .where(eq(missionsTable.id, missionId));
}

router.get("/missions", async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = db.select().from(missionsTable).orderBy(desc(missionsTable.createdAt));

    const missions = await query;

    const filtered =
      status && status !== "all"
        ? missions.filter((m) => m.status === status)
        : missions;

    const limited = limit ? filtered.slice(0, Number(limit)) : filtered;

    res.json(
      limited.map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        launchedAt: m.launchedAt?.toISOString() ?? null,
        completedAt: m.completedAt?.toISOString() ?? null,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/missions", async (req, res) => {
  try {
    const { name, description, category, priority, agents } = req.body;

    if (!name || !description || !category || !priority || !agents) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const enabledCount = agents.filter((a: any) => a.enabled).length;
    const estimatedCost = enabledCount * 0.15;

    const [mission] = await db
      .insert(missionsTable)
      .values({
        name,
        description,
        category,
        priority,
        agents,
        status: "draft",
        progress: 0,
        estimatedCost,
        tokensUsed: 0,
        elapsedSeconds: 0,
      })
      .returning();

    res.status(201).json({
      ...mission,
      createdAt: mission.createdAt.toISOString(),
      updatedAt: mission.updatedAt.toISOString(),
      launchedAt: null,
      completedAt: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/missions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [mission] = await db
      .select()
      .from(missionsTable)
      .where(eq(missionsTable.id, id))
      .limit(1);

    if (!mission) {
      return res.status(404).json({ error: "Mission not found", message: "No mission found with that ID" });
    }

    res.json({
      ...mission,
      createdAt: mission.createdAt.toISOString(),
      updatedAt: mission.updatedAt.toISOString(),
      launchedAt: mission.launchedAt?.toISOString() ?? null,
      completedAt: mission.completedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/missions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, status, progress, agents } = req.body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    if (agents !== undefined) updateData.agents = agents;

    const [updated] = await db
      .update(missionsTable)
      .set(updateData)
      .where(eq(missionsTable.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Mission not found", message: "No mission found with that ID" });
    }

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      launchedAt: updated.launchedAt?.toISOString() ?? null,
      completedAt: updated.completedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/missions/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(missionsTable).where(eq(missionsTable.id, id));
    res.json({ success: true, message: "Mission deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/missions/:id/launch", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db
      .update(missionsTable)
      .set({
        status: "running",
        launchedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(missionsTable.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Mission not found", message: "No mission found with that ID" });
    }

    const agents = (updated.agents as any[]).filter((a: any) => a.enabled);
    if (agents.length > 0) {
      await db.insert(activityLogsTable).values({
        missionId: id,
        agentType: "system",
        action: "🚀 Mission launched! Initializing agent crew...",
        details: `${agents.length} agents activated`,
      });

      for (const agent of agents) {
        await db.insert(activityLogsTable).values({
          missionId: id,
          agentType: agent.agentType,
          action: `${agentEmojis[agent.agentType] || "🤖"} ${agent.agentType.charAt(0).toUpperCase() + agent.agentType.slice(1)} Agent activated and ready.`,
          details: null,
        });
      }
    }

    startMissionSimulation(id);

    res.json({
      ...updated,
      status: "running",
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      launchedAt: updated.launchedAt?.toISOString() ?? null,
      completedAt: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/missions/:id/pause", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db
      .update(missionsTable)
      .set({ status: "paused", updatedAt: new Date() })
      .where(eq(missionsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Mission not found", message: "No mission found" });

    await db.insert(activityLogsTable).values({
      missionId: id,
      agentType: "system",
      action: "⏸️ Mission paused by user.",
      details: null,
    });

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      launchedAt: updated.launchedAt?.toISOString() ?? null,
      completedAt: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/missions/:id/resume", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [updated] = await db
      .update(missionsTable)
      .set({ status: "running", updatedAt: new Date() })
      .where(eq(missionsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Mission not found", message: "No mission found" });

    await db.insert(activityLogsTable).values({
      missionId: id,
      agentType: "system",
      action: "▶️ Mission resumed. Agents reactivated.",
      details: null,
    });

    startMissionSimulation(id);

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      launchedAt: updated.launchedAt?.toISOString() ?? null,
      completedAt: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/missions/:id/abort", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (activeIntervals.has(id)) {
      clearInterval(activeIntervals.get(id)!);
      activeIntervals.delete(id);
    }

    const [updated] = await db
      .update(missionsTable)
      .set({ status: "aborted", updatedAt: new Date() })
      .where(eq(missionsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Mission not found", message: "No mission found" });

    await db.insert(activityLogsTable).values({
      missionId: id,
      agentType: "system",
      action: "🛑 Mission aborted by user.",
      details: null,
    });

    res.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      launchedAt: updated.launchedAt?.toISOString() ?? null,
      completedAt: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/missions/:id/activity", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const limit = req.query.limit ? Number(req.query.limit) : 100;

    const logs = await db
      .select()
      .from(activityLogsTable)
      .where(eq(activityLogsTable.missionId, id))
      .orderBy(asc(activityLogsTable.createdAt))
      .limit(limit);

    res.json(
      logs.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/activity/recent", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const logs = await db
      .select()
      .from(activityLogsTable)
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(limit);

    res.json(
      logs.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/overview", async (req, res) => {
  try {
    const allMissions = await db.select().from(missionsTable);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const activeMissions = allMissions.filter((m) => m.status === "running").length;
    const completedMissions = allMissions.filter((m) => m.status === "completed").length;
    const failedMissions = allMissions.filter((m) => m.status === "failed" || m.status === "aborted").length;
    const totalMissions = allMissions.length;

    const agentsRunning = allMissions
      .filter((m) => m.status === "running")
      .reduce((acc, m) => acc + ((m.agents as any[]).filter((a: any) => a.enabled).length), 0);

    const todayLogs = await db
      .select()
      .from(activityLogsTable)
      .where(sql`${activityLogsTable.createdAt} >= ${today}`);

    const yesterdayLogs = await db
      .select()
      .from(activityLogsTable)
      .where(
        and(
          sql`${activityLogsTable.createdAt} >= ${yesterday}`,
          sql`${activityLogsTable.createdAt} < ${today}`
        )
      );

    const tokensUsedToday = allMissions
      .filter((m) => m.launchedAt && m.launchedAt >= today)
      .reduce((acc, m) => acc + (m.tokensUsed || 0), 0);

    const recentActivity = await db
      .select()
      .from(activityLogsTable)
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(15);

    res.json({
      activeMissions,
      completedMissions,
      failedMissions,
      totalMissions,
      agentsRunning,
      tasksCompletedToday: todayLogs.length,
      tasksCompletedYesterday: yesterdayLogs.length,
      tokensUsedToday,
      tokensLimit: 500000,
      recentActivity: recentActivity.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
