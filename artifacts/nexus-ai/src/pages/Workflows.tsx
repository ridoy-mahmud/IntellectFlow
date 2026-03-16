import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Network, Plus, Play, Clock, CheckCircle2, AlertTriangle, Search,
  Code2, BarChart2, PenLine, Zap, Layers, ArrowRight, Cpu, Settings2,
  ChevronRight, Star, Lock
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { GlassCard, CyberButton, GradientText } from "@/components/ui-glass";
import { useListMissions } from "@workspace/api-client-react";

const WORKFLOW_TEMPLATES = [
  {
    id: "full-stack-dev",
    name: "Full-Stack Development",
    desc: "Complete web app development pipeline: research → architecture → code → test → document",
    icon: Code2,
    color: "#06B6D4",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    agents: ["researcher", "coder", "qa_tester", "writer"],
    steps: ["Requirements Analysis", "Architecture Design", "Frontend & Backend Development", "Testing Suite", "Documentation"],
    tier: "pro",
    avgDuration: "2-4 hours",
    successRate: 94,
  },
  {
    id: "research-report",
    name: "Research & Report",
    desc: "Deep research followed by professional report writing with data visualizations",
    icon: Search,
    color: "#6366F1",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    agents: ["researcher", "analyst", "writer"],
    steps: ["Topic Research", "Data Collection", "Analysis & Insights", "Report Writing", "Quality Review"],
    tier: "standard",
    avgDuration: "45-90 mins",
    successRate: 98,
  },
  {
    id: "market-analysis",
    name: "Market Intelligence",
    desc: "Comprehensive competitive analysis, market sizing, and strategic recommendations",
    icon: BarChart2,
    color: "#10B981",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    agents: ["researcher", "analyst", "writer"],
    steps: ["Market Research", "Competitor Scraping", "SWOT Analysis", "Opportunity Mapping", "Strategic Report"],
    tier: "standard",
    avgDuration: "1-2 hours",
    successRate: 96,
  },
  {
    id: "content-campaign",
    name: "Content Marketing",
    desc: "Full content marketing campaign from strategy to published assets",
    icon: PenLine,
    color: "#8B5CF6",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    agents: ["researcher", "writer", "designer"],
    steps: ["Audience Research", "Content Strategy", "Asset Creation", "SEO Optimization", "Publication Ready"],
    tier: "standard",
    avgDuration: "1-3 hours",
    successRate: 92,
  },
  {
    id: "data-pipeline",
    name: "Data Analysis Pipeline",
    desc: "End-to-end data processing, cleaning, analysis, and visualization reporting",
    icon: Layers,
    color: "#F59E0B",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    agents: ["analyst", "coder", "writer"],
    steps: ["Data Ingestion", "Cleaning & Validation", "Statistical Analysis", "Visualization", "Insights Report"],
    tier: "pro",
    avgDuration: "30-60 mins",
    successRate: 97,
  },
  {
    id: "product-launch",
    name: "Product Launch Kit",
    desc: "Everything needed for a product launch: landing page, docs, blog, press kit",
    icon: Zap,
    color: "#EF4444",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    agents: ["researcher", "writer", "designer", "coder", "qa_tester"],
    steps: ["Market Positioning", "Landing Page", "Documentation", "Blog Posts", "Press Release"],
    tier: "pro",
    avgDuration: "3-5 hours",
    successRate: 89,
  },
];

const AGENT_COLORS: Record<string, string> = {
  researcher: "bg-indigo-400/20 text-indigo-400",
  writer: "bg-purple-400/20 text-purple-400",
  coder: "bg-cyan-400/20 text-cyan-400",
  analyst: "bg-emerald-400/20 text-emerald-400",
  designer: "bg-amber-400/20 text-amber-400",
  qa_tester: "bg-rose-400/20 text-rose-400",
};

export default function Workflows() {
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof WORKFLOW_TEMPLATES[0] | null>(null);
  const { data: missions } = useListMissions({ limit: 100 });

  const filtered = WORKFLOW_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  const recentMissions = (missions || []).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <Network className="w-7 h-7 text-primary" /> Workflows
            </h1>
            <p className="text-muted-foreground">Pre-built agent pipeline templates for common tasks.</p>
          </div>
          <Link href="/dashboard/new-mission">
            <CyberButton variant="primary">
              <Plus className="w-4 h-4" /> Custom Workflow
            </CyberButton>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Templates", value: WORKFLOW_TEMPLATES.length, color: "text-primary" },
            { label: "Avg Success Rate", value: `${Math.round(WORKFLOW_TEMPLATES.reduce((s, t) => s + t.successRate, 0) / WORKFLOW_TEMPLATES.length)}%`, color: "text-emerald-400" },
            { label: "Missions Run", value: (missions || []).length, color: "text-cyan-400" },
            { label: "Agent Types Used", value: "6", color: "text-purple-400" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassCard className="p-5">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search workflow templates..."
            className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Template Grid */}
        <div>
          <h2 className="text-xl font-bold text-white mb-5">Workflow Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((template, i) => {
              const isSelected = selectedTemplate?.id === template.id;
              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <GlassCard
                    className={`p-6 cursor-pointer transition-all duration-300 border-2 group hover:-translate-y-1 ${
                      isSelected ? `${template.border} ${template.bg}` : "border-transparent hover:border-white/10"
                    }`}
                    onClick={() => setSelectedTemplate(isSelected ? null : template)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${template.bg} border ${template.border} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        style={{ boxShadow: isSelected ? `0 0 20px ${template.color}40` : "none" }}
                      >
                        <template.icon className="w-6 h-6" style={{ color: template.color }} />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {template.tier === "pro" && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                            <Star className="w-2.5 h-2.5" /> PRO
                          </span>
                        )}
                        <span className="text-xs text-emerald-400 font-medium">{template.successRate}% success</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{template.desc}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {template.avgDuration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" /> {template.agents.length} agents
                      </span>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                      {template.agents.map(a => (
                        <span key={a} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${AGENT_COLORS[a] || "bg-white/10 text-white/60"}`}>
                          {a.replace("_", " ")}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{template.steps.length} pipeline steps</span>
                      <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        View details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Selected Template Detail */}
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard className={`p-8 border ${selectedTemplate.border}`}>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className={`w-14 h-14 rounded-2xl ${selectedTemplate.bg} border ${selectedTemplate.border} flex items-center justify-center`}
                      style={{ boxShadow: `0 0 25px ${selectedTemplate.color}40` }}
                    >
                      <selectedTemplate.icon className="w-7 h-7" style={{ color: selectedTemplate.color }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedTemplate.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.desc}</p>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-4">Pipeline Steps</h4>
                  <div className="relative space-y-3 mb-6">
                    {selectedTemplate.steps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 shrink-0"
                          style={{ borderColor: selectedTemplate.color, backgroundColor: `${selectedTemplate.color}20` }}
                        >
                          {i + 1}
                        </div>
                        <div
                          className="flex-1 p-3 rounded-xl border text-sm font-medium text-white/80"
                          style={{ backgroundColor: `${selectedTemplate.color}08`, borderColor: `${selectedTemplate.color}25` }}
                        >
                          {step}
                        </div>
                        {i < selectedTemplate.steps.length - 1 && (
                          <div className="absolute left-4 mt-8 w-px h-3 bg-gradient-to-b" style={{ background: `linear-gradient(${selectedTemplate.color}, transparent)` }} />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <h4 className="text-sm font-bold text-white mb-3">Agent Crew</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTemplate.agents.map(a => (
                      <span
                        key={a}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize ${AGENT_COLORS[a] || "bg-white/10 text-white/60"}`}
                      >
                        {a.replace("_", " ")} Agent
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:w-64 space-y-5">
                  <div className="p-5 bg-white/3 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-sm font-bold text-white">Template Stats</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="text-emerald-400 font-mono font-bold">{selectedTemplate.successRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Duration</span>
                      <span className="text-white font-mono">{selectedTemplate.avgDuration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pipeline Steps</span>
                      <span className="text-white font-mono">{selectedTemplate.steps.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Agent Count</span>
                      <span className="text-white font-mono">{selectedTemplate.agents.length}</span>
                    </div>
                  </div>

                  <Link href="/dashboard/new-mission">
                    <CyberButton variant="primary" className="w-full justify-center">
                      <Play className="w-4 h-4" /> Run This Workflow
                    </CyberButton>
                  </Link>

                  <button className="w-full px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    <Settings2 className="w-4 h-4" /> Customize Template
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Recent Missions from these workflows */}
        {recentMissions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-5">Recent Runs</h2>
            <div className="space-y-3">
              {recentMissions.map((m, i) => (
                <Link key={m.id} href={`/dashboard/mission/${m.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <GlassCard className="p-4 flex items-center gap-5 hover:bg-white/5 transition-all cursor-pointer group">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        m.status === "running" ? "bg-cyan-400 animate-pulse" :
                        m.status === "completed" ? "bg-emerald-400" :
                        m.status === "failed" ? "bg-rose-400" :
                        "bg-gray-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{m.status} · {m.category || "General"}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            style={{ width: `${m.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-white/60 w-8 text-right">{Math.round(m.progress || 0)}%</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </GlassCard>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
