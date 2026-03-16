import React, { useEffect, useRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function GlassCard({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn(
        "bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden relative",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary", className)}>
      {children}
    </span>
  );
}

export function CyberButton({ 
  children, 
  variant = "primary", 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "danger" }) {
  const baseClasses = "relative px-6 py-3 rounded-xl font-semibold overflow-hidden transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group";
  
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] border border-primary/50",
    secondary: "bg-secondary text-secondary-foreground shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] border border-secondary/50",
    outline: "bg-transparent text-foreground border border-white/20 hover:bg-white/5 backdrop-blur-sm",
    danger: "bg-destructive text-destructive-foreground shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] border border-destructive/50",
  };

  return (
    <button className={cn(baseClasses, variants[variant], className)} {...props}>
      <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {children}
    </button>
  );
}

export function ParticleCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5;
        
        const colors = ['#6366F1', '#06B6D4', '#A855F7', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas!.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas!.height) this.vy = -this.vy;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Draw connections
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = 0.1 * (1 - distance / 100);
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className={cn("absolute inset-0 pointer-events-none z-0", className)} />;
}

export function AgentBadge({ type }: { type: string }) {
  const configs: Record<string, { color: string, bg: string, label: string }> = {
    researcher: { color: "text-indigo-400", bg: "bg-indigo-400/10", label: "Researcher" },
    writer: { color: "text-purple-400", bg: "bg-purple-400/10", label: "Writer" },
    coder: { color: "text-cyan-400", bg: "bg-cyan-400/10", label: "Coder" },
    analyst: { color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Analyst" },
    designer: { color: "text-amber-400", bg: "bg-amber-400/10", label: "Designer" },
    qa_tester: { color: "text-rose-400", bg: "bg-rose-400/10", label: "QA Tester" },
  };

  const config = configs[type] || { color: "text-gray-400", bg: "bg-gray-400/10", label: type };

  return (
    <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-md border border-white/5", config.color, config.bg)}>
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { className: string, dot: string }> = {
    running: { className: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", dot: "bg-cyan-400 animate-pulse" },
    completed: { className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", dot: "bg-emerald-400" },
    failed: { className: "text-rose-400 bg-rose-400/10 border-rose-400/20", dot: "bg-rose-400" },
    paused: { className: "text-amber-400 bg-amber-400/10 border-amber-400/20", dot: "bg-amber-400" },
    draft: { className: "text-gray-400 bg-gray-400/10 border-gray-400/20", dot: "bg-gray-400" },
    aborted: { className: "text-rose-500 bg-rose-500/10 border-rose-500/20", dot: "bg-rose-500" },
  };

  const config = configs[status.toLowerCase()] || configs.draft;

  return (
    <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border flex items-center gap-1.5 w-fit", config.className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
