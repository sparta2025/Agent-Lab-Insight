import { useListAgents } from '@workspace/api-client-react';
import { Bot, CircleHelp, RefreshCcw } from 'lucide-react';
import { AgentCard, EmptyState, ErrorState, PageHeader, Shell, SkeletonRows } from '@/components/agentlab-ui';

export default function Agents() {
  const agents = useListAgents();
  return <Shell><div className="shell-grid min-h-[calc(100dvh-68px)]"><div className="mx-auto max-w-[1450px] px-5 py-7 md:px-9 lg:py-9">
    <PageHeader eyebrow="Routing index" title="Agent catalog" description="A focused set of specialists for turning fuzzy engineering questions into inspectable signals. The router selects the right panel for each task." />
    {agents.isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><SkeletonRows count={6} /></div> : agents.isError ? <ErrorState onRetry={() => agents.refetch()} detail="The available specialist roster could not be loaded." /> : (agents.data ?? []).length === 0 ? <EmptyState title="No specialists registered" detail="The router has no available agents to assign yet." icon={CircleHelp} /> : <><div className="mb-5 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bot size={16} /></span><div><p className="text-xs font-semibold">Registry status</p><p className="text-[11px] text-muted-foreground">All registered specialists can receive new work.</p></div></div><div className="flex items-center gap-2 font-mono-app text-[10px] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{agents.data?.length} online</div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{agents.data?.map((agent, index) => <AgentCard key={agent.id} agent={agent} index={index} />)}</div></>}
  </div></div></Shell>;
}