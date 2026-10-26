import { auth, signOut } from "@/../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NavHeader } from "@/components/NavHeader";
import {
  marcarTodasComoLidas,
  excluirNotificacao,
} from "./notificacoes-actions";
import {
  arquivarSolicitacao,
  desarquivarSolicitacao,
} from "@/app/solicitacoes/[id]/actions";

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  RASCUNHO: {
    label: "Rascunho",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dotClassName: "bg-slate-400",
  },
  ENVIADA: {
    label: "Enviada",
    className: "bg-blue-50 text-blue-700 border-blue-100",
    dotClassName: "bg-blue-500",
  },
  EM_ANALISE: {
    label: "Em análise",
    className: "bg-indigo-50 text-indigo-700 border-indigo-100",
    dotClassName: "bg-indigo-500",
  },
  CORRECAO_SOLICITADA: {
    label: "Correção solicitada",
    className: "status-warning",
    dotClassName: "bg-[var(--warning)]",
  },
  REENVIADA: {
    label: "Reenviada",
    className: "bg-blue-50 text-blue-700 border-blue-100",
    dotClassName: "bg-blue-500",
  },
  APROVADA: {
    label: "Aprovada",
    className: "status-success",
    dotClassName: "bg-[var(--success)]",
  },
  EXECUTADA_PAGA: {
    label: "Executada / Paga",
    className: "status-success",
    dotClassName: "bg-[var(--success)]",
  },
  ENCERRADA: {
    label: "Encerrada",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dotClassName: "bg-emerald-500",
  },
  REJEITADA: {
    label: "Rejeitada",
    className: "status-danger",
    dotClassName: "bg-[var(--danger)]",
  },
  CANCELADA: {
    label: "Cancelada",
    className: "status-danger",
    dotClassName: "bg-[var(--danger)]",
  },
};

function getStatusConfig(status: string) {
  return (
    statusConfig[status] ?? {
      label: status,
      className: "bg-slate-100 text-slate-600 border-slate-200",
      dotClassName: "bg-slate-400",
    }
  );
}

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; arquivadas?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const filtros = await searchParams;

  const mostrarArquivadas = filtros.arquivadas === "true";

  const todasSolicitacoes = await prisma.solicitacao.findMany({
    where: {
      solicitanteId: session.user.id,
      arquivada: mostrarArquivadas,
    },
    orderBy: { criadoEm: "desc" },
  });

  const solicitacoes = filtros.status
    ? todasSolicitacoes.filter((s) => s.status === filtros.status)
    : todasSolicitacoes;

  const notificacoes = await prisma.notificacao.findMany({
    where: { usuarioId: session.user.id },
    orderBy: { criadoEm: "desc" },
    take: 10,
  });

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const solicitacoesNaoArquivadas = mostrarArquivadas
    ? await prisma.solicitacao.findMany({
      where: {
        solicitanteId: session.user.id,
        arquivada: false,
      },
    })
    : todasSolicitacoes;

  const contagem = {
    emAnalise: solicitacoesNaoArquivadas.filter((s) =>
      ["ENVIADA", "EM_ANALISE", "REENVIADA"].includes(s.status)
    ).length,

    aguardandoCorrecao: solicitacoesNaoArquivadas.filter(
      (s) => s.status === "CORRECAO_SOLICITADA"
    ).length,

    aprovadas: solicitacoesNaoArquivadas.filter((s) =>
      ["APROVADA", "EXECUTADA_PAGA", "ENCERRADA"].includes(s.status)
    ).length,

    rejeitadas: solicitacoesNaoArquivadas.filter((s) =>
      ["REJEITADA", "CANCELADA"].includes(s.status)
    ).length,
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <NavHeader
        nome={session.user.name ?? ""}
        perfil={session.user.perfil}
        naoLidas={naoLidas}
      />

      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Cabeçalho da página */}
        <section className="animate-fade-in mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "var(--gold-dark)" }}
                />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Área do solicitante
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-[28px]">
                Minhas Solicitações
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Acompanhe o andamento, consulte os documentos e visualize as
                decisões dos seus processos financeiros.
              </p>
            </div>

            <Link
              href="/solicitacoes/nova"
              className="press inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-[#1a1d24] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{ backgroundColor: "var(--gold)" }}
            >
              <span className="text-base leading-none">+</span>
              Nova Solicitação
            </Link>
          </div>
        </section>

        {/* Notificações */}
        {notificacoes.length > 0 && (
          <section className="animate-fade-in stagger-1 mb-6">
            <div className="surface-card overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-[var(--border-soft)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-[#1a1d24]"
                    style={{ backgroundColor: "var(--gold-light)" }}
                  >
                    !
                  </span>

                  <div>
                    <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                      Notificações
                    </h2>

                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      Acompanhe as movimentações recentes dos seus processos.
                    </p>
                  </div>
                </div>

                {naoLidas > 0 && (
                  <form action={marcarTodasComoLidas}>
                    <button
                      type="submit"
                      className="self-start rounded-md px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] sm:self-auto"
                    >
                      Marcar todas como lidas
                    </button>
                  </form>
                )}
              </div>

              <ul className="divide-y divide-[var(--border-soft)]">
                {notificacoes.map((n) => (
                  <li
                    key={n.id}
                    className={`flex gap-4 px-5 py-4 transition-colors ${n.lida
                      ? "bg-white"
                      : "bg-[var(--gold-light)]/35"
                      }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.lida
                        ? "bg-slate-300"
                        : "bg-[var(--gold-dark)]"
                        }`}
                    />

                    <div className="min-w-0 flex-1">
                      <p
                        className={`break-words text-sm leading-6 ${n.lida
                          ? "text-[var(--text-secondary)]"
                          : "font-medium text-[var(--text-primary)]"
                          }`}
                      >
                        {n.mensagem}
                      </p>

                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                        {n.criadoEm.toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <form
                      action={excluirNotificacao}
                      className="shrink-0 self-start"
                    >
                      <input
                        type="hidden"
                        name="notificacaoId"
                        value={n.id}
                      />

                      <button
                        type="submit"
                        className="rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 transition hover:bg-red-50 hover:text-[var(--danger)]"
                      >
                        Excluir
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Filtros */}
        <section className="animate-fade-in stagger-2 mb-6">
          <div className="surface-card p-5">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                Filtros
              </h2>

              <p className="text-xs text-[var(--text-muted)]">
                Refine a visualização das suas solicitações.
              </p>
            </div>

            <form className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="w-full lg:max-w-xs">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Status
                </label>

                <select
                  name="status"
                  defaultValue={filtros.status ?? ""}
                  className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm font-medium text-[var(--text-primary)] outline-none transition-all duration-150 hover:border-[var(--border-strong)] focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                >
                  <option value="">Todos</option>
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="ENVIADA">Enviada</option>
                  <option value="EM_ANALISE">Em Análise</option>
                  <option value="CORRECAO_SOLICITADA">
                    Correção Solicitada
                  </option>
                  <option value="REENVIADA">Reenviada</option>
                  <option value="APROVADA">Aprovada</option>
                  <option value="EXECUTADA_PAGA">Executada/Paga</option>
                  <option value="ENCERRADA">Encerrada</option>
                  <option value="REJEITADA">Rejeitada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="press inline-flex h-11 items-center justify-center rounded-lg bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-sm hover:bg-[var(--brand-soft)] hover:shadow-md"
                >
                  Filtrar
                </button>

                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]"
                >
                  Limpar
                </Link>
              </div>

              <div className="lg:ml-auto">
                <Link
                  href={
                    mostrarArquivadas
                      ? "/dashboard"
                      : "/dashboard?arquivadas=true"
                  }
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)] sm:w-auto"
                >
                  {mostrarArquivadas ? "Ver Ativas" : "Ver Arquivadas"}
                </Link>
              </div>
            </form>
          </div>
        </section>

        {/* Resumo */}
        <section className="animate-fade-in stagger-3 mb-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="surface-card card-hover group p-5">
              <div className="mb-4 flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Em andamento
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                  →
                </span>
              </div>

              <p className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {contagem.emAnalise}
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                Enviadas, em análise ou reenviadas
              </p>
            </div>

            <div className="surface-card card-hover group p-5">
              <div className="mb-4 flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Pendências
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gold-light)] text-xs font-bold text-[var(--warning)]">
                  !
                </span>
              </div>

              <p className="text-3xl font-extrabold tracking-tight text-[var(--warning)]">
                {contagem.aguardandoCorrecao}
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                Aguardando sua correção
              </p>
            </div>

            <div className="surface-card card-hover group p-5">
              <div className="mb-4 flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Resultados positivos
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success-light)] text-xs font-bold text-[var(--success)]">
                  ✓
                </span>
              </div>

              <p className="text-3xl font-extrabold tracking-tight text-[var(--success)]">
                {contagem.aprovadas}
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                Aprovadas, executadas ou encerradas
              </p>
            </div>

            <div className="surface-card card-hover group p-5">
              <div className="mb-4 flex items-start justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  Encerradas sem aprovação
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--danger-light)] text-xs font-bold text-[var(--danger)]">
                  ×
                </span>
              </div>

              <p className="text-3xl font-extrabold tracking-tight text-[var(--danger)]">
                {contagem.rejeitadas}
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
                Rejeitadas ou canceladas
              </p>
            </div>
          </div>
        </section>

        {/* Lista de solicitações */}
        <section className="animate-fade-in stagger-4">
          <div className="surface-card overflow-hidden">
            <div className="flex flex-col gap-2 border-b border-[var(--border-soft)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                  {mostrarArquivadas
                    ? "Solicitações arquivadas"
                    : "Solicitações recentes"}
                </h2>

                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {solicitacoes.length === 0
                    ? "Nenhuma solicitação encontrada."
                    : `${solicitacoes.length} ${solicitacoes.length === 1
                      ? "solicitação encontrada"
                      : "solicitações encontradas"
                    }`}
                </p>
              </div>

              <div className="hidden text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)] md:block">
                Clique em uma solicitação para abrir o processo
              </div>
            </div>

            {solicitacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div
                  className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold text-[#1a1d24]"
                  style={{ backgroundColor: "var(--gold-light)" }}
                >
                  ₣
                </div>

                <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                  Nenhuma solicitação encontrada
                </h3>

                <p className="mt-1.5 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                  Você ainda não possui solicitações nessa visualização.
                  Comece criando um novo processo financeiro.
                </p>

                {!mostrarArquivadas && (
                  <Link
                    href="/solicitacoes/nova"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-[#1a1d24] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ backgroundColor: "var(--gold)" }}
                  >
                    <span>+</span>
                    Nova Solicitação
                  </Link>
                )}
              </div>
            ) : (
              <div className="md:overflow-x-auto">
                {/* Celular: lista em cartões */}
                <ul className="divide-y divide-[var(--border-soft)] md:hidden">
                  {solicitacoes.map((s) => {
                    const status = getStatusConfig(s.status);

                    return (
                      <li key={s.id} className="p-4">
                        <Link href={`/solicitacoes/${s.id}`} className="block">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                              {s.numero}
                            </span>

                            <span
                              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-bold ${status.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
                              />
                              {status.label}
                            </span>
                          </div>

                          <p className="mt-2 break-words text-sm font-bold leading-5 text-[var(--text-primary)]">
                            {s.titulo}
                          </p>

                          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                            <span className="text-[var(--text-secondary)]">
                              {s.tipo}
                            </span>
                            <span className="font-extrabold text-[var(--text-primary)]">
                              {formatarValor(s.valorSolicitado)}
                            </span>
                          </div>
                        </Link>

                        {["ENCERRADA", "REJEITADA", "CANCELADA"].includes(
                          s.status
                        ) && (
                            <form
                              action={
                                mostrarArquivadas
                                  ? desarquivarSolicitacao
                                  : arquivarSolicitacao
                              }
                              className="mt-3"
                            >
                              <input
                                type="hidden"
                                name="solicitacaoId"
                                value={s.id}
                              />
                              <button
                                type="submit"
                                className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-secondary)]"
                              >
                                {mostrarArquivadas ? "Desarquivar" : "Arquivar"}
                              </button>
                            </form>
                          )}
                      </li>
                    );
                  })}
                </ul>

                <table className="hidden w-full min-w-[900px] text-left text-sm md:table">
                  <thead className="bg-[var(--surface-soft)]">
                    <tr className="border-b border-[var(--border-soft)]">
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        Número
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        Título
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        Tipo
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        Valor
                      </th>

                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        Ação
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {solicitacoes.map((s) => {
                      const status = getStatusConfig(s.status);

                      return (
                        <tr
                          key={s.id}
                          className="group border-b border-[var(--border-soft)] last:border-b-0 hover:bg-[var(--surface-soft)]"
                        >
                          <td className="px-5 py-4">
                            <Link
                              href={`/solicitacoes/${s.id}`}
                              className="block font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--gold-dark)]"
                            >
                              {s.numero}
                            </Link>
                          </td>

                          <td className="max-w-[320px] px-5 py-4">
                            <Link
                              href={`/solicitacoes/${s.id}`}
                              className="block overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[var(--text-primary)] transition-colors hover:text-[var(--gold-dark)]"
                              title={s.titulo}
                            >
                              {s.titulo}
                            </Link>
                          </td>

                          <td className="px-5 py-4 text-[var(--text-secondary)]">
                            <Link
                              href={`/solicitacoes/${s.id}`}
                              className="block"
                            >
                              {s.tipo}
                            </Link>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-[var(--text-primary)]">
                            <Link
                              href={`/solicitacoes/${s.id}`}
                              className="block"
                            >
                              {formatarValor(s.valorSolicitado)}
                            </Link>
                          </td>

                          <td className="px-5 py-4">
                            <Link
                              href={`/solicitacoes/${s.id}`}
                              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-bold ${status.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
                              />
                              {status.label}
                            </Link>
                          </td>

                          <td className="px-5 py-4 text-right">
                            {["ENCERRADA", "REJEITADA", "CANCELADA"].includes(
                              s.status
                            ) && (
                                <form
                                  action={
                                    mostrarArquivadas
                                      ? desarquivarSolicitacao
                                      : arquivarSolicitacao
                                  }
                                >
                                  <input
                                    type="hidden"
                                    name="solicitacaoId"
                                    value={s.id}
                                  />

                                  <button
                                    type="submit"
                                    className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                                  >
                                    {mostrarArquivadas
                                      ? "Desarquivar"
                                      : "Arquivar"}
                                  </button>
                                </form>
                              )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}