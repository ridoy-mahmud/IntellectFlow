import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, BrainCircuit, Rocket, Shield, Zap, Sparkles, Terminal,
  Activity, Search, PenLine, Code2, BarChart2, Palette, TestTube2,
  Target, Users, Network, CheckCircle2, ChevronRight, Star, 
  GitBranch, Lock, Cpu, Globe, Layers, Briefcase
} from "lucide-react";
import { CyberButton, GlassCard, GradientText, ParticleCanvas } from "@/components/ui-glass";

const agents = [
  { type: "Researcher", icon: Search, color: "#6366F1", bg: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/30", desc: "Searches the web, reads documents, gathers data, and compiles comprehensive research briefs." },
  { type: "Writer", icon: PenLine, color: "#8B5CF6", bg: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/30", desc: "Crafts blog posts, reports, documentation, marketing copy, and creative content." },
  { type: "Coder", icon: Code2, color: "#06B6D4", bg: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/30", desc: "Writes clean, tested code in Python, JavaScript, TypeScript, and more." },
  { type: "Analyst", icon: BarChart2, color: "#10B981", bg: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", desc: "Performs data analysis, creates visualizations, and extracts actionable insights." },
  { type: "Designer", icon: Palette, color: "#F59E0B", bg: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30", desc: "Generates UI mockups, design suggestions, and creative visual concepts." },
  { type: "QA Tester", icon: TestTube2, color: "#EF4444", bg: "from-rose-500/20 to-rose-500/5", border: "border-rose-500/30", desc: "Reviews all outputs for quality, accuracy, consistency, and completeness." },
];

const steps = [
  { icon: Target, label: "Define Your Mission", desc: "Describe your project goal in natural language. IntellectFlow understands complex requirements." },
  { icon: Users, label: "AI Assembles the Crew", desc: "IntellectFlow automatically selects and configures the optimal team of specialized AI agents." },
  { icon: Network, label: "Agents Collaborate", desc: "Agents communicate, delegate, review each other's work, and iterate autonomously." },
  { icon: Rocket, label: "Deliver Results", desc: "Receive polished deliverables: research reports, written content, working code, and more." },
];

const features = [
  { icon: Activity, title: "Real-Time Collaboration", desc: "Watch agents think, communicate, and build together in real-time" },
  { icon: GitBranch, title: "Visual Workflow Builder", desc: "Drag-and-drop workflow editor to design custom agent pipelines" },
  { icon: Cpu, title: "Multi-LLM Support", desc: "Connect OpenAI, Anthropic, Google, or local models" },
  { icon: Lock, title: "Version Control", desc: "Every agent output is versioned and auditable" },
  { icon: Users, title: "Human-in-the-Loop", desc: "Approve, edit, or redirect agent work at any checkpoint" },
  { icon: Layers, title: "Project Templates", desc: "Pre-built templates for research papers, web apps, marketing campaigns" },
  { icon: BarChart2, title: "Analytics Dashboard", desc: "Track token usage, completion rates, agent performance metrics" },
  { icon: Globe, title: "API Access", desc: "RESTful API to integrate IntellectFlow into your existing workflows" },
];

const pricing = [
  {
    name: "Starter", price: "$0", period: "/month", highlight: false,
    perks: ["5 projects/month", "3 agents per project", "GPT-3.5 Turbo", "Community support"],
  },
  {
    name: "Pro", price: "$49", period: "/month", highlight: true,
    perks: ["Unlimited projects", "All 6 agents", "GPT-4 + Claude", "Priority support", "API access"],
  },
  {
    name: "Enterprise", price: "Custom", period: "", highlight: false,
    perks: ["Custom agents", "On-prem deployment", "SSO", "Dedicated support", "SLA guarantee"],
  },
];

function useTypewriter(words: string[], speed = 80) {
  const [display, setDisplay] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIndex + 1));
        if (charIndex + 1 === current.length) {
          setTimeout(() => setDeleting(true), 1500);
        } else {
          setCharIndex(c => c + 1);
        }
      } else {
        setDisplay(current.slice(0, charIndex - 1));
        if (charIndex - 1 === 0) {
          setDeleting(false);
          setWordIndex(i => (i + 1) % words.length);
          setCharIndex(0);
        } else {
          setCharIndex(c => c - 1);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words, speed]);

  return display;
}

export default function Landing() {
  const typewriterText = useTypewriter(["research reports.", "working code.", "market analysis.", "complete projects."]);
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 dark">
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-background/85 z-10" />
        <img
          src={`${import.meta.env.BASE_URL}images/space-bg.png`}
          alt=""
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-20" />
        <ParticleCanvas className="z-30 opacity-50" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">IntellectFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <a href="#agents" className="hover:text-white transition-colors">Agents</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden sm:block">Sign In</button>
            </Link>
            <Link href="/dashboard">
              <CyberButton variant="primary" className="py-2.5 px-5 text-sm">
                Launch App
              </CyberButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-40 pt-40 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-white/80">IntellectFlow Engine v2.0 is now live</span>
              <span className="ml-1 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">New</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
            >
              The Future of <br className="hidden md:block" />
              <GradientText>AI Collaboration</GradientText>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-4"
            >
              Deploy autonomous AI agent teams that research, write, code, and deliver complete projects — while you sleep.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/50 mb-12 font-mono min-h-[28px]"
            >
              Deliver&nbsp;<span className="text-primary">{typewriterText}</span><span className="animate-pulse text-primary">|</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/dashboard">
                <CyberButton variant="primary" className="text-lg py-4 px-10">
                  <Rocket className="w-5 h-5" />
                  Launch Mission Control
                </CyberButton>
              </Link>
              <CyberButton
                variant="outline"
                className="text-lg py-4 px-10 group"
                onClick={() => setDemoOpen(true)}
              >
                Watch Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </CyberButton>
            </motion.div>

            {/* Floating stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-8 mt-12 text-sm text-white/50"
            >
              {[["50k+", "Missions Run"], ["99.9%", "Uptime"], ["6", "Agent Types"], ["<2min", "Avg Setup"]].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="text-xl font-bold text-white">{val}</div>
                  <div>{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, delay: 0.5, type: "spring", stiffness: 40 }}
            className="mt-24 relative mx-auto max-w-5xl"
            style={{ perspective: "1200px" }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur-2xl opacity-25 animate-pulse" />
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-primary/50 to-secondary/50 opacity-40" />
            <img
              src={`${import.meta.env.BASE_URL}images/dashboard-preview.png`}
              alt="IntellectFlow Dashboard"
              className="relative rounded-2xl border border-white/10 shadow-2xl w-full"
            />
          </motion.div>
        </div>

        {/* How It Works */}
        <div className="max-w-7xl mx-auto mt-48" id="platform">
          <div className="text-center mb-20">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Simple by Design</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How <GradientText>IntellectFlow</GradientText> Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              From idea to delivered results in four seamless steps.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-10 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <GlassCard className="p-6 text-center relative group hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-shadow">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="absolute top-4 right-4 text-4xl font-black text-white/5 select-none">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Showcase */}
        <div className="max-w-7xl mx-auto mt-40" id="agents">
          <div className="text-center mb-20">
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-3">Your AI Crew</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Meet Your <GradientText>AI Crew</GradientText>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Six specialized agents, each with deep domain expertise, working together autonomously.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onHoverStart={() => setHoveredAgent(i)}
                onHoverEnd={() => setHoveredAgent(null)}
              >
                <GlassCard
                  className={`p-6 group transition-all duration-300 border ${agent.border} hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] cursor-pointer`}
                  style={{ borderColor: hoveredAgent === i ? agent.color + "60" : undefined }}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.bg} border flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110`}
                    style={{ borderColor: agent.color + "40", boxShadow: hoveredAgent === i ? `0 0 20px ${agent.color}40` : "none" }}
                  >
                    <agent.icon className="w-7 h-7" style={{ color: agent.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{agent.type} Agent</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{agent.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium" style={{ color: agent.color }}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active & Available</span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto mt-40">
          <div className="text-center mb-20">
            <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-3">Enterprise Grade</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Enterprise-Grade <GradientText>Capabilities</GradientText>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <GlassCard className="p-6 group hover:-translate-y-1 transition-transform duration-300 h-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="max-w-5xl mx-auto mt-40" id="pricing">
          <div className="text-center mb-16">
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent <GradientText>Pricing</GradientText>
            </h2>
            <p className="text-muted-foreground text-lg">Start free. Scale as your missions grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                {plan.highlight && (
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-80 z-0" />
                )}
                <GlassCard className={`relative z-10 p-8 h-full flex flex-col ${plan.highlight ? "border-primary/40" : ""}`}>
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        ⭐ Recommended
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-extrabold ${plan.highlight ? "text-primary" : "text-white"}`}>{plan.price}</span>
                      <span className="text-muted-foreground mb-1">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.perks.map((perk, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-white/80">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Link href="/dashboard">
                    <CyberButton
                      variant={plan.highlight ? "primary" : "outline"}
                      className="w-full justify-center"
                    >
                      Get Started <ChevronRight className="w-4 h-4" />
                    </CyberButton>
                  </Link>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="max-w-4xl mx-auto mt-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-12 text-center relative overflow-hidden border border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 opacity-80" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Build with AI?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Join thousands of teams deploying autonomous AI agents to ship faster.
              </p>
              <Link href="/dashboard">
                <CyberButton variant="primary" className="text-lg py-4 px-10 mx-auto">
                  <Rocket className="w-5 h-5" />
                  Start Free — No Credit Card
                </CyberButton>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-40 border-t border-white/5 bg-background/90 backdrop-blur-md py-14 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-6 h-6 text-primary" />
                <span className="text-xl font-bold text-white">IntellectFlow</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                The autonomous multi-agent platform that turns complex goals into delivered results.
              </p>
              <p className="text-muted-foreground text-xs mt-4">Built with ❤️ and AI</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#platform" className="hover:text-white transition-colors">Platform</a></li>
                <li><a href="#agents" className="hover:text-white transition-colors">Agents</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-3">Get updates on new agent capabilities.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary"
                />
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <span>© 2025 IntellectFlow Orchestration. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {demoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setDemoOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
            onClick={e => e.stopPropagation()}
          >
            <GlassCard className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Watch IntellectFlow in Action</h3>
              <p className="text-muted-foreground mb-6">See how autonomous agents collaborate to complete real projects in minutes.</p>
              <div className="aspect-video bg-background/50 rounded-xl border border-white/10 flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-white font-medium">Demo Video Coming Soon</p>
                  <p className="text-muted-foreground text-sm mt-1">Try the live dashboard instead</p>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard">
                  <CyberButton variant="primary" onClick={() => setDemoOpen(false)}>
                    <Rocket className="w-4 h-4" /> Try Live Demo
                  </CyberButton>
                </Link>
                <CyberButton variant="outline" onClick={() => setDemoOpen(false)}>
                  Close
                </CyberButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}
