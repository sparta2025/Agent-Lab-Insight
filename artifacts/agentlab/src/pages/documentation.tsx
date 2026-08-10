import { ArrowRight, Check, FileCode2, GitBranch, Layers3, ShieldCheck, UploadCloud } from 'lucide-react';
import { Link } from 'wouter';
import { PageHeader, Shell } from '@/components/agentlab-ui';

const steps = [
  ['01', 'Опишите задачу', 'Сформулируйте ошибку, вопрос или архитектурное решение. Чем конкретнее симптомы и ожидаемый результат, тем полезнее вывод.'],
  ['02', 'Добавьте контекст', 'Вставьте лог, код или ограничения в поле Context либо загрузите текстовый файл. Файл читается в буфер браузера и не сохраняется.'],
  ['03', 'Выберите режим', 'Detective ищет проблемы, Debate сравнивает варианты, Auto сам подбирает специалистов по смыслу задачи.'],
  ['04', 'Изучите решение', 'Router назначает агентов, специалисты работают параллельно, Judge сравнивает их выводы и формирует следующий шаг.'],
];

const modes = [
  { name: 'Detective', icon: FileCode2, text: 'Для поиска bugs, security-проблем, подозрительного кода и архитектурных рисков.' },
  { name: 'Debate', icon: GitBranch, text: 'Для спорных решений: несколько независимых мнений, плюсы и минусы, затем единый вердикт Judge.' },
  { name: 'Auto', icon: Layers3, text: 'Для свободно сформулированной задачи. Router сам выбирает наиболее подходящую комбинацию агентов.' },
];

export default function Documentation() {
  return (
    <Shell>
      <div className="shell-grid min-h-[calc(100dvh-68px)]">
        <div className="mx-auto max-w-[1100px] px-5 py-7 md:px-9 lg:py-9">
          <PageHeader
            eyebrow="Field guide"
            title="Документация AgentLab"
            description="Короткое объяснение того, что делает платформа, какие данные ей нужны и как читать результат."
          />
          <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <section className="rounded-xl border border-border bg-card p-5 card-surface sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck size={18} /></span>
                <div><p className="font-mono-app text-[10px] uppercase tracking-[.17em] text-primary">What this is</p><h2 className="mt-1 text-lg font-bold">Маленькая команда аналитиков</h2></div>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">AgentLab не просто отправляет вопрос одной модели. Он запускает оркестратор: Router выбирает специалистов, каждый смотрит на задачу со своей стороны, а Judge собирает итоговую рекомендацию.</p>
              <div className="mt-6 grid gap-3">{steps.map(([number, title, text]) => <div key={number} className="flex gap-3 border-t border-border pt-4"><span className="font-mono-app text-[10px] font-bold text-primary">{number}</span><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p></div></div>)}</div>
            </section>
            <section className="rounded-xl border border-sidebar-border bg-sidebar p-5 text-sidebar-foreground card-surface sm:p-7">
              <div className="mb-6 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary"><UploadCloud size={18} /></span><div><p className="font-mono-app text-[10px] uppercase tracking-[.17em] text-sidebar-primary">Context buffer</p><h2 className="mt-1 text-lg font-bold">Что можно загружать</h2></div></div>
              <p className="text-sm leading-7 text-sidebar-foreground/65">Поддерживаются обычные текстовые файлы: `.txt`, `.md`, `.json`, `.py`, `.js`, `.ts`, `.tsx`, `.log`, `.yaml`, `.yml`, `.html`, `.css` и похожие форматы.</p>
              <div className="mt-5 space-y-2 text-xs text-sidebar-foreground/75"><p className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-sidebar-primary" />Файл читается прямо в буфер браузера.</p><p className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-sidebar-primary" />Он не загружается в хранилище и не сохраняется сервером.</p><p className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-sidebar-primary" />Контекст ограничен 12 000 символами для бесплатного запуска.</p></div>
              <div className="mt-6 border-t border-sidebar-border pt-4"><p className="font-mono-app text-[9px] uppercase tracking-[.14em] text-sidebar-primary">Provider</p><p className="mt-1 text-sm font-semibold">OpenRouter · бесплатная модель</p><p className="mt-1 text-xs text-sidebar-foreground/55">Ключ используется только Python-бэкендом, не frontend.</p></div>
            </section>
          </div>
          <section className="mt-5 rounded-xl border border-border bg-card p-5 card-surface sm:p-7">
            <div className="mb-5"><p className="font-mono-app text-[10px] uppercase tracking-[.17em] text-primary">Modes</p><h2 className="mt-1 text-lg font-bold">Как выбрать режим</h2></div>
            <div className="grid gap-3 md:grid-cols-3">{modes.map(({ name, icon: Icon, text }) => <div key={name} className="rounded-lg border border-border bg-background/50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-foreground"><Icon size={16} className="text-primary" />{name}</div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p></div>)}</div>
          </section>
          <section className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-primary/25 bg-primary/5 p-5 sm:flex-row sm:items-center sm:p-6"><div><p className="font-mono-app text-[10px] uppercase tracking-[.17em] text-primary">Ready to try</p><h2 className="mt-1 text-base font-bold">Начните с конкретной ошибки или решения</h2><p className="mt-1 text-xs text-muted-foreground">Например: «Почему callback авторизации иногда возвращает 401?»</p></div><Link href="/" className="focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-105" data-testid="link-start-analysis">Открыть workspace <ArrowRight size={14} /></Link></section>
        </div>
      </div>
    </Shell>
  );
}