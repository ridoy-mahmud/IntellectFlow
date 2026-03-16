import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Clock, Cpu, SortDesc, FolderKanban } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { GlassCard, StatusBadge, AgentBadge, CyberButton } from "@/components/ui-glass";
import { useListMissions } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";

const STATUSES = ["all", "running", "paused", "completed", "failed", "aborted", "draft"];

function formatElapsed(seconds: number): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Projects() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: missions, isLoading } = useListMissions(
    { status: statusFilter === "all" ? undefined : statusFilter, limit: 100 },
    { query: { refetchInterval: 10000 } }
  );

  const filtered = (missions || []).filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <FolderKanban className="w-7 h-7 text-primary" /> Projects
            </h1>
            <p className="text-muted-foreground">All missions and their current status.</p>
          </div>
          <Link href="/dashboard/new-mission">
            <CyberButton variant="primary">
              <Plus className="w-4 h-4" /> New Mission
            </CyberButton>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search missions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border capitalize transition-all ${
                  statusFilter === s
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-white/4 border-white/10 text-muted-foreground hover:text-white hover:bg-white/8"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Missions Table/Grid */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/4 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard className="p-16 text-center">
            <FolderKanban className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-lg font-medium text-white mb-2">No missions found</p>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? `No results for "${search}"` : "Create your first mission to get started."}
            </p>
            {!search && (
              <Link href="/dashboard/new-mission">
                <CyberButton variant="primary" className="mx-auto">
                  <Plus className="w-4 h-4" /> New Mission
                </CyberButton>
              </Link>
            )}
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {filtered.map((mission, i) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/dashboard/mission/${mission.id}`}>
                  <GlassCard className="p-5 hover:bg-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors truncate">
                            {mission.name}
                          </h3>
                          <StatusBadge status={mission.status} />
                          <span className="text-xs text-muted-foreground hidden sm:block capitalize px-2 py-0.5 bg-white/5 rounded border border-white/10">
                            {mission.priority || "medium"} priority
                          </span>
                        </div>
                        {mission.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-lg">{mission.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {formatElapsed(mission.elapsedSeconds || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5" /> {(mission.tokensUsed || 0).toLocaleString()} tokens
                          </span>
                          <span>{formatDistanceToNow(new Date(mission.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex gap-1 flex-wrap">
                          {(mission.agents as any[])?.filter((a: any) => a.enabled).map((a: any, idx: number) => (
                            <AgentBadge key={idx} type={a.agentType} />
                          ))}
                        </div>

                        <div className="flex flex-col items-end gap-1 min-w-[70px]">
                          <span className="text-sm font-mono font-bold text-white">{Math.round(mission.progress || 0)}%</span>
                          <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                              style={{ width: `${mission.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Showing {filtered.length} mission{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
