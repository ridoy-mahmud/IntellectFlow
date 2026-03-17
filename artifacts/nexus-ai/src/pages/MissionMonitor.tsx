import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  Download,
  Activity,
  Cpu,
  Code2,
  MessageSquare,
  Terminal,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  PenLine,
  BarChart2,
  Palette,
  TestTube2,
  Clock,
  Video,
  FileText,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import {
  GlassCard,
  StatusBadge,
  CyberButton,
  AgentBadge,
} from "@/components/ui-glass";
import {
  useGetMission,
  useGetMissionActivity,
  usePauseMission,
  useResumeMission,
  useAbortMission,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";

const AGENT_COLORS: Record<string, string> = {
  researcher: "text-indigo-400",
  writer: "text-purple-400",
  coder: "text-cyan-400",
  analyst: "text-emerald-400",
  designer: "text-amber-400",
  qa_tester: "text-rose-400",
  system: "text-white/60",
};

const AGENT_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  researcher: Search,
  writer: PenLine,
  coder: Code2,
  analyst: BarChart2,
  designer: Palette,
  qa_tester: TestTube2,
  system: Activity,
};

function formatElapsed(seconds: number): string {
  if (!seconds) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatRelativeDate(value: unknown): string {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return "just now";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

function formatClockTime(value: unknown): string {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return "--:--:--";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--:--:--";
  }
  return format(date, "HH:mm:ss");
}

function downloadResultFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function MissionMonitor() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const missionId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  const terminalRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const tab = new URLSearchParams(search).get("tab");
    return tab === "results" ? "results" : "terminal";
  });
  const [elapsed, setElapsed] = useState(0);

  const {
    data: mission,
    isLoading,
    error,
  } = useGetMission(missionId, {
    query: {
      refetchInterval: (query) => {
        const data = query.state.data as any;
        if (data?.status === "running" || data?.status === "paused")
          return 4000;
        return false;
      },
    },
  });

  const { data: activityLogs, refetch: refetchLogs } = useGetMissionActivity(
    missionId,
    { limit: 100 },
    {
      query: {
        refetchInterval: (query) => {
          return 5000;
        },
      },
    },
  );

  const pauseMut = usePauseMission();
  const resumeMut = useResumeMission();
  const abortMut = useAbortMission();

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current && activeTab === "terminal") {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activityLogs, activeTab]);

  // Live elapsed time ticker for running missions
  useEffect(() => {
    if (!mission) return;
    setElapsed(mission.elapsedSeconds || 0);
    if (mission.status !== "running") return;

    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [mission?.status, mission?.elapsedSeconds]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/missions/${missionId}`] });
    queryClient.invalidateQueries({
      queryKey: [`/api/missions/${missionId}/activity`],
    });
    queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
  };

  const handlePause = () => {
    pauseMut.mutate({ id: missionId }, { onSuccess: invalidateAll });
  };

  const handleResume = () => {
    resumeMut.mutate({ id: missionId }, { onSuccess: invalidateAll });
  };

  const handleAbort = () => {
    if (
      !confirm(
        "Are you sure you want to abort this mission? This cannot be undone.",
      )
    )
      return;
    abortMut.mutate({ id: missionId }, { onSuccess: invalidateAll });
  };

  if (isLoading && !mission) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading mission data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !mission) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-center">
          <AlertTriangle className="w-16 h-16 text-rose-400/50" />
          <h2 className="text-xl font-bold text-white">Mission Not Found</h2>
          <p className="text-muted-foreground max-w-sm">
            We couldn't find mission NX-{missionId}. It may have been removed.
          </p>
          <CyberButton
            variant="outline"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </CyberButton>
        </div>
      </DashboardLayout>
    );
  }

  const m = mission!;
  const logs = activityLogs || [];
  const agents: any[] = (m.agents as any[]) || [];
  const isMutating =
    pauseMut.isPending || resumeMut.isPending || abortMut.isPending;
  const researchLogs = logs
    .filter((l) => l.agentType === "researcher")
    .slice(-3);
  const writerLogs = logs.filter((l) => l.agentType === "writer").slice(-3);
  const codeLogs = logs.filter((l) => l.agentType === "coder").slice(-3);
  const videoLogs = logs.filter((l) => /video|clip|record|render/i.test(l.action));

  const resultPayload = {
    mission: {
      id: missionId,
      name: m.name,
      status: m.status,
      progress: Math.round(m.progress || 0),
      tokensUsed: m.tokensUsed || 0,
      elapsedSeconds: m.elapsedSeconds || 0,
      createdAt: m.createdAt,
      completedAt: m.completedAt,
    },
    outputs: {
      research: researchLogs.map((log) => ({ id: log.id, createdAt: log.createdAt, action: log.action })),
      writing: writerLogs.map((log) => ({ id: log.id, createdAt: log.createdAt, action: log.action })),
      code: codeLogs.map((log) => ({ id: log.id, createdAt: log.createdAt, action: log.action })),
      video: videoLogs.map((log) => ({ id: log.id, createdAt: log.createdAt, action: log.action })),
    },
    totalActivityEvents: logs.length,
  };

  const handleDownloadJson = () => {
    downloadResultFile(
      `mission-${missionId}-results.json`,
      JSON.stringify(resultPayload, null, 2),
      "application/json;charset=utf-8",
    );
  };

  const handleDownloadText = () => {
    const text = [
      `Mission NX-${missionId} - ${m.name}`,
      `Status: ${m.status}`,
      `Progress: ${Math.round(m.progress || 0)}%`,
      `Tokens Used: ${(m.tokensUsed || 0).toLocaleString()}`,
      "",
      "Research Results:",
      ...(researchLogs.length
        ? researchLogs.map((log) => `- [${formatClockTime(log.createdAt)}] ${log.action}`)
        : ["- No research output captured."]),
      "",
      "Text Results:",
      ...(writerLogs.length
        ? writerLogs.map((log) => `- [${formatClockTime(log.createdAt)}] ${log.action}`)
        : ["- No writer output captured."]),
      "",
      "Code Results:",
      ...(codeLogs.length
        ? codeLogs.map((log) => `- [${formatClockTime(log.createdAt)}] ${log.action}`)
        : ["- No code output captured."]),
      "",
      "Video Results:",
      ...(videoLogs.length
        ? videoLogs.map((log) => `- [${formatClockTime(log.createdAt)}] ${log.action}`)
        : ["- No video artifact events captured."]),
    ].join("\n");

    downloadResultFile(
      `mission-${missionId}-results.txt`,
      text,
      "text/plain;charset=utf-8",
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="shrink-0 p-5 border-b border-border bg-background/50 backdrop-blur-md z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setLocation("/dashboard")}
                className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors mt-0.5 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <h1 className="text-xl font-bold text-white">{m.name}</h1>
                  <StatusBadge status={m.status} />
                  {isMutating && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  )}
                </div>
                <div className="flex items-center gap-5 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Activity className="w-3.5 h-3.5" /> NX-{missionId}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />{" "}
                    {(m.tokensUsed || 0).toLocaleString()} tokens
                  </span>
                  <span className="flex items-center gap-1.5 text-primary font-mono">
                    <Clock className="w-3.5 h-3.5" /> {formatElapsed(elapsed)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {m.status === "running" && (
                <CyberButton
                  variant="outline"
                  onClick={handlePause}
                  disabled={isMutating}
                  className="text-sm py-2 px-4"
                >
                  <Pause className="w-4 h-4 mr-1.5" /> Pause
                </CyberButton>
              )}
              {m.status === "paused" && (
                <CyberButton
                  variant="primary"
                  onClick={handleResume}
                  disabled={isMutating}
                  className="text-sm py-2 px-4"
                >
                  <Play className="w-4 h-4 mr-1.5" /> Resume
                </CyberButton>
              )}
              <CyberButton
                variant="danger"
                onClick={handleAbort}
                disabled={
                  isMutating ||
                  m.status === "aborted" ||
                  m.status === "completed" ||
                  m.status === "failed"
                }
                className="text-sm py-2 px-4"
              >
                <Square className="w-4 h-4 mr-1.5" /> Abort
              </CyberButton>
              <button
                onClick={() => {
                  invalidateAll();
                  refetchLogs();
                }}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {(m.status === "completed" || m.status === "failed") && (
                <CyberButton
                  variant="outline"
                  onClick={() => setActiveTab("results")}
                  className="text-sm py-2 px-4"
                >
                  <Download className="w-4 h-4 mr-1.5" /> Results
                </CyberButton>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-white w-10 text-right">
              {Math.round(m.progress || 0)}%
            </span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${m.progress || 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {m.status === "running" && (
                  <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-[slide_2s_linear_infinite]" />
                )}
              </motion.div>
            </div>
            {m.status === "completed" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            {m.status === "failed" && (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
          </div>
        </div>

        {/* Main 3-Column Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left: Agents Panel */}
          <div className="w-full lg:w-64 xl:w-72 shrink-0 border-r border-border bg-card/30 p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Agent Swarm (
              {agents.filter((a: any) => a.enabled).length})
            </h3>
            <div className="space-y-3">
              {agents.filter((a: any) => a.enabled).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No agents configured
                </p>
              ) : (
                agents
                  .filter((a: any) => a.enabled)
                  .map((agent: any, i: number) => {
                    const Icon = AGENT_ICONS[agent.agentType] || Activity;
                    const color =
                      AGENT_COLORS[agent.agentType] || "text-white/60";
                    const recentLog = logs
                      .filter((l) => l.agentType === agent.agentType)
                      .at(-1);
                    return (
                      <GlassCard
                        key={i}
                        className={`p-4 border-l-2 ${m.status === "running" ? "border-l-primary/60" : "border-l-border"}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <AgentBadge type={agent.agentType} />
                          {m.status === "running" && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {agent.model || "Auto-selected"}
                        </div>
                        {recentLog && (
                          <div
                            className={`text-xs font-mono ${color} bg-background/50 p-2 rounded border border-white/5 line-clamp-2 leading-relaxed`}
                          >
                            &gt; {recentLog.action.slice(0, 80)}
                          </div>
                        )}
                      </GlassCard>
                    );
                  })
              )}
            </div>
          </div>

          {/* Center: Output Panel */}
          <div className="flex-1 flex flex-col bg-background/95 min-w-0">
            {/* Tabs */}
            <div className="flex border-b border-border shrink-0">
              {[
                { id: "terminal", icon: Terminal, label: "Live Terminal" },
                { id: "code", icon: Code2, label: "Code View" },
                { id: "chat", icon: MessageSquare, label: "Agent Comms" },
                { id: "results", icon: Download, label: "Results" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-white hover:bg-white/4"
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "terminal" && (
                  <motion.div
                    key="terminal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full overflow-y-auto p-5 font-mono text-sm space-y-1.5"
                    ref={terminalRef}
                  >
                    <p className="text-white/40 text-xs mb-3">
                      — Mission NX-{missionId} Terminal Output —
                    </p>
                    {logs.length === 0 ? (
                      <p className="text-muted-foreground">
                        Waiting for agent activity...
                      </p>
                    ) : (
                      logs.map((log, i) => {
                        const color =
                          AGENT_COLORS[log.agentType] || "text-white/60";
                        return (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.02, 0.3) }}
                          >
                            <span className="text-white/30 text-xs mr-2">
                              {formatClockTime(log.createdAt)}
                            </span>
                            <span className={`font-bold ${color} mr-2`}>
                              [{log.agentType.toUpperCase().replace("_", "-")}]
                            </span>
                            <span className="text-white/80">{log.action}</span>
                          </motion.div>
                        );
                      })
                    )}
                    {m.status === "running" && (
                      <p className="text-primary animate-pulse mt-2">▌</p>
                    )}
                  </motion.div>
                )}

                {activeTab === "code" && (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full overflow-y-auto p-5"
                  >
                    {logs.filter((l) => l.agentType === "coder").length ===
                    0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Code2 className="w-10 h-10 opacity-20 mb-3" />
                        <p className="text-sm">No code output yet</p>
                        <p className="text-xs mt-1 opacity-60">
                          Code generated by the Coder agent will appear here
                        </p>
                      </div>
                    ) : (
                      <pre className="text-emerald-400 bg-black/40 p-5 rounded-xl border border-white/5 overflow-x-auto text-sm leading-relaxed">
                        <code>
                          {logs
                            .filter((l) => l.agentType === "coder")
                            .map(
                              (l) =>
                                `// [${formatClockTime(l.createdAt)}]\n// ${l.action}`,
                            )
                            .join("\n\n")}
                        </code>
                      </pre>
                    )}
                  </motion.div>
                )}

                {activeTab === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full overflow-y-auto p-5 space-y-4"
                  >
                    {logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <MessageSquare className="w-10 h-10 opacity-20 mb-3" />
                        <p className="text-sm">No agent communications yet</p>
                      </div>
                    ) : (
                      logs.map((log, i) => {
                        const color =
                          AGENT_COLORS[log.agentType] || "text-white/60";
                        return (
                          <div
                            key={log.id}
                            className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0 ${color}`}
                            >
                              <span className="text-[10px] font-bold">
                                {log.agentType.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div
                              className={`max-w-[75%] ${i % 2 === 0 ? "" : "items-end"}`}
                            >
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <AgentBadge type={log.agentType} />
                                <span className="text-[10px] text-muted-foreground">
                                  {formatRelativeDate(log.createdAt)}
                                </span>
                              </div>
                              <p
                                className={`text-sm text-white/80 p-3 rounded-2xl border border-white/5 leading-relaxed ${
                                  i % 2 === 0
                                    ? "bg-white/5 rounded-tl-none"
                                    : "bg-primary/10 rounded-tr-none"
                                }`}
                              >
                                {log.action}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </motion.div>
                )}

                {activeTab === "results" && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full overflow-y-auto p-5 space-y-4"
                  >
                    {m.status !== "completed" && m.status !== "failed" ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Download className="w-10 h-10 opacity-20 mb-3" />
                        <p className="text-sm">
                          Results are generated when a mission finishes.
                        </p>
                      </div>
                    ) : (
                      <>
                        <GlassCard className="p-4 border-emerald-500/20 bg-emerald-500/5">
                          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                            Final Summary
                          </h3>
                          <p className="text-sm text-white/80">
                            Mission{" "}
                            <span className="font-mono">NX-{missionId}</span>{" "}
                            reached {Math.round(m.progress || 0)}% with{" "}
                            {(m.tokensUsed || 0).toLocaleString()} tokens
                            consumed. Review bundles below for handoff.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <CyberButton
                              variant="primary"
                              onClick={handleDownloadJson}
                              className="text-xs py-2 px-3"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" /> Download JSON
                            </CyberButton>
                            <CyberButton
                              variant="outline"
                              onClick={handleDownloadText}
                              className="text-xs py-2 px-3"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" /> Download TXT
                            </CyberButton>
                          </div>
                        </GlassCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <GlassCard className="p-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                              <Video className="w-4 h-4 text-cyan-400" /> Video
                              Result
                            </h3>
                            <ul className="space-y-2 text-xs text-white/80">
                              {videoLogs.length === 0 ? (
                                <li className="text-muted-foreground">
                                  No real video artifact was generated for this mission.
                                </li>
                              ) : (
                                videoLogs.map((log) => (
                                  <li
                                    key={log.id}
                                    className="rounded-md border border-white/10 bg-white/5 p-2"
                                  >
                                    {log.action}
                                  </li>
                                ))
                              )}
                            </ul>
                          </GlassCard>

                          <GlassCard className="p-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                              <FileText className="w-4 h-4 text-amber-400" />{" "}
                              Text Output
                            </h3>
                            <ul className="space-y-2 text-xs text-white/80">
                              {writerLogs.length === 0 ? (
                                <li className="text-muted-foreground">
                                  No writer output captured.
                                </li>
                              ) : (
                                writerLogs.map((log) => (
                                  <li
                                    key={log.id}
                                    className="rounded-md border border-white/10 bg-white/5 p-2"
                                  >
                                    {log.action}
                                  </li>
                                ))
                              )}
                            </ul>
                          </GlassCard>

                          <GlassCard className="p-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                              <Search className="w-4 h-4 text-indigo-400" />{" "}
                              Research Findings
                            </h3>
                            <ul className="space-y-2 text-xs text-white/80">
                              {researchLogs.length === 0 ? (
                                <li className="text-muted-foreground">
                                  No research highlights captured.
                                </li>
                              ) : (
                                researchLogs.map((log) => (
                                  <li
                                    key={log.id}
                                    className="rounded-md border border-white/10 bg-white/5 p-2"
                                  >
                                    {log.action}
                                  </li>
                                ))
                              )}
                            </ul>
                          </GlassCard>

                          <GlassCard className="p-4">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                              <Code2 className="w-4 h-4 text-emerald-400" />{" "}
                              Code Deliverables
                            </h3>
                            <ul className="space-y-2 text-xs text-white/80">
                              {codeLogs.length === 0 ? (
                                <li className="text-muted-foreground">
                                  No code snippets captured.
                                </li>
                              ) : (
                                codeLogs.map((log) => (
                                  <li
                                    key={log.id}
                                    className="rounded-md border border-white/10 bg-white/5 p-2"
                                  >
                                    {log.action}
                                  </li>
                                ))
                              )}
                            </ul>
                          </GlassCard>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Mission Log */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 border-l border-border bg-card/30 flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Mission Log
              </h3>
              <span className="text-xs text-muted-foreground">
                {logs.length} events
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-5 relative min-h-0">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Activity className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-xs">No events yet</p>
                </div>
              ) : (
                [...logs].reverse().map((log) => {
                  const color = AGENT_COLORS[log.agentType] || "text-white/60";
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 relative"
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-background border-2 mt-0.5 shrink-0 flex items-center justify-center border-primary/40`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span
                            className={`text-xs font-bold capitalize ${color}`}
                          >
                            {log.agentType.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                            {formatRelativeDate(log.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed break-words">
                          {log.action}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Mission Stats Footer */}
            <div className="p-4 border-t border-border space-y-2.5 shrink-0">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Stats
              </h4>
              {[
                {
                  label: "Tokens Used",
                  value: (m.tokensUsed || 0).toLocaleString(),
                },
                { label: "Progress", value: `${Math.round(m.progress || 0)}%` },
                { label: "Duration", value: formatElapsed(elapsed) },
                {
                  label: "Priority",
                  value: m.priority || "medium",
                  className: "capitalize",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{stat.label}</span>
                  <span
                    className={`text-white font-mono font-medium ${stat.className || ""}`}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
