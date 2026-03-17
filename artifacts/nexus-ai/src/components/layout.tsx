import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  LayoutDashboard,
  FolderKanban,
  Cpu,
  Network,
  BarChart3,
  BookOpen,
  Settings,
  Search,
  Bell,
  Menu,
  Plus,
  X,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn, GlassCard, GradientText } from "./ui-glass";
import {
  useListMissions,
  useGetRecentActivity,
  useGetAnalyticsOverview,
} from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Mission Control",
  "/dashboard/new-mission": "New Mission",
  "/dashboard/projects": "Projects",
  "/dashboard/agents": "Agent Studio",
  "/dashboard/workflows": "Workflows",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
  "/dashboard/documentation": "Documentation",
};

function getBreadcrumb(location: string) {
  const label = PAGE_LABELS[location];
  if (label) return label;
  // Mission monitor pattern
  if (location.startsWith("/dashboard/mission/")) {
    return "Mission Monitor";
  }
  return location.split("/").pop()?.replace(/-/g, " ") || "";
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

// Search overlay component
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: missions } = useListMissions({ limit: 100 });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results =
    query.trim().length >= 2
      ? (missions || [])
          .filter(
            (m) =>
              m.name.toLowerCase().includes(query.toLowerCase()) ||
              m.description?.toLowerCase().includes(query.toLowerCase()) ||
              m.status.toLowerCase().includes(query.toLowerCase()) ||
              m.category?.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 6)
      : [];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="overflow-hidden border-primary/20">
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search missions, agents, or logs..."
              className="flex-1 bg-transparent text-white placeholder:text-muted-foreground outline-none text-base"
            />
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 border border-white/20 text-muted-foreground">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {query.trim().length < 2 ? (
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">
                Quick Navigation
              </p>
              <div className="space-y-1">
                {[
                  {
                    label: "Mission Control",
                    path: "/dashboard",
                    icon: LayoutDashboard,
                  },
                  {
                    label: "New Mission",
                    path: "/dashboard/new-mission",
                    icon: Plus,
                  },
                  {
                    label: "Projects",
                    path: "/dashboard/projects",
                    icon: FolderKanban,
                  },
                  {
                    label: "Analytics",
                    path: "/dashboard/analytics",
                    icon: BarChart3,
                  },
                  {
                    label: "Agent Studio",
                    path: "/dashboard/agents",
                    icon: Cpu,
                  },
                  {
                    label: "Documentation",
                    path: "/dashboard/documentation",
                    icon: BookOpen,
                  },
                ].map((item) => (
                  <Link key={item.path} href={item.path} onClick={onClose}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-all cursor-pointer">
                      <item.icon className="w-4 h-4 text-primary" />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No missions found for "
                <span className="text-white">{query}</span>"
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <p className="text-xs text-muted-foreground px-3 pt-2 pb-1 font-semibold uppercase tracking-wider">
                Missions ({results.length})
              </p>
              {results.map((m) => (
                <Link
                  key={m.id}
                  href={`/dashboard/mission/${m.id}`}
                  onClick={onClose}
                >
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer group">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        m.status === "running"
                          ? "bg-cyan-400 animate-pulse"
                          : m.status === "completed"
                            ? "bg-emerald-400"
                            : m.status === "failed"
                              ? "bg-rose-400"
                              : "bg-gray-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 group-hover:text-white truncate">
                        {m.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {m.status} · {m.category || "General"}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-primary">
                      {Math.round(m.progress || 0)}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-border bg-white/2 flex items-center justify-between text-[10px] text-muted-foreground px-4">
            <span>Type at least 2 characters to search missions</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20">
                  ↵
                </kbd>{" "}
                select
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

// Notification panel
function NotificationPanel({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: recentActivity } = useGetRecentActivity({ limit: 12 });
  const activityList = Array.isArray(recentActivity) ? recentActivity : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const AGENT_COLORS: Record<string, string> = {
    researcher: "text-indigo-400",
    writer: "text-purple-400",
    coder: "text-cyan-400",
    analyst: "text-emerald-400",
    designer: "text-amber-400",
    qa_tester: "text-rose-400",
    system: "text-white/50",
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full right-0 mt-2 w-96 z-[100]"
    >
      <GlassCard className="overflow-hidden border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Notifications
            {activityList.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {Math.min(activityList.length, 9)}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {activityList.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Launch a mission to see agent notifications
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {activityList.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-3 p-3 hover:bg-white/3 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      log.agentType === "system"
                        ? "bg-white/30"
                        : "bg-primary animate-pulse"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs font-bold capitalize ${AGENT_COLORS[log.agentType] || "text-white/60"}`}
                      >
                        {log.agentType.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeDate(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                      {log.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {activityList.length > 0 && (
          <div className="p-3 border-t border-border">
            <Link href="/dashboard" onClick={onClose}>
              <button className="w-full text-xs text-primary hover:text-primary/80 transition-colors text-center">
                View all in Mission Control →
              </button>
            </Link>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  useListMissions(
    { status: "all", limit: 100 },
    { query: { staleTime: 30000 } as any },
  );
  useGetAnalyticsOverview({ query: { staleTime: 30000 } as any });
  const { data: recentActivity } = useGetRecentActivity(
    { limit: 5 },
    { query: { refetchInterval: 15000 } },
  );
  const activityList = Array.isArray(recentActivity) ? recentActivity : [];

  const hasNotifications = activityList.length > 0;

  const navItems = [
    { icon: LayoutDashboard, label: "Mission Control", path: "/dashboard" },
    { icon: FolderKanban, label: "Projects", path: "/dashboard/projects" },
    { icon: Cpu, label: "Agent Studio", path: "/dashboard/agents" },
    { icon: Network, label: "Workflows", path: "/dashboard/workflows" },
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    {
      icon: BookOpen,
      label: "Documentation",
      path: "/dashboard/documentation",
    },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  // ⌘K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setNotifOpen(false);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const breadcrumb = getBreadcrumb(location);
  const isSubPage = location !== "/dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden dark">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="h-screen flex flex-col bg-sidebar border-r border-sidebar-border z-20 relative shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border gap-3 overflow-hidden shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <GradientText className="text-xl font-bold">
                  IntellectFlow
                </GradientText>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* New Mission Button */}
        <div className="p-3 shrink-0">
          <Link href="/dashboard/new-mission">
            <button
              className={cn(
                "w-full flex items-center gap-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all border border-primary/20 hover:border-primary/40 group",
                isSidebarOpen ? "px-4 py-3" : "p-3 justify-center",
              )}
            >
              <Plus className="w-5 h-5 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-semibold whitespace-nowrap overflow-hidden text-sm"
                  >
                    New Mission
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location === item.path ||
              (item.path !== "/dashboard" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path}>
                <div
                  title={!isSidebarOpen ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg transition-all duration-150 cursor-pointer group",
                    isSidebarOpen ? "px-3 py-2.5" : "p-3 justify-center",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-all",
                      isActive &&
                        "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]",
                    )}
                  />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap overflow-hidden text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div
          className={cn(
            "p-3 border-t border-sidebar-border shrink-0",
            !isSidebarOpen && "flex justify-center",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden",
              !isSidebarOpen && "justify-center",
            )}
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
              alt="User"
              className="w-9 h-9 rounded-full border border-white/20 shrink-0 object-cover"
            />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <p className="text-sm font-semibold text-white">
                    Commander Jane
                  </p>
                  <p className="text-xs text-muted-foreground">Admin Level 5</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-5 shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <Link href="/dashboard">
                <span className="hover:text-white transition-colors cursor-pointer shrink-0">
                  Mission Control
                </span>
              </Link>
              {isSubPage && (
                <>
                  <span className="text-border shrink-0">/</span>
                  <span className="text-white font-medium truncate capitalize">
                    {breadcrumb}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search trigger */}
            <button
              onClick={() => {
                setSearchOpen(true);
                setNotifOpen(false);
              }}
              className="hidden md:flex items-center gap-2 w-56 bg-white/5 border border-white/10 rounded-full pl-3 pr-3 py-2 text-sm text-muted-foreground hover:border-primary/30 hover:text-white transition-all group"
            >
              <Search className="w-4 h-4 group-hover:text-primary transition-colors shrink-0" />
              <span className="flex-1 text-left">Search missions...</span>
              <div className="flex gap-1 shrink-0">
                <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 border border-white/20">
                  ⌘
                </kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 border border-white/20">
                  K
                </kbd>
              </div>
            </button>

            {/* Mobile search */}
            <button
              onClick={() => {
                setSearchOpen(true);
                setNotifOpen(false);
              }}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setSearchOpen(false);
                }}
                className="relative p-2 hover:bg-white/5 rounded-full text-muted-foreground hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {hasNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <NotificationPanel onClose={() => setNotifOpen(false)} />
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/4 via-background to-background pointer-events-none -z-10" />
          {children}
        </main>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
