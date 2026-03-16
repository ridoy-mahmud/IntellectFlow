import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Key, Bell, Shield, Cpu, Save, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { GlassCard, CyberButton } from "@/components/ui-glass";

interface SettingSection {
  id: string;
  label: string;
  icon: React.ComponentType<{className?: string}>;
}

const SECTIONS: SettingSection[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "api", label: "API Keys", icon: Key },
  { id: "models", label: "AI Models", icon: Cpu },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Commander Jane",
    email: "jane@intellectflow.io",
    role: "Admin",
    timezone: "UTC",
  });

  const [models, setModels] = useState({
    defaultModel: "GPT-4o",
    fallbackModel: "Claude 3.5 Sonnet",
    maxTokensPerRun: 100000,
    temperature: 0.7,
  });

  const [notifications, setNotifications] = useState({
    missionComplete: true,
    missionFailed: true,
    agentActivity: false,
    weeklyReport: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-primary" /> Settings
          </h1>
          <p className="text-muted-foreground">Manage your account, API keys, and platform preferences.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Section nav */}
          <div className="sm:w-48 shrink-0">
            <GlassCard className="p-2">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </GlassCard>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === "profile" && (
                <GlassCard className="p-6 space-y-5">
                  <h2 className="text-lg font-bold text-white">Profile Settings</h2>
                  <div className="flex items-center gap-5 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                      alt="Avatar"
                      className="w-16 h-16 rounded-full border-2 border-primary/30"
                    />
                    <button className="text-sm text-primary hover:text-primary/80 transition-colors">Change photo</button>
                  </div>
                  {Object.entries(profile).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-white mb-2 capitalize">{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-all text-sm"
                      />
                    </div>
                  ))}
                </GlassCard>
              )}

              {activeSection === "api" && (
                <GlassCard className="p-6 space-y-5">
                  <h2 className="text-lg font-bold text-white">API Keys</h2>
                  <p className="text-sm text-muted-foreground">Configure your LLM provider API keys to use real AI models.</p>
                  {[
                    { label: "OpenAI API Key", placeholder: "sk-..." },
                    { label: "Anthropic API Key", placeholder: "sk-ant-..." },
                    { label: "Google AI API Key", placeholder: "AIza..." },
                  ].map(({ label, placeholder }) => (
                    <div key={label}>
                      <label className="block text-sm font-semibold text-white mb-2">{label}</label>
                      <input
                        type="password"
                        placeholder={placeholder}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-all text-sm font-mono"
                      />
                    </div>
                  ))}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400">
                    API keys are encrypted at rest and never logged in plaintext.
                  </div>
                </GlassCard>
              )}

              {activeSection === "models" && (
                <GlassCard className="p-6 space-y-5">
                  <h2 className="text-lg font-bold text-white">AI Model Configuration</h2>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Default Model</label>
                    <select
                      value={models.defaultModel}
                      onChange={e => setModels(m => ({ ...m, defaultModel: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary appearance-none"
                    >
                      {["GPT-4o", "Claude 3.5 Sonnet", "Gemini 1.5 Pro", "Llama 3.1 70B"].map(m => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Fallback Model</label>
                    <select
                      value={models.fallbackModel}
                      onChange={e => setModels(m => ({ ...m, fallbackModel: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary appearance-none"
                    >
                      {["Claude 3.5 Sonnet", "GPT-4o", "Gemini 1.5 Pro", "GPT-3.5 Turbo"].map(m => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Default Temperature: <span className="text-primary">{models.temperature}</span>
                    </label>
                    <input
                      type="range"
                      min="0" max="1" step="0.1"
                      value={models.temperature}
                      onChange={e => setModels(m => ({ ...m, temperature: parseFloat(e.target.value) }))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Precise (0)</span>
                      <span>Creative (1)</span>
                    </div>
                  </div>
                </GlassCard>
              )}

              {activeSection === "notifications" && (
                <GlassCard className="p-6 space-y-5">
                  <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
                  {Object.entries(notifications).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      missionComplete: "Mission Completed",
                      missionFailed: "Mission Failed",
                      agentActivity: "Agent Activity Updates",
                      weeklyReport: "Weekly Analytics Report",
                    };
                    return (
                      <div key={key} className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
                        <div>
                          <p className="text-sm font-medium text-white">{labels[key] || key}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Receive email + in-app notification</p>
                        </div>
                        <button
                          onClick={() => setNotifications(n => ({ ...n, [key]: !value }))}
                          className={`w-12 h-6 rounded-full border-2 transition-all relative ${
                            value ? "bg-primary border-primary" : "bg-white/10 border-white/20"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
                            value ? "left-[calc(100%-1.25rem)]" : "left-0.5"
                          }`} />
                        </button>
                      </div>
                    );
                  })}
                </GlassCard>
              )}

              {activeSection === "security" && (
                <GlassCard className="p-6 space-y-5">
                  <h2 className="text-lg font-bold text-white">Security</h2>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Current Password</label>
                    <input type="password" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">New Password</label>
                    <input type="password" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary" />
                  </div>
                  <div className="pt-2 border-t border-border">
                    <h3 className="text-sm font-bold text-white mb-3">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">Authenticator App</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Use an authenticator app for 2FA</p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">Not configured</span>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Save Button */}
              <div className="mt-5 flex justify-end">
                <CyberButton variant="primary" onClick={handleSave} className="gap-2">
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </CyberButton>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
