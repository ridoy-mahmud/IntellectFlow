import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Activity, Cpu, CheckCircle2, Users, Clock, Target } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { GlassCard, GradientText } from "@/components/ui-glass";
import { useGetAnalyticsOverview, useListMissions } from "@workspace/api-client-react";

function StatBlock({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <GlassCard className="p-6">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-4xl font-bold font-mono text-white mb-1 ${color || ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </GlassCard>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Analytics() {
  const { data: analytics, isLoading } = useGetAnalyticsOverview({ query: { refetchInterval: 15000 } });
  const { data: missions } = useListMissions({ limit: 100 }, { query: { refetchInterval: 15000 } });

  const a = analytics || {
    activeMissions: 0, agentsRunning: 0, tasksCompletedToday: 0, tasksCompletedYesterday: 0,
    tokensUsedToday: 0, tokensLimit: 500000, totalMissions: 0, completedMissions: 0, failedMissions: 0
  };

  const allMissions = missions || [];
  const completedMissions = allMissions.filter(m => m.status === "completed");
  const failedMissions = allMissions.filter(m => m.status === "failed");
  const successRate = allMissions.length > 0
    ? Math.round((completedMissions.length / allMissions.length) * 100)
    : 0;

  const agentUsage: Record<string, number> = {};
  allMissions.forEach(m => {
    (m.agents as any[])?.filter((a: any) => a.enabled).forEach((a: any) => {
      agentUsage[a.agentType] = (agentUsage[a.agentType] || 0) + 1;
    });
  });
  const agentEntries = Object.entries(agentUsage).sort((a, b) => b[1] - a[1]);
  const maxAgentCount = agentEntries[0]?.[1] || 1;

  const categoryUsage: Record<string, number> = {};
  allMissions.forEach(m => {
    const cat = (m as any).category || "General";
    categoryUsage[cat] = (categoryUsage[cat] || 0) + 1;
  });

  const totalTokens = allMissions.reduce((sum, m) => sum + (m.tokensUsed || 0), 0);
  const avgProgress = allMissions.length > 0
    ? Math.round(allMissions.reduce((sum, m) => sum + (m.progress || 0), 0) / allMissions.length)
    : 0;

  const AGENT_COLORS: Record<string, string> = {
    researcher: "bg-indigo-400",
    writer: "bg-purple-400",
    coder: "bg-cyan-400",
    analyst: "bg-emerald-400",
    designer: "bg-amber-400",
    qa_tester: "bg-rose-400",
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" /> Analytics
          </h1>
          <p className="text-muted-foreground">Platform performance metrics and agent activity insights.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Missions", value: isLoading ? "..." : allMissions.length, sub: `${a.activeMissions} currently active` },
            { label: "Success Rate", value: `${successRate}%`, sub: `${completedMissions.length} completed, ${failedMissions.length} failed`, color: successRate >= 80 ? "text-emerald-400" : "text-amber-400" },
            { label: "Total Tokens Used", value: `${(totalTokens / 1000).toFixed(1)}k`, sub: `${(a.tokensUsedToday / 1000).toFixed(1)}k today` },
            { label: "Avg. Completion", value: `${avgProgress}%`, sub: "Average mission progress" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <StatBlock {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Agent Usage */}
          <GlassCard className="p-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Agent Utilization
            </h2>
            {agentEntries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-4">
                {agentEntries.map(([agent, count]) => (
                  <div key={agent}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-white/80 capitalize">{agent.replace("_", " ")}</span>
                      <span className="font-mono text-white font-bold">{count}</span>
                    </div>
                    <MiniBar value={count} max={maxAgentCount} color={AGENT_COLORS[agent] || "bg-white/30"} />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Mission Status Breakdown */}
          <GlassCard className="p-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" /> Mission Status
            </h2>
            {allMissions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No missions yet</p>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Running", key: "running", color: "bg-cyan-400", textColor: "text-cyan-400" },
                  { label: "Completed", key: "completed", color: "bg-emerald-400", textColor: "text-emerald-400" },
                  { label: "Paused", key: "paused", color: "bg-amber-400", textColor: "text-amber-400" },
                  { label: "Failed", key: "failed", color: "bg-rose-400", textColor: "text-rose-400" },
                  { label: "Aborted", key: "aborted", color: "bg-red-600", textColor: "text-red-400" },
                  { label: "Draft", key: "draft", color: "bg-gray-400", textColor: "text-gray-400" },
                ].map(({ label, key, color, textColor }) => {
                  const count = allMissions.filter(m => m.status === key).length;
                  if (count === 0) return null;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-white/80">{label}</span>
                        <span className={`font-mono font-bold ${textColor}`}>{count}</span>
                      </div>
                      <MiniBar value={count} max={allMissions.length} color={color} />
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Category Breakdown */}
          <GlassCard className="p-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" /> By Category
            </h2>
            {Object.keys(categoryUsage).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(categoryUsage).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-white/80">{cat}</span>
                      <span className="font-mono text-white font-bold">{count}</span>
                    </div>
                    <MiniBar value={count} max={allMissions.length} color="bg-gradient-to-r from-primary to-secondary" />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Token Usage */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" /> Token Usage by Mission
          </h2>
          {allMissions.filter(m => (m.tokensUsed || 0) > 0).length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No token data yet. Launch a mission to see usage.</p>
          ) : (
            <div className="space-y-3">
              {allMissions
                .filter(m => (m.tokensUsed || 0) > 0)
                .sort((a, b) => (b.tokensUsed || 0) - (a.tokensUsed || 0))
                .slice(0, 8)
                .map(m => {
                  const maxTokens = Math.max(...allMissions.map(m2 => m2.tokensUsed || 0));
                  return (
                    <div key={m.id} className="flex items-center gap-4">
                      <span className="text-sm text-white/70 w-48 truncate shrink-0">{m.name}</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-700"
                          style={{ width: `${((m.tokensUsed || 0) / maxTokens) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-white/60 w-16 text-right shrink-0">
                        {((m.tokensUsed || 0) / 1000).toFixed(1)}k
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </GlassCard>

        {/* Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Clock, label: "Total Agent Time", value: `${allMissions.reduce((sum, m) => sum + ((m.elapsedSeconds || 0) / 60), 0).toFixed(0)}m`, color: "text-cyan-400" },
            { icon: TrendingUp, label: "Mission Success Rate", value: `${successRate}%`, color: successRate >= 80 ? "text-emerald-400" : "text-amber-400" },
            { icon: CheckCircle2, label: "Completed Missions", value: completedMissions.length, color: "text-emerald-400" },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
