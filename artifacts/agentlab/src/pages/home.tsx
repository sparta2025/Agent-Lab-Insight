import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowRight, FileCode2, FileText, LoaderCircle, Plus, Upload, X } from 'lucide-react';
import { getListTasksQueryKey, useCreateTask, useHealthCheck, useListAgents, useListTasks } from '@workspace/api-client-react';
import type { TaskMode, TaskRecord } from '@workspace/api-client-react';
import { ErrorState, EmptyState, ModeBadge, PageHeader, RunDetail, Shell, SkeletonRows, TaskRow, cn } from '@/components/agentlab-ui';

const modes: Array<{ value: TaskMode; title: string; detail: string }> = [
  { value: 'detective', title: 'Detective', detail: 'Trace ambiguity to evidence and likely root causes.' },
  { value: 'debate', title: 'Debate', detail: 'Put competing implementation paths under scrutiny.' },
  { value: 'auto', title: 'Auto', detail: 'Let the router choose the strongest analysis shape.' },
];

export default function Home() {
  const queryClient = useQueryClient();
  const health = useHealthCheck();
  const agents = useListAgents();
  const tasks = useListTasks();
  const createTask = useCreateTask();
  const [task, setTask] = useState('');
  const [context, setContext] = useState('');
  const [mode, setMode] = useState<TaskMode>('auto');
  const [selected, setSelected] = useState<TaskRecord | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const recent = useMemo(() => (tasks.data ?? []).slice(0, 4), [tasks.data]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (task.trim().length < 3 || createTask.isPending) return;
    setSubmitted(true);
    createTask.mutate({ data: { task: task.trim(), mode, context: context.trim() || undefined } }, {
      onSuccess: (record) => { setSelected(record); setSubmitted(false); setTask(''); setContext(''); queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() }); },
      onError: () => setSubmitted(false),
    });
  };
  const loadFileIntoBuffer = async (file: File) => {
    setFileError('');
    if (file.size > 500_000) {
      setFileError('Файл больше 500 KB. Выберите небольшой текстовый файл.');
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      const decoded = new TextDecoder().decode(buffer).slice(0, 12000);
      setContext(decoded);
      setFileName(file.name);
    } catch {
      setFileError('Не удалось прочитать файл как текст.');
    }
  };
  const clearFile = () => {
    setFileName('');
    setFileError('');
  };
  return <Shell><div className="shell-grid min-h-[calc(100dvh-68px)]"><div className="mx-auto max-w-[1450px] px-5 py-7 md:px-9 lg:py-9">
    <PageHeader eyebrow="Analysis workspace" title="Make the unknown inspectable." description="Route a code problem through focused specialists, then review the evidence behind the decision." />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(330px,.92fr)]">
      <section className="rounded-xl border border-border bg-card p-5 card-surface sm:p-6" data-testid="panel-task-composer"><div className="mb-5 flex items-center justify-between"><div><div className="mb-1 flex items-center gap-2 text-sm font-bold"><Plus size={16} className="text-primary" />New analysis</div><p className="text-xs text-muted-foreground">Describe the decision you need help making.</p></div><span className="font-mono-app text-[9px] uppercase tracking-[.15em] text-muted-foreground">Input / 01</span></div>
        <form onSubmit={submit} className="space-y-5"><div><label htmlFor="task-input" className="mb-2 block font-mono-app text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground">Problem statement</label><textarea id="task-input" value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g. Why does the checkout worker occasionally process the same event twice?" className="focus-ring min-h-[132px] w-full resize-y rounded-lg border border-input bg-background/70 px-3.5 py-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary" data-testid="input-task" required minLength={3} maxLength={4000} /><div className="mt-1.5 text-right font-mono-app text-[9px] text-muted-foreground">{task.length}/4000</div></div>
          <div><label className="mb-2 block font-mono-app text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground">Routing mode</label><div className="grid gap-2 sm:grid-cols-3">{modes.map((item) => <button key={item.value} type="button" onClick={() => setMode(item.value)} className={cn('focus-ring rounded-lg border p-3 text-left transition-all', mode === item.value ? 'border-primary bg-primary/8' : 'border-border bg-background/40 hover:border-primary/35')} data-testid={`button-mode-${item.value}`}><div className="mb-1 flex items-center justify-between"><span className={cn('text-xs font-bold', mode === item.value && 'text-primary')}>{item.title}</span><span className={cn('h-3 w-3 rounded-full border-2', mode === item.value ? 'border-primary bg-primary' : 'border-muted-foreground/40')} /></div><p className="text-[10px] leading-relaxed text-muted-foreground">{item.detail}</p></button>)}</div></div>
          <div><label htmlFor="context-input" className="mb-2 flex items-center justify-between font-mono-app text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground"><span>Context <em className="font-sans font-normal normal-case tracking-normal text-muted-foreground/70">(optional)</em></span><span>{context.length}/12000</span></label><textarea id="context-input" value={context} onChange={(e) => { setContext(e.target.value); if (fileName) clearFile(); }} placeholder="Paste logs, constraints, or relevant architecture notes." className="focus-ring min-h-[82px] w-full resize-y rounded-lg border border-input bg-background/70 px-3.5 py-3 text-xs leading-relaxed outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary" maxLength={12000} data-testid="input-context" /><div className="mt-2 flex flex-wrap items-center gap-2"><label className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary px-2.5 py-2 text-[10px] font-semibold text-secondary-foreground transition-colors hover:border-primary/40 hover:text-primary" data-testid="label-upload-context"><Upload size={13} />Load text file<input type="file" className="sr-only" accept=".txt,.md,.json,.py,.js,.jsx,.ts,.tsx,.log,.yaml,.yml,.html,.css,.csv,.xml" onChange={(e) => { const file = e.target.files?.[0]; if (file) void loadFileIntoBuffer(file); e.currentTarget.value = ''; }} data-testid="input-context-file" /></label>{fileName && <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2 text-[10px] text-primary"><FileCode2 size={12} />{fileName}<button type="button" onClick={clearFile} className="focus-ring ml-1" aria-label="Clear loaded file" data-testid="button-clear-context-file"><X size={12} /></button></span>}<span className="text-[10px] text-muted-foreground">Reads into browser memory only.</span></div>{fileError && <p className="mt-2 text-[11px] text-destructive">{fileError}</p>}</div>
          {createTask.isError && <ErrorState detail="The task could not be submitted. Check the server connection and try again." onRetry={() => createTask.reset()} />}
          <button type="submit" disabled={task.trim().length < 3 || createTask.isPending || submitted} className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45" data-testid="button-submit-task">{createTask.isPending || submitted ? <><LoaderCircle size={16} className="animate-spin-slow" />Routing task...</> : <>Run analysis <ArrowRight size={16} /></>}</button>
        </form>
      </section>
      <section className="space-y-5"><div className="rounded-xl border border-border bg-card p-5 card-surface"><div className="mb-5 flex items-center justify-between"><div><p className="font-mono-app text-[10px] uppercase tracking-[.17em] text-primary">Router telemetry</p><h2 className="mt-1 text-base font-bold">Execution pipeline</h2></div><span className={cn('flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono-app text-[9px] font-bold uppercase', health.isError ? 'border-destructive/25 bg-destructive/5 text-destructive' : 'border-primary/20 bg-primary/8 text-primary')}><span className="h-1.5 w-1.5 rounded-full bg-current" />{health.isLoading ? 'Checking' : health.isError ? 'Offline' : 'Ready'}</span></div><div className="space-y-3">{['Task intake', 'Router selects specialists', 'Parallel analysis', 'Judge synthesis'].map((label, i) => <div className="flex items-center gap-3" key={label}><span className={cn('flex h-7 w-7 items-center justify-center rounded-md font-mono-app text-[10px] font-bold', i === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground')}>0{i + 1}</span><div className="h-px flex-1 bg-border"><span className={cn('block h-px bg-primary', i === 0 ? 'w-full' : 'w-0')} /></div><span className={cn('text-xs font-semibold', i === 0 ? 'text-foreground' : 'text-muted-foreground')}>{label}</span></div>)}</div><p className="mt-5 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">Each run leaves a traceable record: who analyzed, what they found, and how the Judge arrived at its call.</p></div>
        <div className="rounded-xl border border-border bg-sidebar p-5 text-sidebar-foreground"><div className="flex items-center justify-between"><div><p className="font-mono-app text-[10px] uppercase tracking-[.17em] text-sidebar-primary">Available now</p><h2 className="mt-1 text-base font-bold">Specialist agents</h2></div><Link href="/agents" className="focus-ring text-[11px] font-semibold text-sidebar-primary hover:underline" data-testid="link-view-agents">View catalog</Link></div><div className="mt-4 grid gap-2">{agents.isLoading ? <SkeletonRows count={3} /> : agents.isError ? <p className="text-xs text-sidebar-foreground/55">Agent catalog unavailable.</p> : (agents.data ?? []).slice(0, 3).map((agent) => <div key={agent.id} className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary/15 text-sidebar-primary"><FileText size={14} /></span><div className="min-w-0"><p className="truncate text-xs font-semibold">{agent.name}</p><p className="truncate text-[10px] text-sidebar-foreground/45">{agent.focus}</p></div><span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" /></div>)}</div></div>
      </section>
    </div>
    {selected && <div className="mt-8"><div className="mb-4 flex items-center justify-between"><div><p className="font-mono-app text-[10px] uppercase tracking-[.17em] text-primary">Latest synthesis</p><h2 className="mt-1 text-xl font-bold">Your analysis, decoded</h2></div><button onClick={() => setSelected(null)} className="focus-ring text-xs text-muted-foreground hover:text-foreground" data-testid="button-dismiss-result">Dismiss</button></div><RunDetail task={selected} /></div>}
    <section className="mt-10"><div className="mb-4 flex items-end justify-between"><div><p className="font-mono-app text-[10px] uppercase tracking-[.17em] text-primary">Memory buffer</p><h2 className="mt-1 text-xl font-bold">Recent runs</h2></div><Link href="/history" className="focus-ring flex items-center gap-1 text-xs font-semibold text-primary hover:underline" data-testid="link-view-history">Open history <ArrowRight size={13} /></Link></div>{tasks.isLoading ? <SkeletonRows /> : tasks.isError ? <ErrorState onRetry={() => tasks.refetch()} /> : recent.length === 0 ? <EmptyState title="No analyses in memory" detail="Your completed investigations will appear here, with their evidence trail intact." icon={FileText} /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{recent.map((item) => <TaskRow task={item} key={item.taskId} onClick={() => setSelected(item)} />)}</div>}</section>
  </div></div></Shell>;
}