import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Cpu, Search, PenLine, Code2, BarChart2, Palette, TestTube2,
  Plus, Settings2, Zap, Globe, ChevronRight, Star, Activity,
  CheckCircle2, Clock, Lock
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { GlassCard, GradientText, CyberButton } from "@/components/ui-glass";
import { useListMissions } from "@workspace/api-client-react";

const AGENT_DEFINITIONS = [
  {
    type: "researcher",
    label: "Researcher Agent",
    icon: Search,
    color: "#6366F1",
    textColor: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    desc: "Autonomously searches the web, reads documentation, extracts information, and compiles comprehensive research briefs for other agents.",
    capabilities: ["Web search & scraping", "Document parsing", "Source verification", "Research synthesis", "Fact checking"],
    models: ["GPT-4o", "Claude 3.5 Sonnet", "Perplexity API"],
    tier: "standard",
    speed: 85,
    accuracy: 92,
    creativity: 40,
  },
  {
    type: "writer",
    label: "Writer Agent",
    icon: PenLine,
    color: "#8B5CF6",
    textColor: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    gradient: "from-purple-500/20 to-purple-500/5",
    desc: "Crafts compelling written content including blog posts, reports, documentation, marketing copy, and technical writing from research briefs.",
    capabilities: ["Long-form writing", "SEO optimization", "Tone adaptation", "Content editing", "Documentation"],
    models: ["GPT-4o", "Claude 3.5 Sonnet", "Llama 3.1 70B"],
    tier: "standard",
    speed: 90,
    accuracy: 88,
    creativity: 95,
  },
  {
    type: "coder",
    label: "Coder Agent",
    icon: Code2,
    color: "#06B6D4",
    textColor: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    desc: "Writes production-quality code, reviews pull requests, refactors existing code, and fixes bugs across multiple programming languages.",
    capabilities: ["Code generation", "Bug fixing", "Refactoring", "Test writing", "Code review"],
    models: ["Claude 3.5 Sonnet", "GPT-4o", "DeepSeek Coder"],
    tier: "pro",
    speed: 75,
    accuracy: 96,
    creativity: 70,
  },
  {
    type: "analyst",
    label: "Analyst Agent",
    icon: BarChart2,
    color: "#10B981",
    textColor: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    desc: "Processes datasets, performs statistical analysis, identifies patterns and trends, and produces actionable business insights.",
    capabilities: ["Data processing", "Statistical analysis", "Trend identification", "Chart generation", "Insight reporting"],
    models: ["GPT-4o", "Claude 3.5 Sonnet", "Gemini 1.5 Pro"],
    tier: "standard",
    speed: 80,
    accuracy: 94,
    creativity: 55,
  },
  {
    type: "designer",
    label: "Designer Agent",
    icon: Palette,
    color: "#F59E0B",
    textColor: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    gradient: "from-amber-500/20 to-amber-500/5",
    desc: "Creates UI/UX mockups, generates image prompts, suggests color palettes, and produces creative visual concepts aligned with brand guidelines.",
    capabilities: ["UI wireframing", "Brand design", "Image generation", "Style guide creation", "Asset creation"],
    models: ["GPT-4o Vision", "DALL-E 3", "Midjourney API"],
    tier: "pro",
    speed: 70,
    accuracy: 82,
    creativity: 98,
  },
  {
    type: "qa_tester",
    label: "QA Tester Agent",
    icon: TestTube2,
    color: "#EF4444",
    textColor: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    gradient: "from-rose-500/20 to-rose-500/5",
    desc: "Reviews all outputs for quality, consistency, and accuracy. Runs automated tests, validates logic, and ensures deliverables meet specifications.",
    capabilities: ["Output validation", "Consistency checks", "Logic verification", "Automated testing", "Quality reporting"],
    models: ["GPT-4o", "Claude 3.5 Sonnet"],
    tier: "standard",
    speed: 95,
    accuracy: 97,
    creativity: 30,
  },
];

function StatBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full`}
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

export default function AgentStudio() {
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENT_DEFINITIONS[0] | null>(null);
  const { data: missions } = useListMissions({ limit: 100 });

  const agentUsageCount = (type: string) =>
    (missions || []).filter(m =>
      (m.agents as any[]).some((a: any) => a.agentType === type && a.enabled)
    ).length;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <Cpu className="w-7 h-7 text-primary" /> Agent Studio
            </h1>
            <p className="text-muted-foreground">Explore, configure, and understand your AI agent crew.</p>
          </div>
          <Link href="/dashboard/new-mission">
            <CyberButton variant="primary">
              <Plus className="w-4 h-4" /> Deploy Agents
            </CyberButton>
          </Link>
        </div>

        {/* Platform Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Agent Types", value: "6", icon: Cpu, color: "text-primary" },
            { label: "Deployed Missions", value: (missions || []).length, icon: Activity, color: "text-cyan-400" },
            { label: "Models Supported", value: "12+", icon: Zap, color: "text-amber-400" },
            { label: "Uptime", value: "99.9%", icon: Globe, color: "text-emerald-400" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassCard className="p-5 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Agent Grid */}
        <div>
          <h2 className="text-xl font-bold text-white mb-5">Available Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {AGENT_DEFINITIONS.map((agent, i) => {
              const usageCount = agentUsageCount(agent.type);
              const isSelected = selectedAgent?.type === agent.type;
              return (
                <motion.div
                  key={agent.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <GlassCard
                    className={`p-6 cursor-pointer transition-all duration-300 border-2 group ${
                      isSelected
                        ? `${agent.border} ${agent.bg}`
                        : "border-transparent hover:border-white/10 hover:-translate-y-1"
                    }`}
                    onClick={() => setSelectedAgent(isSelected ? null : agent)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.gradient} border ${agent.border} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        style={{ boxShadow: isSelected ? `0 0 20px ${agent.color}40` : "none" }}
                      >
                        <agent.icon className="w-7 h-7" style={{ color: agent.color }} />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {agent.tier === "pro" && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                            <Star className="w-2.5 h-2.5" /> PRO
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{usageCount} mission{usageCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1.5">{agent.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">{agent.desc}</p>

                    {/* Stats */}
                    <div className="space-y-2.5 mb-4">
                      {[
                        { label: "Speed", value: agent.speed },
                        { label: "Accuracy", value: agent.accuracy },
                        { label: "Creativity", value: agent.creativity },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                            <span>{s.label}</span>
                            <span className="font-mono" style={{ color: agent.color }}>{s.value}%</span>
                          </div>
                          <StatBar value={s.value} color={agent.color} />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className={`flex items-center gap-1 text-xs ${agent.textColor}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Available
                      </span>
                      <span className={`flex items-center gap-1 text-xs text-muted-foreground hover:${agent.textColor} transition-colors`}>
                        Configure <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Agent Detail Panel */}
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className={`p-8 border ${selectedAgent.border}`}>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedAgent.gradient} border ${selectedAgent.border} flex items-center justify-center`}
                      style={{ boxShadow: `0 0 30px ${selectedAgent.color}40` }}
                    >
                      <selectedAgent.icon className="w-8 h-8" style={{ color: selectedAgent.color }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedAgent.label}</h2>
                      <p className={`text-sm ${selectedAgent.textColor}`}>
                        {agentUsageCount(selectedAgent.type)} active missions
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">{selectedAgent.desc}</p>

                  <h4 className="text-sm font-bold text-white mb-3">Core Capabilities</h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedAgent.capabilities.map(cap => (
                      <span key={cap} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${selectedAgent.bg} border ${selectedAgent.border} ${selectedAgent.textColor}`}>
                        {cap}
                      </span>
                    ))}
                  </div>

                  <h4 className="text-sm font-bold text-white mb-3">Supported Models</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.models.map(model => (
                      <span key={model} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 border border-white/10 text-white/70">
                        {model}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:w-64 space-y-5">
                  <div className="p-5 bg-white/3 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-bold text-white">Performance Metrics</h4>
                    {[
                      { label: "Speed", value: selectedAgent.speed },
                      { label: "Accuracy", value: selectedAgent.accuracy },
                      { label: "Creativity", value: selectedAgent.creativity },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-muted-foreground">{s.label}</span>
                          <span className="font-mono font-bold" style={{ color: selectedAgent.color }}>{s.value}%</span>
                        </div>
                        <StatBar value={s.value} color={selectedAgent.color} />
                      </div>
                    ))}
                  </div>

                  <Link href="/dashboard/new-mission">
                    <CyberButton variant="primary" className="w-full justify-center">
                      <Plus className="w-4 h-4" /> Deploy This Agent
                    </CyberButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
