import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Activity, AlertTriangle, ArrowUpRight, BookOpen, Bot, Check, ChevronRight, Circle,
  Clock3, Code2, Copy, Database, FileSearch, GitBranch, History as HistoryIcon,
  Layers3, LoaderCircle, Menu, Network, Radar, RotateCcw, Search, ShieldCheck,
  Sparkles, Terminal, X
} from 'lucide-react';
import type {
  AgentInfo, AgentResult, Finding, JudgeResult, TaskMode, TaskRecord, ExecutionStep
} from '@workspace/api-client-react';

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export function Logo() {
  return <Link href="/" className="focus-ring flex items-center gap-3" data-testid="link-logo">
    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-primary/45 bg-primary/15 text-primary">
      <Network size={19} strokeWidth={2.5} />
    </span>
    <span className="leading-none"><strong className="block text-[15px] tracking-tight text-sidebar-foreground">AGENT<span className="text-sidebar-primary">LAB</span></strong><small className="mt-1 block font-mono-app text-[8px] tracking-[.18em] text-sidebar-foreground/45">ORCHESTRATION WORKSPACE</small></span>
  </Link>;
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [{ href: '/', label: 'Workspace', icon: Terminal }, { href: '/history', label: 'Run history', icon: HistoryIcon }, { href: '/agents', label: 'Agent catalog', icon: Bot }, { href: '/documentation', label: 'Documentation', icon: BookOpen }];
  return <div className="min-h-[100dvh] bg-background text-foreground">
    <aside className={cn('sidebar-grid fixed inset-y-0 left-0 z-30 flex w-[244px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 transition-transform duration-300 md:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full')} data-testid="sidebar-navigation">
      <div className="mb-9 flex items-center justify-between px-2"><Logo /><button className="focus-ring text-sidebar-foreground/55 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation"><X size={18} /></button></div>
      <div className="mb-3 px-3 font-mono-app text-[9px] uppercase tracking-[.22em] text-sidebar-foreground/38">Control room</div>
      <nav className="space-y-1">{nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={cn('focus-ring group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors', location === href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/62 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground')} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`}><Icon size={16} className={location === href ? 'text-sidebar-primary' : 'text-sidebar-foreground/40'} /><span>{label}</span>{location === href && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}</Link>)}</nav>
      <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3.5">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-sidebar-foreground/80"><span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary shadow-[0_0_0_3px_hsl(var(--sidebar-primary)/.13)]" />Router online</div>
        <p className="font-mono-app text-[10px] leading-relaxed text-sidebar-foreground/40">Provider handshake stable<br />All systems nominal</p>
        <div className="mt-3 flex items-center justify-between border-t border-sidebar-border pt-3 font-mono-app text-[9px] text-sidebar-foreground/38"><span>v0.8.4</span><span>LOCAL</span></div>
      </div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-20 bg-sidebar/40 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" data-testid="button-navigation-overlay" />}
    <main className="min-h-[100dvh] md:pl-[244px]">
      <header className="flex h-[68px] items-center justify-between border-b border-border/75 bg-card/80 px-5 backdrop-blur md:px-9">
        <div className="flex items-center gap-3"><button className="focus-ring rounded-md p-2 text-muted-foreground md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={19} /></button><div className="hidden items-center gap-2 font-mono-app text-[10px] uppercase tracking-[.16em] text-muted-foreground sm:flex"><span>AGENTLAB</span><ChevronRight size={12} /><span className="text-foreground">{location === '/' ? 'RUN / NEW' : location.slice(1).toUpperCase()}</span></div></div>
        <div className="flex items-center gap-4"><div className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>Live execution stream</div><div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary text-[11px] font-bold text-secondary-foreground" data-testid="avatar-user">AK</div></div>
      </header>
      {children}
    </main>
  </div>;
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2 font-mono-app text-[10px] uppercase tracking-[.2em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{eyebrow}</div><h1 className="text-[28px] font-bold tracking-[-.04em] text-foreground sm:text-[34px]">{title}</h1><p className="mt-2 max-w-[570px] text-sm leading-relaxed text-muted-foreground">{description}</p></div>{children}</div>;
}

export function EmptyState({ title, detail, icon: Icon = Search }: { title: string; detail: string; icon?: typeof Search }) {
  return <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 px-6 py-14 text-center"><span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground"><Icon size={19} /></span><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{detail}</p></div>;
}

export function ErrorState({ onRetry, detail = 'The service could not return this workspace data.' }: { onRetry?: () => void; detail?: string }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm"><div className="flex items-center gap-3"><AlertTriangle size={16} className="text-destructive" /><div><p className="font-semibold text-destructive">Signal interrupted</p><p className="text-xs text-muted-foreground">{detail}</p></div></div>{onRetry && <button onClick={onRetry} className="focus-ring inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-secondary" data-testid="button-retry"><RotateCcw size={13} />Retry</button>}</div>;
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
  return <div className="space-y-2" aria-label="Loading"><span className="sr-only">Loading</span>{Array.from({ length: count }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/70" />)}</div>;
}

const modeCopy: Record<string, { label: string; color: string; icon: typeof Radar }> = {
  detective: { label: 'Detective', color: 'text-primary bg-primary/10 border-primary/20', icon: Radar },
  debate: { label: 'Debate', color: 'text-accent-foreground bg-accent/20 border-accent/40', icon: ShieldCheck },
  auto: { label: 'Auto', color: 'text-foreground bg-secondary border-border', icon: Sparkles },
};
export function ModeBadge({ mode }: { mode: string }) {
  const item = modeCopy[mode] ?? modeCopy.auto; const Icon = item.icon;
  return <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono-app text-[9px] font-bold uppercase tracking-[.08em]', item.color)}><Icon size={11} />{item.label}</span>;
}
export function Confidence({ value, label = true }: { value: number; label?: boolean }) {
  const pct = value <= 1 ? Math.round(value * 100) : Math.round(value);
  return <div className="flex items-center gap-2">{label && <span className="font-mono-app text-[10px] text-muted-foreground">CONFIDENCE</span>}<div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, pct)}%` }} /></div><span className="font-mono-app text-[10px] font-bold text-foreground">{pct}%</span></div>;
}
export function formatDate(date: string) { try { return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date)); } catch { return date; } }

export function StepPipeline({ steps }: { steps: ExecutionStep[] }) {
  return <div className="space-y-0">{steps.map((step, i) => <div className="relative flex gap-3" key={step.id || i} data-testid={`step-execution-${step.id || i}`}><div className="flex w-5 flex-col items-center">{i !== steps.length - 1 && <span className="absolute top-5 h-full w-px bg-border" />}<span className={cn('relative z-10 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border', step.status === 'complete' ? 'border-primary bg-primary text-primary-foreground' : step.status === 'active' ? 'border-primary bg-primary/15 text-primary' : step.status === 'error' ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border bg-card text-muted-foreground')}>{step.status === 'complete' ? <Check size={11} /> : step.status === 'active' ? <LoaderCircle size={11} className="animate-spin-slow" /> : step.status === 'error' ? <X size={11} /> : <Circle size={7} />}</span></div><div className="pb-5"><div className="flex flex-wrap items-center gap-2"><p className={cn('text-xs font-semibold', step.status === 'queued' && 'text-muted-foreground')}>{step.label}</p>{step.duration && <span className="font-mono-app text-[9px] text-muted-foreground">{step.duration}ms</span>}</div><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{step.detail}</p></div></div>)}</div>;
}

export function FindingCard({ finding }: { finding: Finding }) {
  const tones: Record<string, string> = { critical: 'bg-destructive text-destructive-foreground', high: 'bg-orange-600 text-white', medium: 'bg-accent text-accent-foreground', low: 'bg-primary/15 text-primary', info: 'bg-secondary text-secondary-foreground' };
  return <div className="border-b border-border/70 py-3 last:border-0" data-testid={`finding-${finding.title.slice(0, 14).replace(/\s/g, '-').toLowerCase()}`}><div className="flex items-start gap-2.5"><span className={cn('mt-0.5 rounded px-1.5 py-0.5 font-mono-app text-[8px] font-bold uppercase', tones[finding.severity] ?? tones.info)}>{finding.severity}</span><div className="min-w-0"><p className="text-xs font-semibold">{finding.title}</p><p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{finding.detail}</p>{finding.recommendation && <p className="mt-2 flex gap-1.5 text-[11px] font-medium text-primary"><ArrowUpRight size={12} className="mt-0.5 shrink-0" />{finding.recommendation}</p>}</div></div></div>;
}

export function AgentResultCard({ result }: { result: AgentResult }) {
  return <article className="rounded-xl border border-border bg-card p-4 card-surface" data-testid={`card-agent-result-${result.agent}`}><div className="mb-3 flex items-start justify-between gap-3"><div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><Bot size={15} /></span><div><h3 className="text-sm font-bold">{result.label}</h3><p className="mt-0.5 font-mono-app text-[9px] uppercase tracking-[.1em] text-muted-foreground">{result.focus}</p></div></div><Confidence value={result.confidence} label={false} /></div><p className="mb-3 text-xs leading-relaxed text-muted-foreground">{result.summary}</p><div className="border-t border-border/70"><p className="mb-1 pt-3 font-mono-app text-[9px] font-bold uppercase tracking-[.16em] text-muted-foreground">Evidence · {result.findings.length} signal{result.findings.length === 1 ? '' : 's'}</p>{result.findings.slice(0, 3).map((finding, i) => <FindingCard key={`${finding.title}-${i}`} finding={finding} />)}</div></article>;
}

export function JudgeCard({ result }: { result: JudgeResult }) {
  return <section className="overflow-hidden rounded-xl border border-primary/30 bg-card card-surface" data-testid="card-judge-result"><div className="flex items-center justify-between border-b border-primary/20 bg-primary/5 px-5 py-3"><div className="flex items-center gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground"><ShieldCheck size={15} /></span><div><p className="font-mono-app text-[9px] uppercase tracking-[.18em] text-primary">JUDGE / SYNTHESIS</p><h2 className="text-sm font-bold">Decision record</h2></div></div><Confidence value={result.confidence} /></div><div className="p-5"><div className="mb-4 flex items-start gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /><div><p className="font-mono-app text-[10px] font-bold uppercase tracking-[.14em] text-primary">RECOMMENDED DECISION</p><h3 className="mt-1 text-lg font-bold tracking-tight">{result.decision}</h3></div></div><p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{result.summary}</p>{result.recommendations?.length > 0 && <div className="mt-5 border-t border-border pt-4"><p className="mb-2 font-mono-app text-[9px] uppercase tracking-[.15em] text-muted-foreground">Next moves</p><ul className="grid gap-2 sm:grid-cols-2">{result.recommendations.map((rec, i) => <li key={i} className="flex gap-2 text-xs leading-relaxed"><Check size={14} className="mt-0.5 shrink-0 text-primary" />{rec}</li>)}</ul></div>}</div></section>;
}

export function TaskRow({ task, selected, onClick }: { task: TaskRecord; selected?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={cn('focus-ring group w-full rounded-lg border bg-card p-3 text-left transition-all hover:-translate-y-px hover:border-primary/45', selected ? 'border-primary/60 bg-primary/5' : 'border-border')} data-testid={`row-task-${task.taskId}`}><div className="mb-2 flex items-center justify-between gap-2"><ModeBadge mode={task.mode} /><span className="font-mono-app text-[9px] text-muted-foreground">{formatDate(task.createdAt)}</span></div><p className="line-clamp-2 text-xs font-semibold leading-relaxed text-foreground">{task.task}</p><div className="mt-2 flex items-center gap-3 font-mono-app text-[9px] text-muted-foreground"><span className="flex items-center gap-1"><Clock3 size={10} />{task.executionTime}ms</span><span className="flex items-center gap-1"><Bot size={10} />{task.agents?.length ?? 0} agents</span></div></button>;
}

export function AgentCard({ agent, index }: { agent: AgentInfo; index: number }) {
  const accents = ['bg-primary/10 text-primary', 'bg-accent/25 text-accent-foreground', 'bg-secondary text-secondary-foreground'];
  return <article className="group rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40 card-surface" data-testid={`card-agent-${agent.id}`}><div className="mb-5 flex items-start justify-between"><div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accents[index % accents.length])}><Bot size={20} /></div><span className="font-mono-app text-[9px] text-muted-foreground">0{index + 1}</span></div><h2 className="text-sm font-bold">{agent.name}</h2><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{agent.focus}</p><div className="mt-5 flex items-center gap-2 border-t border-border pt-3 font-mono-app text-[9px] uppercase tracking-[.12em] text-primary"><Activity size={11} />Available for routing</div></article>;
}

export function RunDetail({ task }: { task: TaskRecord }) {
  return <div className="space-y-5 animate-rise-in"><div className="rounded-xl border border-border bg-card p-5 card-surface"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><ModeBadge mode={task.mode} /><span className={cn('rounded-md border px-2 py-1 font-mono-app text-[9px] font-bold uppercase', task.status === 'running' ? 'border-accent/40 bg-accent/15 text-accent-foreground' : task.status === 'error' ? 'border-destructive/25 bg-destructive/5 text-destructive' : 'border-primary/20 bg-primary/8 text-primary')}>{task.status}</span></div><h2 className="max-w-3xl text-base font-bold leading-relaxed">{task.task}</h2>{task.context && <div className="mt-4 border-l-2 border-primary/40 pl-3 text-xs leading-relaxed text-muted-foreground"><span className="mb-1 block font-mono-app text-[9px] uppercase tracking-[.12em] text-primary">Context supplied</span>{task.context}</div>}<div className="mt-5 flex flex-wrap gap-4 border-t border-border pt-4 font-mono-app text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 size={12} />{task.executionTime}ms elapsed</span><span className="flex items-center gap-1.5"><Database size={12} />{task.provider}</span><span className="flex items-center gap-1.5"><Bot size={12} />{task.agents.length} specialists returned</span></div></div><section className="rounded-xl border border-border bg-card p-5 card-surface"><div className="mb-4 flex items-center justify-between"><div><p className="font-mono-app text-[9px] uppercase tracking-[.16em] text-primary">Execution trace</p><h2 className="mt-1 text-sm font-bold">What is happening now</h2></div>{task.status === 'running' && <LoaderCircle size={16} className="animate-spin-slow text-primary" />}</div><StepPipeline steps={task.steps} /></section><JudgeCard result={task.result} /><div className="grid gap-4 lg:grid-cols-2">{task.agents.map((agent) => <AgentResultCard key={agent.agent} result={agent} />)}</div></div>;
}