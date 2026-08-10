import { useMemo, useState } from 'react';
import { useGetTask, useListTasks, getGetTaskQueryKey } from '@workspace/api-client-react';
import { ArrowRight, FileClock, PanelRight, Search } from 'lucide-react';
import { ErrorState, EmptyState, PageHeader, RunDetail, Shell, SkeletonRows, TaskRow } from '@/components/agentlab-ui';

export default function History() {
  const tasks = useListTasks();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = useGetTask(selectedId ?? '', { query: { enabled: Boolean(selectedId), queryKey: getGetTaskQueryKey(selectedId ?? '') } });
  const records = useMemo(() => tasks.data ?? [], [tasks.data]);
  return <Shell><div className="shell-grid min-h-[calc(100dvh-68px)]"><div className="mx-auto max-w-[1450px] px-5 py-7 md:px-9 lg:py-9">
    <PageHeader eyebrow="Memory buffer" title="Run history" description="Every analysis leaves an evidence trail. Select a run to inspect its specialists, steps, and final synthesis." />
    {tasks.isLoading ? <SkeletonRows count={5} /> : tasks.isError ? <ErrorState onRetry={() => tasks.refetch()} /> : records.length === 0 ? <EmptyState title="History is clear" detail="No task executions are stored yet. Start with a new analysis in the workspace." icon={FileClock} /> : <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
      <section className="space-y-2" data-testid="list-task-history"><div className="mb-3 flex items-center justify-between px-1"><span className="font-mono-app text-[10px] uppercase tracking-[.15em] text-muted-foreground">{records.length} execution{records.length === 1 ? '' : 's'}</span><span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Search size={11} />In memory</span></div>{records.map((task) => <TaskRow key={task.taskId} task={task} selected={task.taskId === selectedId} onClick={() => setSelectedId(task.taskId)} />)}</section>
      <section className="min-w-0" data-testid="panel-history-detail">{detail.isLoading ? <SkeletonRows count={4} /> : detail.isError ? <ErrorState onRetry={() => detail.refetch()} /> : detail.data ? <RunDetail task={detail.data} /> : <div className="flex min-h-[440px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 text-center"><span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><PanelRight size={20} /></span><h2 className="text-base font-bold">Choose an execution</h2><p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">Select a task from the memory buffer to open the complete analysis record.</p><div className="mt-5 flex items-center gap-2 font-mono-app text-[9px] uppercase tracking-[.14em] text-primary">Select a run <ArrowRight size={12} /></div></div>}</section>
    </div>}
  </div></div></Shell>;
}