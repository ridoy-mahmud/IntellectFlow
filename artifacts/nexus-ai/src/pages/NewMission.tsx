import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, ArrowLeft, Rocket, CheckCircle2, Search, PenLine,
  Code2, BarChart2, Palette, TestTube2, Network, Zap, AlertCircle,
  Loader2
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { GlassCard, CyberButton, GradientText } from "@/components/ui-glass";
import { useCreateMission, useLaunchMission, CreateMissionInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const TEMPLATE_PRESETS = [
  {
    label: "Build MVP from Spec",
    name: "MVP Build Sprint",
    description: "Analyze the provided specification document and build a complete MVP. Include: API routes, database schema, frontend components, unit tests, and documentation. Focus on core functionality over polish.",
    category: "Development",
    priority: "high" as const,
    defaultAgents: ["researcher", "coder", "qa_tester"],
  },
  {
    label: "Market Analysis Report",
    name: "Market Intelligence Report",
    description: "Conduct a comprehensive market analysis including: competitive landscape review, customer persona mapping, pricing analysis, SWOT breakdown, and a 12-month growth opportunity roadmap. Deliver as a structured report.",
    category: "Research",
    priority: "medium" as const,
    defaultAgents: ["researcher", "analyst", "writer"],
  },
  {
    label: "Content Campaign",
    name: "Content Marketing Campaign",
    description: "Create a full content marketing campaign: 10 SEO-optimized blog posts, social media calendar, email newsletter templates, landing page copy, and a content distribution strategy. Target B2B SaaS audience.",
    category: "Marketing",
    priority: "medium" as const,
    defaultAgents: ["researcher", "writer", "designer"],
  },
  {
    label: "Security Audit",
    name: "Codebase Security Audit",
    description: "Review the codebase for security vulnerabilities. Check for: SQL injection, XSS, CSRF, authentication flaws, exposed secrets, dependency vulnerabilities. Provide a prioritized remediation plan.",
    category: "Development",
    priority: "critical" as const,
    defaultAgents: ["researcher", "coder", "qa_tester", "analyst"],
  },
];

const ALL_AGENTS = [
  { type: "researcher", icon: Search, color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/30", desc: "Gathers external data, reads docs & web" },
  { type: "writer", icon: PenLine, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30", desc: "Drafts & edits human-readable content" },
  { type: "coder", icon: Code2, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/30", desc: "Writes, reviews and refactors code" },
  { type: "analyst", icon: BarChart2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", desc: "Data processing, logic & visualizations" },
  { type: "designer", icon: Palette, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", desc: "UI/UX, assets & brand generation" },
  { type: "qa_tester", icon: TestTube2, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/30", desc: "Quality review, testing & validation" },
];

const MODEL_OPTIONS = ["GPT-4o", "Claude 3.5 Sonnet", "Llama 3.1 70B", "Gemini 1.5 Pro"];

interface FormState {
  name: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  agents: Array<{ agentType: string; enabled: boolean; model: string; temperature: number }>;
}

export default function NewMission() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const queryClient = useQueryClient();

  const createMissionMut = useCreateMission();
  const launchMissionMut = useLaunchMission();

  const [formData, setFormData] = useState<FormState>({
    name: "",
    description: "",
    category: "Development",
    priority: "medium",
    agents: [
      { agentType: "researcher", enabled: true, model: "GPT-4o", temperature: 0.7 },
      { agentType: "coder", enabled: true, model: "Claude 3.5 Sonnet", temperature: 0.2 },
    ],
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) { setErrorMsg("Please enter a mission name."); return; }
      if (!formData.description.trim()) { setErrorMsg("Please enter a mission objective."); return; }
    }
    if (step === 2 && formData.agents.length === 0) {
      setErrorMsg("Please select at least one agent."); return;
    }
    setErrorMsg("");
    setStep(s => Math.min(s + 1, 4));
  };

  const handlePrev = () => {
    setErrorMsg("");
    setStep(s => Math.max(s - 1, 1));
  };

  const applyTemplate = (tpl: typeof TEMPLATE_PRESETS[0]) => {
    setFormData(prev => ({
      ...prev,
      name: tpl.name,
      description: tpl.description,
      category: tpl.category,
      priority: tpl.priority,
      agents: tpl.defaultAgents.map(type => ({
        agentType: type,
        enabled: true,
        model: "GPT-4o",
        temperature: type === "coder" ? 0.2 : 0.7,
      })),
    }));
  };

  const toggleAgent = (type: string) => {
    setFormData(prev => {
      const exists = prev.agents.find(a => a.agentType === type);
      if (exists) {
        return { ...prev, agents: prev.agents.filter(a => a.agentType !== type) };
      }
      return {
        ...prev,
        agents: [...prev.agents, { agentType: type, enabled: true, model: "GPT-4o", temperature: 0.5 }],
      };
    });
  };

  const updateAgentModel = (type: string, model: string) => {
    setFormData(prev => ({
      ...prev,
      agents: prev.agents.map(a => a.agentType === type ? { ...a, model } : a),
    }));
  };

  const handleLaunch = async () => {
    if (!formData.name.trim()) { setErrorMsg("Mission name is required."); return; }
    setErrorMsg("");

    const payload: CreateMissionInput = {
      name: formData.name.trim(),
      description: formData.description.trim() || "No description provided.",
      category: formData.category,
      priority: formData.priority,
      agents: formData.agents.map(a => ({
        agentType: a.agentType as any,
        enabled: a.enabled,
        model: a.model,
        temperature: a.temperature,
      })),
    };

    createMissionMut.mutate({ data: payload }, {
      onSuccess: (createdMission) => {
        launchMissionMut.mutate({ id: createdMission.id }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
            setLocation(`/dashboard/mission/${createdMission.id}`);
          },
          onError: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
            setLocation(`/dashboard/mission/${createdMission.id}`);
          },
        });
      },
      onError: (err: any) => {
        setErrorMsg(err?.message || "Failed to create mission. Please try again.");
      },
    });
  };

  const isPending = createMissionMut.isPending || launchMissionMut.isPending;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setLocation("/dashboard")}
              className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Initialize Mission</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Configure objective and assemble your agent swarm.</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-5 w-full h-0.5 bg-border -z-10 rounded-full" />
            <div
              className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-primary to-secondary -z-10 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            {["Briefing", "Assembly", "Workflow", "Launch"].map((label, idx) => {
              const num = idx + 1;
              const done = step > num;
              const active = step === num;
              return (
                <button
                  key={label}
                  onClick={() => num < step && setStep(num)}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    done ? "bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    : active ? "bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] ring-4 ring-primary/20"
                    : "bg-card border border-border text-muted-foreground"
                  }`}>
                    {done ? <CheckCircle2 className="w-5 h-5" /> : num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block transition-colors ${
                    done || active ? "text-white" : "text-muted-foreground"
                  }`}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {/* Step 1: Briefing */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <GlassCard className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Mission Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g., Project Phoenix Backend Refactor"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Primary Objective *</label>
                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe what the agents need to accomplish in detail..."
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                    />
                    <div className="mt-3 flex gap-2 flex-wrap items-center">
                      <span className="text-xs text-muted-foreground font-medium">Templates:</span>
                      {TEMPLATE_PRESETS.map(tpl => (
                        <button
                          key={tpl.label}
                          onClick={() => applyTemplate(tpl)}
                          className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1.5 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all text-white/70"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Priority Level</label>
                      <select
                        value={formData.priority}
                        onChange={e => setFormData(p => ({ ...p, priority: e.target.value as any }))}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                      >
                        <option value="low">🟢 Low — Background execution</option>
                        <option value="medium">🟡 Medium — Standard allocation</option>
                        <option value="high">🔴 High — Accelerated mode</option>
                        <option value="critical">⚡ Critical — Max resources</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                      >
                        <option>Development</option>
                        <option>Research</option>
                        <option>Marketing</option>
                        <option>Data Analysis</option>
                        <option>Design</option>
                        <option>General</option>
                      </select>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 2: Assembly */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <p className="text-muted-foreground text-sm">
                  Select the agents to include in your swarm. <span className="text-primary font-medium">{formData.agents.length} selected.</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_AGENTS.map(agent => {
                    const isSelected = formData.agents.some(a => a.agentType === agent.type);
                    const selectedAgent = formData.agents.find(a => a.agentType === agent.type);
                    return (
                      <GlassCard
                        key={agent.type}
                        className={`p-5 cursor-pointer transition-all duration-200 border-2 ${
                          isSelected ? `${agent.border} ${agent.bg}` : "border-transparent hover:border-white/10"
                        }`}
                        onClick={() => toggleAgent(agent.type)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-2.5 rounded-xl ${agent.bg} border ${agent.border} ${agent.color}`}>
                            <agent.icon className="w-5 h-5" />
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? `bg-primary border-primary` : "border-muted-foreground/40"
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <h3 className="text-base font-bold text-white capitalize mb-1">
                          {agent.type.replace("_", " ")} Agent
                        </h3>
                        <p className="text-xs text-muted-foreground">{agent.desc}</p>

                        {isSelected && (
                          <div
                            className="mt-4 pt-3 border-t border-white/5"
                            onClick={e => e.stopPropagation()}
                          >
                            <label className="text-xs text-white/60 block mb-1.5">Model</label>
                            <select
                              value={selectedAgent?.model || "GPT-4o"}
                              onChange={e => updateAgentModel(agent.type, e.target.value)}
                              className="w-full bg-background/50 border border-white/10 rounded-lg text-xs p-2 text-white appearance-none cursor-pointer"
                            >
                              {MODEL_OPTIONS.map(m => <option key={m}>{m}</option>)}
                            </select>
                          </div>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Workflow */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <GlassCard className="p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px"
                  }} />
                  <div className="relative z-10 text-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                      <Network className="w-10 h-10 text-primary opacity-70" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Auto-Routing Enabled</h3>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      IntellectFlow Engine dynamically routes tasks between your <span className="text-white font-medium">{formData.agents.length} selected agents</span> based on capabilities, context, and workload.
                    </p>
                  </div>

                  {/* Agent flow visualization */}
                  <div className="relative z-10 flex items-center justify-center gap-3 flex-wrap">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <div className="text-center">
                        <Zap className="w-8 h-8 text-primary mx-auto mb-1" />
                        <span className="text-xs text-primary font-bold">IntellectFlow</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="h-0.5 w-8 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {formData.agents.map((agent, i) => {
                        const cfg = ALL_AGENTS.find(a => a.type === agent.agentType);
                        if (!cfg) return null;
                        return (
                          <div key={i} className={`w-16 h-16 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center ${cfg.color}`}>
                            <cfg.icon className="w-6 h-6" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                    {[
                      { label: "Task Routing", value: "Dynamic", color: "text-cyan-400" },
                      { label: "Context Sharing", value: "Enabled", color: "text-emerald-400" },
                      { label: "Auto-Retry", value: "3 attempts", color: "text-amber-400" },
                    ].map(item => (
                      <div key={item.label} className="text-center p-4 bg-white/3 rounded-xl border border-white/5">
                        <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                        <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 4: Launch */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <GlassCard className="p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />

                  <div className="relative z-10 text-center mb-8">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Rocket className="w-16 h-16 text-primary mx-auto mb-5" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2">Ready for Launch</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Your swarm is primed. Review the mission parameters before ignition.
                    </p>
                  </div>

                  <div className="relative z-10 bg-background/40 border border-border/50 rounded-2xl p-6 max-w-lg mx-auto space-y-4">
                    <div className="flex justify-between items-center border-b border-border/30 pb-4">
                      <span className="text-sm text-muted-foreground">Mission Name</span>
                      <span className="font-bold text-white text-right max-w-[60%]">{formData.name || "Unnamed"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border/30 pb-4">
                      <span className="text-sm text-muted-foreground">Priority / Category</span>
                      <span className="font-bold text-white capitalize">{formData.priority} · {formData.category}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border/30 pb-4">
                      <span className="text-sm text-muted-foreground">Agent Count</span>
                      <span className="font-bold text-primary">{formData.agents.length} agents</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground shrink-0">Crew</span>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {formData.agents.map(a => {
                          const cfg = ALL_AGENTS.find(ag => ag.type === a.agentType);
                          return cfg ? (
                            <span key={a.agentType} className={`px-2 py-0.5 text-xs font-medium rounded ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                              {a.agentType.replace("_", " ")}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </motion.div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t border-border/50">
          <CyberButton
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1 || isPending}
            className={step === 1 ? "opacity-0 pointer-events-none" : ""}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </CyberButton>

          {step < 4 ? (
            <CyberButton variant="primary" onClick={handleNext}>
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </CyberButton>
          ) : (
            <CyberButton
              variant="primary"
              onClick={handleLaunch}
              disabled={isPending}
              className="bg-gradient-to-r from-primary to-accent min-w-[180px] justify-center"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {createMissionMut.isPending ? "Initializing..." : "Launching..."}
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Launch Mission
                </>
              )}
            </CyberButton>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
