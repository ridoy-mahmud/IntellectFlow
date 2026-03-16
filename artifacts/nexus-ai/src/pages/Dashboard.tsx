import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, Activity, Clock, Users, CheckCircle2, Cpu, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { GlassCard, AgentBadge, StatusBadge, CyberButton } from "@/components/ui-glass";
import { useListMissions, useGetAnalyticsOverview, useGetRecentActivity } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";

function formatElapsed(seconds: number): string {
  if (!seconds) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Dashboard() {
  const { data: analytics, isLoading: isLoadingAnalytics, refetch: refetchAnalytics } = useGetAnalyticsOverview({
    query: { refetchInterval: 10000 }
  });
  const { data: missions, isLoading: isLoadingMissions } = useListMissions(
    { status: "all", limit: 6 },
    { query: { refetchInterval: 8000 } }
  );
  const { data: recentActivity, isLoading: isLoadingActivity } = useGetRecentActivity(
    { limit: 15 },
    { query: { refetchInterval: 6000 } }
  );

  const a = analytics || { activeMissions: 0, agentsRunning: 0, tasksCompletedToday: 0, tasksCompletedYesterday: 0, tokensUsedToday: 0, tokensLimit: 500000, totalMissions: 0, completedMissions: 0, failedMissions: 0, recentActivity: [] };

  const todayVsYesterday = a.tasksCompletedYesterday > 0
    ? Math.round(((a.tasksCompletedToday - a.tasksCompletedYesterday) / a.tasksCompletedYesterday) * 100)
    : 0;

  const stats = [
    {
      title: "Active Missions",
      value: a.activeMissions,
      icon: Activity,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10 border-cyan-400/20",
      trend: a.totalMissions > 0 ? `${a.totalMissions} total` : null,
    },
    {
      title: "Agents Running",
      value: a.agentsRunning,
      icon: Users,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10 border-indigo-400/20",
      trend: a.agentsRunning > 0 ? "Online now" : "All idle",
    },
    {
      title: "Tasks Today",
      value: a.tasksCompletedToday,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/20",
      trend: todayVsYesterday !== 0 ? `${todayVsYesterday > 0 ? "+" : ""}${todayVsYesterday}% vs yesterday` : null,
      trendUp: todayVsYesterday >= 0,
    },
    {
      title: "Tokens Used",
      value: `${(a.tokensUsedToday / 1000).toFixed(1)}k`,
      icon: Cpu,
      color: "text-purple-400",
      bg: "bg-purple-400/10 border-purple-400/20",
      trend: `${Math.round((a.tokensUsedToday / (a.tokensLimit || 500000)) * 100)}% of limit`,
    },
  ];

  const activeMissions = missions?.filter(m => m.status === "running" || m.status === "paused") || [];
  const allMissions = missions || [];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Mission Control</h1>
            <p className="text-muted-foreground">Overview of your autonomous agents and active missions.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetchAnalytics()}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link href="/dashboard/new-mission">
              <CyberButton variant="primary">
                <Plus className="w-4 h-4" />
                New Mission
              </CyberButton>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard className="p-5 group hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-muted-foreground">{s.title}</p>
                  <div className={`p-2 rounded-lg border ${s.bg} ${s.color} group-hover:scale-110 transition-transform`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white font-mono mb-2">
                  {isLoadingAnalytics ? <span className="animate-pulse">...</span> : s.value}
                </h3>
                {s.trend && (
                  <div className={`flex items-center gap-1 text-xs ${
                    "trendUp" in s ? (s.trendUp ? "text-emerald-400" : "text-rose-400") : "text-muted-foreground"
                  }`}>
                    {"trendUp" in s && (s.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                    {s.trend}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Main Grid: Missions + Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Active Missions */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Active Missions
              </h2>
              <Link href="/dashboard/projects">
                <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  View All <span className="text-xs text-muted-foreground">({allMissions.length})</span>
                </button>
              </Link>
            </div>

            {isLoadingMissions ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                ))}
              </div>
            ) : activeMissions.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No active missions</p>
                <p className="text-muted-foreground/60 text-sm mb-6">Launch a new mission to get started</p>
                <Link href="/dashboard/new-mission">
                  <CyberButton variant="primary" className="mx-auto">
                    <Plus className="w-4 h-4" /> New Mission
                  </CyberButton>
                </Link>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {activeMissions.map((mission, i) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <Link href={`/dashboard/mission/${mission.id}`}>
                      <GlassCard className="p-5 hover:bg-white/5 transition-all duration-200 group cursor-pointer hover:border-primary/30 hover:-translate-y-0.5">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="flex-1 space-y-3 w-full">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">{mission.name}</h3>
                              <StatusBadge status={mission.status} />
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {formatElapsed(mission.elapsedSeconds || 0)} elapsed
                              </div>
                              <div className="flex gap-1 flex-wrap">
                                {(mission.agents as any[])?.filter((a: any) => a.enabled).map((a: any, idx: number) => (
                                  <AgentBadge key={idx} type={a.agentType} />
                                ))}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="text-primary font-mono">{Math.round(mission.progress || 0)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                                  style={{ width: `${mission.progress || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <div className="px-4 py-2 bg-white/5 hover:bg-primary/10 text-white rounded-lg text-sm font-medium border border-white/10 hover:border-primary/30 transition-colors">
                              Monitor →
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recent Completed Missions */}
            {allMissions.filter(m => m.status === "completed" || m.status === "failed" || m.status === "aborted").length > 0 && (
              <div className="mt-8 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Projects</h3>
                {allMissions
                  .filter(m => m.status === "completed" || m.status === "failed" || m.status === "aborted")
                  .slice(0, 3)
                  .map((mission) => (
                    <Link key={mission.id} href={`/dashboard/mission/${mission.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={mission.status} />
                          <span className="text-sm text-white/80 group-hover:text-white transition-colors">{mission.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-mono">{Math.round(mission.progress || 0)}%</span>
                          <span>{formatDistanceToNow(new Date(mission.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {/* Live Activity Feed */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" /> Live Activity
              {!isLoadingActivity && <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />}
            </h2>

            <GlassCard className="p-5 h-[520px] flex flex-col">
              <div className="flex-1 overflow-y-auto pr-1 space-y-5 relative scrollbar-thin">
                {isLoadingActivity ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-white/5 rounded w-1/3" />
                          <div className="h-10 bg-white/5 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (!recentActivity || recentActivity.length === 0) ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Activity className="w-10 h-10 text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground text-sm">No activity yet</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Launch a mission to see live agent activity</p>
                  </div>
                ) : (
                  recentActivity.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3 relative"
                    >
                      <div className="w-7 h-7 rounded-full bg-background border border-border/50 flex items-center justify-center shrink-0 z-10 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                          <AgentBadge type={log.agentType} />
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed bg-white/4 p-2.5 rounded-lg border border-white/5">
                          {log.action}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              {recentActivity && recentActivity.length > 0 && (
                <div className="pt-3 border-t border-border/30 mt-3 text-center">
                  <span className="text-xs text-muted-foreground">Auto-refreshing every 6s</span>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
