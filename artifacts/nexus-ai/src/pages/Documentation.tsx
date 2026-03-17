import { motion } from "framer-motion";
import {
  BookOpen,
  Rocket,
  Users,
  Network,
  CheckCircle2,
  Video,
  FileText,
  Search,
  Code2,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { GlassCard, CyberButton } from "@/components/ui-glass";
import { Link } from "wouter";

const workflowSteps = [
  {
    title: "Create a Mission",
    icon: Rocket,
    detail:
      "Open New Mission, describe your objective, choose priority, and enable the agents you want in your workflow.",
  },
  {
    title: "Launch Agent Team",
    icon: Users,
    detail:
      "IntellectFlow activates your selected agents and starts collaborative execution with live status updates.",
  },
  {
    title: "Track Live Progress",
    icon: Network,
    detail:
      "Use Mission Monitor to watch terminal output, code stream, and agent communication in real time.",
  },
  {
    title: "Review Final Results",
    icon: CheckCircle2,
    detail:
      "When complete, open the Results tab to see deliverables, summaries, and packaged output assets.",
  },
];

const resultTypes = [
  {
    title: "Video Results",
    icon: Video,
    text: "Demo explainers, workflow walkthrough clips, or presentation-ready previews.",
  },
  {
    title: "Text Deliverables",
    icon: FileText,
    text: "Polished documents like briefs, outlines, reports, release notes, and blog-ready drafts.",
  },
  {
    title: "Research Findings",
    icon: Search,
    text: "Evidence-backed insights, source summaries, and key recommendations.",
  },
  {
    title: "Code Artifacts",
    icon: Code2,
    text: "Implementation snippets, structured logic output, and QA notes from coding agents.",
  },
];

export default function Documentation() {
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-primary" /> Documentation
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Learn how IntellectFlow works, how to run missions efficiently, and
            where to find final outputs for completed projects.
          </p>
        </div>

        <GlassCard className="p-6 md:p-8 space-y-6">
          <h2 className="text-xl font-bold text-white">
            How The Application Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <step.icon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">{step.detail}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">
              How To Use IntellectFlow
            </h2>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
              <li>Go to Mission Control and inspect active queue health.</li>
              <li>Create a new mission and select required agents.</li>
              <li>Launch mission and monitor progress in Mission Monitor.</li>
              <li>Review finished output in Results and export as needed.</li>
              <li>Manage API providers and bridge settings from Settings.</li>
            </ol>
            <div className="flex gap-3 pt-2">
              <Link href="/dashboard/new-mission">
                <CyberButton variant="primary">Start New Mission</CyberButton>
              </Link>
              <Link href="/dashboard/projects">
                <CyberButton variant="outline">Open Projects</CyberButton>
              </Link>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">
              Completed Project Results
            </h2>
            <p className="text-sm text-muted-foreground">
              Completed missions include result bundles generated from actual
              mission activity logs and outputs.
            </p>
            <div className="space-y-3">
              {resultTypes.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-white/10 bg-white/4 px-3 py-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-semibold text-white">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                Tip For Fast Navigation
              </h3>
              <p className="text-sm text-muted-foreground">
                Data caches are prewarmed globally, so Mission Control,
                Projects, and related pages open with near-instant state where
                possible.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
