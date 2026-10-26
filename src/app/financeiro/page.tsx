import { auth } from "@/../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NavHeader } from "@/components/NavHeader";

const COLUNAS = [
  {
    titulo: "Novas",
    statuses: ["ENVIADA", "REENVIADA"],
    accent: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    titulo: "Em análise",
    statuses: ["EM_ANALISE"],
    accent: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
    iconBg: "bg-indigo-50 text-indigo-600",
  },
  {
    titulo: "Correção solicitada",
    statuses: ["CORRECAO_SOLICITADA"],
    accent: "bg-[var(--gold-dark)]",
    badge: "bg-[var(--gold-light)] text-[var(--warning)] border-[var(--warning-border)]",
    iconBg: "bg-[var(--gold-light)] text-[var(--warning)]",
  },
  {
    titulo: "Aprovadas",
    statuses: ["APROVADA"],
    accent: "bg-[var(--success)]",
    badge: "status-success",
    iconBg: "bg-[var(--success-light)] text-[var(--success)]",
  },
] as const;

function formatarValor(valor: unknown) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return String(valor);
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarTipo(tipo: string) {
  const tipos: Record<string, string> = {
    VERBA: "Verba",
    CUSTEIO: "Custeio",
    REEMBOLSO: "Reembolso",
  };

  return tipos[tipo] ?? tipo;
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; solicitante?: string }>;
}) {
  const session = await auth();
  const filtros = await searchParams;

  if (!session?.user) {
    redirect("/login");
  }

  const perfisPermitidos = [
    "ANALISTA_FINANCEIRO",
    "GESTOR_FINANCEIRO",
    "ADMINISTRADOR_SISTEMA",
  ];

  if (!perfisPermitidos.includes(session.user.perfil)) {
    redirect("/dashboard");
  }

  const solicitacoes = await prisma.solicitacao.findMany({
    where: {
      status: {
        in: [
          "ENVIADA",
          "REENVIADA",
          "EM_ANALISE",
          "CORRECAO_SOLICITADA",
          "APROVADA",
        ],
      },
      ...(filtros.tipo
        ? {
          tipo: filtros.tipo as "VERBA" | "CUSTEIO" | "REEMBOLSO",
        }
        : {}),
      ...(filtros.solicitante
        ? {
          solicitante: {
            nome: {
              contains: filtros.solicitante,
              mode: "insensitive",
            },
          },
        }
        : {}),
    },
    include: {
      solicitante: true,
    },
    orderBy: { criadoEm: "asc" },
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <NavHeader
        nome={session.user.name ?? ""}
        perfil={session.user.perfil}
      />

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Cabeçalho */}
        <section className="animate-fade-in mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "var(--gold-dark)" }}
                />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Gestão administrativa e financeira
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-[28px]">
                Quadro de Solicitações
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Acompanhe e analise as solicitações conforme a etapa atual do
                fluxo administrativo.
              </p>
            </div>

            <div className="surface-card inline-flex items-center gap-3 px-4 py-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold"
                style={{
                  backgroundColor: "var(--gold-light)",
                  color: "var(--warning)",
                }}
              >
                {solicitacoes.length}
              </div>

              <div className="leading-tight">
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  Processos no quadro
                </p>

                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  Considerando os filtros atuais
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="animate-fade-in stagger-1 mb-6">
          <div className="surface-card p-5">
            <div className="mb-4">
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                Filtros
              </h2>

              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Refine os processos exibidos no quadro.
              </p>
            </div>

            <form className="flex flex-col gap-4 xl:flex-row xl:items-end">
              <div className="w-full xl:max-w-xs">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Tipo de solicitação
                </label>

                <select
                  name="tipo"
                  defaultValue={filtros.tipo ?? ""}
                  className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm font-medium text-[var(--text-primary)] outline-none transition-all duration-150 hover:border-[var(--border-strong)] focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                >
                  <option value="">Todos</option>
                  <option value="VERBA">Verba</option>
                  <option value="CUSTEIO">Custeio</option>
                  <option value="REEMBOLSO">Reembolso</option>
                </select>
              </div>

              <div className="w-full xl:max-w-sm">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Solicitante
                </label>

                <input
                  type="text"
                  name="solicitante"
                  defaultValue={filtros.solicitante ?? ""}
                  placeholder="Nome do solicitante"
                  className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--text-primary)] outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-[var(--border-strong)] focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="press inline-flex h-11 items-center justify-center rounded-lg bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-sm hover:bg-[var(--brand-soft)] hover:shadow-md"
                >
                  Filtrar
                </button>

                <Link
                  href="/financeiro"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                >
                  Limpar
                </Link>
              </div>
            </form>
          </div>
        </section>

        {/* Kanban */}
                <section className="animate-fade-in stagger-2">
          <nav
            className="mb-4 flex gap-2 overflow-x-auto pb-1 xl:hidden"
            aria-label="Ir para a coluna"
          >
            {COLUNAS.map((c, i) => (
              <a
                key={c.titulo}
                href={`#coluna-${i}`}
                className="shrink-0 rounded-full border border-[var(--border)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--text-secondary)] shadow-[var(--shadow-xs)]"
              >
                {c.titulo} ·{" "}
                {
                  solicitacoes.filter((s) =>
                    (c.statuses as readonly string[]).includes(s.status)
                  ).length
                }
              </a>
            ))}
          </nav>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                        {COLUNAS.map((coluna, index) => {
              const itens = solicitacoes.filter((s) =>
                (coluna.statuses as readonly string[]).includes(s.status)
              );

              return (
                                <div
                  key={coluna.titulo}
                  id={`coluna-${index}`}
                  className="flex scroll-mt-20 flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 xl:min-h-[500px]"
                >
                  {/* Cabeçalho da coluna */}
                  <div className="mb-3 rounded-xl bg-white p-4 shadow-[var(--shadow-xs)]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${coluna.accent}`}
                        />

                        <h2 className="truncate text-sm font-extrabold text-[var(--text-primary)]">
                          {coluna.titulo}
                        </h2>
                      </div>

                      <span
                        className={`flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-[11px] font-extrabold ${coluna.badge}`}
                      >
                        {itens.length}
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-[var(--text-muted)]">
                      {itens.length === 0
                        ? "Nenhuma solicitação nesta etapa."
                        : itens.length === 1
                          ? "1 processo aguardando atendimento."
                          : `${itens.length} processos aguardando atendimento.`}
                    </p>
                  </div>

                  {/* Cartões */}
                  <div className="flex flex-1 flex-col gap-3">
                    {itens.map((s) => (
                      <Link
                        key={s.id}
                        href={`/solicitacoes/${s.id}?from=financeiro`}
                        className="group block rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <span className="truncate text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                            {s.numero}
                          </span>

                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${coluna.accent}`}
                          />
                        </div>

                        <h3 className="line-clamp-2 text-sm font-extrabold leading-5 text-[var(--text-primary)] transition-colors group-hover:text-[var(--gold-dark)]">
                          {s.titulo}
                        </h3>

                        <div className="mt-4 space-y-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] font-medium text-[var(--text-muted)]">
                              Solicitante
                            </span>

                            <span className="max-w-[60%] truncate text-right text-xs font-semibold text-[var(--text-secondary)]">
                              {s.solicitante.nome}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[11px] font-medium text-[var(--text-muted)]">
                              Tipo
                            </span>

                            <span className="rounded-full bg-[var(--surface-muted)] px-2 py-1 text-[11px] font-bold text-[var(--text-secondary)]">
                              {formatarTipo(s.tipo)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-2.5">
                            <span className="text-[11px] font-medium text-[var(--text-muted)]">
                              Valor solicitado
                            </span>

                            <span className="text-sm font-extrabold text-[var(--text-primary)]">
                              {formatarValor(s.valorSolicitado)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end border-t border-[var(--border-soft)] pt-3">
                          <span className="text-[11px] font-bold text-[var(--text-muted)] transition-colors group-hover:text-[var(--gold-dark)]">
                            Abrir processo →
                          </span>
                        </div>
                      </Link>
                    ))}

                    {itens.length === 0 && (
                      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-white/60 px-4 py-8 text-center xl:py-12">
                        <div
                          className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold"
                          style={{
                            backgroundColor: "var(--surface-soft)",
                            color: "var(--text-muted)",
                          }}
                        >
                          —
                        </div>

                        <p className="text-xs font-semibold text-[var(--text-secondary)]">
                          Nenhuma solicitação
                        </p>

                        <p className="mt-1 max-w-[180px] text-[11px] leading-5 text-[var(--text-muted)]">
                          Não há processos correspondentes nesta coluna.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}