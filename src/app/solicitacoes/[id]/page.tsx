import { auth } from "@/../auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { NavHeader } from "@/components/NavHeader";
import {
    anexarDocumento,
    enviarParaAnalise,
    iniciarAnalise,
    aprovarSolicitacao,
    rejeitarSolicitacao,
    solicitarCorrecao,
    reenviarSolicitacao,
    registrarExecucao,
    encerrarSolicitacao,
    cancelarSolicitacao,
    reabrirSolicitacao,
    removerDocumento,
} from "./actions";
import { EditarSolicitacaoForm } from "./EditarSolicitacaoForm";

const statusConfig: Record<
    string,
    {
        label: string;
        badge: string;
        dot: string;
        description: string;
    }
> = {
    RASCUNHO: {
        label: "Rascunho",
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-slate-400",
        description: "A solicitação ainda está em preparação.",
    },
    ENVIADA: {
        label: "Enviada",
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        dot: "bg-blue-500",
        description: "A solicitação foi enviada para análise.",
    },
    EM_ANALISE: {
        label: "Em análise",
        badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
        dot: "bg-indigo-500",
        description: "A Diretoria Administrativo-Financeira está analisando o processo.",
    },
    CORRECAO_SOLICITADA: {
        label: "Correção solicitada",
        badge: "status-warning",
        dot: "bg-[var(--warning)]",
        description: "É necessária uma correção ou complementação.",
    },
    REENVIADA: {
        label: "Reenviada",
        badge: "bg-blue-50 text-blue-700 border-blue-100",
        dot: "bg-blue-500",
        description: "A solicitação corrigida foi reenviada para análise.",
    },
    APROVADA: {
        label: "Aprovada",
        badge: "status-success",
        dot: "bg-[var(--success)]",
        description: "A solicitação foi aprovada e aguarda registro da execução.",
    },
    EXECUTADA_PAGA: {
        label: "Executada / Paga",
        badge: "status-success",
        dot: "bg-[var(--success)]",
        description: "A execução ou pagamento foi registrado.",
    },
    ENCERRADA: {
        label: "Encerrada",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
        dot: "bg-emerald-500",
        description: "O processamento do processo foi encerrado.",
    },
    REJEITADA: {
        label: "Rejeitada",
        badge: "status-danger",
        dot: "bg-[var(--danger)]",
        description: "A solicitação foi rejeitada.",
    },
    CANCELADA: {
        label: "Cancelada",
        badge: "status-danger",
        dot: "bg-[var(--danger)]",
        description: "A solicitação foi cancelada.",
    },
};

const etapas = [
    "Dados",
    "Documentação",
    "Análise",
    "Decisão",
    "Pagamento",
    "Encerramento",
];

function getStatusConfig(status: string) {
    return (
        statusConfig[status] ?? {
            label: status,
            badge: "bg-slate-100 text-slate-700 border-slate-200",
            dot: "bg-slate-400",
            description: "Status atual do processo.",
        }
    );
}

function getEtapaAtual(status: string): number | null {
    switch (status) {
        case "RASCUNHO":
            return 0;

        case "CORRECAO_SOLICITADA":
            return 1;

        case "ENVIADA":
        case "REENVIADA":
        case "EM_ANALISE":
            return 2;

        case "APROVADA":
            return 4;

        case "EXECUTADA_PAGA":
            return 5;

        case "ENCERRADA":
            return 5;

        case "REJEITADA":
        case "CANCELADA":
            return null;

        default:
            return null;
    }
}

function formatarMoeda(valor: unknown) {
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

function formatarDocumentoTipo(tipo: string) {
    const tipos: Record<string, string> = {
        TERMO_SOLICITACAO: "Termo de Solicitação",
        ORCAMENTO: "Orçamento",
        COMPROVANTE: "Comprovante",
        RECIBO: "Recibo",
        EXTRATO: "Extrato",
        DOCUMENTO_FISCAL: "Documento Fiscal",
        OUTRO: "Outro",
    };

    return tipos[tipo] ?? tipo;
}

export default async function DetalheSolicitacaoPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ from?: string }>;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const { id } = await params;
    const { from } = await searchParams;

    const backHref = from === "financeiro" ? "/financeiro" : "/dashboard";
    const backLabel =
        from === "financeiro"
            ? "Voltar ao Quadro Financeiro"
            : "Voltar ao painel";

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id },
        include: {
            historico: {
                orderBy: { criadoEm: "asc" },
            },
            documentos: {
                orderBy: { criadoEm: "desc" },
                include: {
                    enviadoPor: true,
                },
            },
        },
    });

    if (!solicitacao) {
        notFound();
    }

    const ehDono = solicitacao.solicitanteId === session.user.id;

    const ehPerfilFinanceiro = [
        "ANALISTA_FINANCEIRO",
        "GESTOR_FINANCEIRO",
    ].includes(session.user.perfil);

    const ehAdministrador = session.user.perfil === "ADMINISTRADOR_SISTEMA";

    const ehAnalista = session.user.perfil === "ANALISTA_FINANCEIRO";
    const ehGestor = session.user.perfil === "GESTOR_FINANCEIRO";

    if (!ehDono && !ehPerfilFinanceiro && !ehAdministrador) {
        redirect("/dashboard");
    }

    const status = getStatusConfig(solicitacao.status);
    const etapaAtual = getEtapaAtual(solicitacao.status);

    const documentosSolicitante = solicitacao.documentos.filter(
        (d) => d.enviadoPorId === solicitacao.solicitanteId
    );

    const documentosDiretoria = solicitacao.documentos.filter(
        (d) => d.enviadoPorId !== solicitacao.solicitanteId
    );

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <NavHeader
                nome={session.user.name ?? ""}
                perfil={session.user.perfil}
            />

            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Navegação */}
                <div className="animate-fade-in mb-5">
                    <Link
                        href={backHref}
                        className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:bg-white hover:text-[var(--text-primary)]"
                    >
                        <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5">
                            ←
                        </span>
                        {backLabel}
                    </Link>
                </div>

                {/* Cabeçalho do processo */}
                <section className="animate-fade-in mb-6">
                    <div className="surface-card overflow-hidden">
                        <div className="p-5 sm:p-6 lg:p-7">
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                <div className="min-w-0">
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-md bg-[var(--brand)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                                            Processo financeiro
                                        </span>

                                        <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                                            {formatarTipo(solicitacao.tipo)}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                            {solicitacao.numero}
                                        </p>

                                        <h1 className="max-w-4xl break-words text-2xl font-extrabold leading-tight tracking-tight text-[var(--text-primary)] sm:text-3xl">
                                            {solicitacao.titulo}
                                        </h1>
                                    </div>

                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                                        {status.description}
                                    </p>
                                </div>

                                <div className="shrink-0">
                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-extrabold ${status.badge}`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${status.dot}`}
                                        />
                                        {status.label}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Progresso do processo */}
                        <div className="border-t border-[var(--border-soft)] bg-[var(--surface-soft)] px-5 py-5 sm:px-6 lg:px-7">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                        Etapa do processo
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                        {etapaAtual === null
                                            ? status.label
                                            : etapas[etapaAtual]}
                                    </p>
                                </div>

                                <span className="hidden text-[11px] font-semibold text-[var(--text-muted)] sm:block">
                                    Fluxo administrativo
                                </span>
                            </div>

                            {/* Celular: barra compacta */}
                            {etapaAtual !== null && (
                                <div className="md:hidden">
                                    <div className="flex gap-1.5">
                                        {etapas.map((etapa, index) => (
                                            <div
                                                key={etapa}
                                                className="h-1.5 flex-1 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        index < etapaAtual
                                                            ? "var(--success)"
                                                            : index === etapaAtual
                                                                ? "var(--gold)"
                                                                : "var(--border)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-2 text-[11px] font-semibold text-[var(--text-muted)]">
                                        Etapa {etapaAtual + 1} de {etapas.length}
                                    </p>
                                </div>
                            )}

                            <div className="hidden overflow-x-auto pb-1 md:block">
                                <div className="flex min-w-[760px] items-start">
                                    {etapas.map((etapa, index) => {
                                        const concluida =
                                            etapaAtual !== null && index < etapaAtual;
                                        const atual =
                                            etapaAtual !== null && index === etapaAtual;

                                        return (
                                            <div
                                                key={etapa}
                                                className="flex min-w-0 flex-1 items-start"
                                            >
                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                    <div
                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold transition-all ${concluida
                                                            ? "bg-[var(--success)] text-white"
                                                            : atual
                                                                ? "text-[#1a1d24] shadow-sm"
                                                                : "border border-[var(--border)] bg-white text-[var(--text-muted)]"
                                                            }`}
                                                        style={
                                                            atual
                                                                ? {
                                                                    backgroundColor:
                                                                        "var(--gold)",
                                                                }
                                                                : undefined
                                                        }
                                                    >
                                                        {concluida ? "✓" : index + 1}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p
                                                            className={`text-[11px] font-bold leading-4 ${atual
                                                                ? "text-[var(--text-primary)]"
                                                                : concluida
                                                                    ? "text-[var(--text-secondary)]"
                                                                    : "text-[var(--text-muted)]"
                                                                }`}
                                                        >
                                                            {etapa}
                                                        </p>
                                                    </div>
                                                </div>

                                                {index < etapas.length - 1 && (
                                                    <div
                                                        className={`mt-4 h-px min-w-5 flex-1 ${concluida
                                                            ? "bg-[var(--success)]"
                                                            : "bg-[var(--border)]"
                                                            }`}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {["REJEITADA", "CANCELADA"].includes(
                                solicitacao.status
                            ) && (
                                    <div className="mt-4 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-light)] px-3.5 py-3 text-xs font-medium text-[var(--danger)]">
                                        Este processo encontra-se em um estado
                                        terminal fora da sequência principal do
                                        fluxo.
                                    </div>
                                )}
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
                    {/* Coluna principal */}
                    <div className="min-w-0 space-y-6">
                        {/* Dados do processo */}
                        <section className="animate-fade-in stagger-1">
                            <div className="surface-card overflow-hidden">
                                <div className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-5 py-5 sm:px-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                                                Dados da solicitação
                                            </h2>

                                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                Informações registradas no processo.
                                            </p>
                                        </div>

                                        <span className="hidden rounded-md border border-[var(--border)] bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] sm:block">
                                            Identificação
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6">
                                    <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                                Tipo
                                            </dt>

                                            <dd className="mt-1.5 text-sm font-semibold text-[var(--text-primary)]">
                                                {formatarTipo(solicitacao.tipo)}
                                            </dd>
                                        </div>

                                        <div>
                                            <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                                Valor solicitado
                                            </dt>

                                            <dd className="mt-1.5 text-lg font-extrabold text-[var(--text-primary)]">
                                                {formatarMoeda(
                                                    solicitacao.valorSolicitado
                                                )}
                                            </dd>
                                        </div>

                                        {solicitacao.valorAprovado != null && (
                                            <div>
                                                <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                                    Valor aprovado
                                                </dt>

                                                <dd className="mt-1.5 text-base font-extrabold text-[var(--success)]">
                                                    {formatarMoeda(
                                                        solicitacao.valorAprovado
                                                    )}
                                                </dd>
                                            </div>
                                        )}

                                        {solicitacao.valorExecutado != null && (
                                            <div>
                                                <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                                    Valor executado / pago
                                                </dt>

                                                <dd className="mt-1.5 text-base font-extrabold text-[var(--success)]">
                                                    {formatarMoeda(
                                                        solicitacao.valorExecutado
                                                    )}
                                                </dd>
                                            </div>
                                        )}

                                        <div className="sm:col-span-2">
                                            <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                                Título
                                            </dt>

                                            <dd className="mt-1.5 break-words text-sm font-semibold leading-6 text-[var(--text-primary)]">
                                                {solicitacao.titulo}
                                            </dd>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                                Descrição
                                            </dt>

                                            <dd className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--text-secondary)]">
                                                {solicitacao.descricao}
                                            </dd>
                                        </div>
                                    </dl>

                                    {ehDono &&
                                        solicitacao.status === "RASCUNHO" && (
                                            <div className="mt-6 border-t border-[var(--border-soft)] pt-6">
                                                <EditarSolicitacaoForm
                                                    solicitacao={{
                                                        id: solicitacao.id,
                                                        tipo: solicitacao.tipo,
                                                        titulo: solicitacao.titulo,
                                                        descricao:
                                                            solicitacao.descricao,
                                                        valorSolicitado:
                                                            solicitacao.valorSolicitado.toString(),
                                                    }}
                                                />
                                            </div>
                                        )}
                                </div>
                            </div>
                        </section>

                        {/* Documentos */}
                        <section className="animate-fade-in stagger-2">
                            <div className="surface-card overflow-hidden">
                                <div className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-5 py-5 sm:px-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                                                Documentos
                                            </h2>

                                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                Arquivos vinculados ao processo.
                                            </p>
                                        </div>

                                        <span className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--text-secondary)]">
                                            {solicitacao.documentos.length}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6">
                                    {solicitacao.documentos.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-5 py-10 text-center">
                                            <div
                                                className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-sm font-extrabold"
                                                style={{
                                                    backgroundColor:
                                                        "var(--gold-light)",
                                                    color: "var(--warning)",
                                                }}
                                            >
                                                +
                                            </div>

                                            <p className="text-sm font-bold text-[var(--text-primary)]">
                                                Nenhum documento anexado
                                            </p>

                                            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[var(--text-muted)]">
                                                Os documentos necessários poderão ser
                                                adicionados quando a etapa do processo
                                                permitir.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div>
                                                <div className="mb-3 flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />

                                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                                        Enviados pelo Solicitante
                                                    </h3>
                                                </div>

                                                {documentosSolicitante.length === 0 ? (
                                                    <p className="rounded-lg bg-[var(--surface-soft)] px-3.5 py-3 text-xs text-[var(--text-muted)]">
                                                        Nenhum documento.
                                                    </p>
                                                ) : (
                                                    <ul className="space-y-2">
                                                        {documentosSolicitante.map(
                                                            (doc) => (
                                                                <li
                                                                    key={doc.id}
                                                                    className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-3 transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-xs)]"
                                                                >
                                                                    <div
                                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold"
                                                                        style={{
                                                                            backgroundColor:
                                                                                "var(--gold-light)",
                                                                            color: "var(--warning)",
                                                                        }}
                                                                    >
                                                                        DOC
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                                                                            {
                                                                                doc.nomeArquivo
                                                                            }
                                                                        </span>

                                                                        <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">
                                                                            {formatarDocumentoTipo(
                                                                                doc.tipo
                                                                            )}
                                                                        </span>
                                                                    </div>

                                                                    {ehDono &&
                                                                        solicitacao.status ===
                                                                        "RASCUNHO" && (
                                                                            <form
                                                                                action={
                                                                                    removerDocumento
                                                                                }
                                                                                className="shrink-0"
                                                                            >
                                                                                <input
                                                                                    type="hidden"
                                                                                    name="documentoId"
                                                                                    value={
                                                                                        doc.id
                                                                                    }
                                                                                />

                                                                                <input
                                                                                    type="hidden"
                                                                                    name="solicitacaoId"
                                                                                    value={
                                                                                        solicitacao.id
                                                                                    }
                                                                                />

                                                                                <button
                                                                                    type="submit"
                                                                                    className="rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 transition hover:bg-red-50 hover:text-[var(--danger)]"
                                                                                >
                                                                                    Remover
                                                                                </button>
                                                                            </form>
                                                                        )}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                )}
                                            </div>

                                            <div>
                                                <div className="mb-3 flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />

                                                    <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                                        Enviados pela Diretoria
                                                        Financeira
                                                    </h3>
                                                </div>

                                                {documentosDiretoria.length === 0 ? (
                                                    <p className="rounded-lg bg-[var(--surface-soft)] px-3.5 py-3 text-xs text-[var(--text-muted)]">
                                                        Nenhum documento.
                                                    </p>
                                                ) : (
                                                    <ul className="space-y-2">
                                                        {documentosDiretoria.map(
                                                            (doc) => (
                                                                <li
                                                                    key={doc.id}
                                                                    className="flex items-center gap-3 rounded-xl border border-[var(--success-border)] bg-[var(--success-light)]/45 p-3"
                                                                >
                                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[11px] font-extrabold text-[var(--success)] shadow-[var(--shadow-xs)]">
                                                                        DOC
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                                                                            {
                                                                                doc.nomeArquivo
                                                                            }
                                                                        </span>

                                                                        <span className="mt-0.5 block truncate text-[11px] text-[var(--text-muted)]">
                                                                            {formatarDocumentoTipo(
                                                                                doc.tipo
                                                                            )}{" "}
                                                                            · por{" "}
                                                                            {
                                                                                doc
                                                                                    .enviadoPor
                                                                                    .nome
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {((ehDono &&
                                        [
                                            "RASCUNHO",
                                            "CORRECAO_SOLICITADA",
                                        ].includes(solicitacao.status)) ||
                                        (ehPerfilFinanceiro &&
                                            !ehDono &&
                                            [
                                                "EM_ANALISE",
                                                "APROVADA",
                                                "EXECUTADA_PAGA",
                                            ].includes(solicitacao.status))) && (
                                            <div className="mt-6 border-t border-[var(--border-soft)] pt-6">
                                                <div className="mb-4">
                                                    <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                                                        Adicionar documento
                                                    </h3>

                                                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                                                        Selecione o tipo e envie o arquivo
                                                        correspondente ao processo.
                                                    </p>
                                                </div>

                                                <form
                                                    action={anexarDocumento}
                                                    className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.2fr_auto] md:items-end"
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="solicitacaoId"
                                                        value={solicitacao.id}
                                                    />

                                                    <div>
                                                        <label
                                                            htmlFor="tipoDocumento"
                                                            className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]"
                                                        >
                                                            Tipo de documento
                                                        </label>

                                                        <select
                                                            id="tipoDocumento"
                                                            name="tipoDocumento"
                                                            defaultValue="OUTRO"
                                                            className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm font-medium text-[var(--text-primary)] outline-none transition-all duration-150 hover:border-[var(--border-strong)] focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                                                        >
                                                            <option value="TERMO_SOLICITACAO">
                                                                Termo de Solicitação
                                                            </option>
                                                            <option value="ORCAMENTO">
                                                                Orçamento
                                                            </option>
                                                            <option value="COMPROVANTE">
                                                                Comprovante
                                                            </option>
                                                            <option value="RECIBO">
                                                                Recibo
                                                            </option>
                                                            <option value="EXTRATO">
                                                                Extrato
                                                            </option>
                                                            <option value="DOCUMENTO_FISCAL">
                                                                Documento Fiscal
                                                            </option>
                                                            <option value="OUTRO">
                                                                Outro
                                                            </option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label
                                                            htmlFor="arquivo"
                                                            className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]"
                                                        >
                                                            Arquivo
                                                        </label>

                                                        <input
                                                            id="arquivo"
                                                            type="file"
                                                            name="arquivo"
                                                            required
                                                            className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs text-[var(--text-secondary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--surface-muted)] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[var(--text-secondary)] hover:border-[var(--border-strong)] focus:border-[var(--gold-dark)] focus:outline-none"
                                                        />
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        className="press inline-flex h-11 items-center justify-center rounded-lg bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[var(--brand-soft)] hover:shadow-md"
                                                    >
                                                        Anexar documento
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </section>

                        {/* Histórico */}
                        <section className="animate-fade-in stagger-3">
                            <div className="surface-card overflow-hidden">
                                <div className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-5 py-5 sm:px-6">
                                    <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                                        Histórico do processo
                                    </h2>

                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        Linha do tempo das operações registradas.
                                    </p>
                                </div>

                                <div className="p-5 sm:p-6">
                                    {solicitacao.historico.length === 0 ? (
                                        <p className="text-sm text-[var(--text-muted)]">
                                            Nenhum evento registrado.
                                        </p>
                                    ) : (
                                        <ol className="relative ml-2 border-l border-[var(--border)]">
                                            {solicitacao.historico.map(
                                                (evento, index) => (
                                                    <li
                                                        key={evento.id}
                                                        className="relative pb-6 pl-7 last:pb-0"
                                                    >
                                                        <span
                                                            className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm"
                                                            style={{
                                                                backgroundColor:
                                                                    index ===
                                                                        solicitacao
                                                                            .historico
                                                                            .length -
                                                                        1
                                                                        ? "var(--gold-dark)"
                                                                        : "var(--brand)",
                                                            }}
                                                        />

                                                        <div className="rounded-xl border border-transparent p-1 transition-colors hover:border-[var(--border-soft)] hover:bg-[var(--surface-soft)]">
                                                            <p className="whitespace-pre-wrap break-words text-sm font-medium leading-6 text-[var(--text-primary)]">
                                                                {
                                                                    evento.descricao
                                                                }
                                                            </p>

                                                            <p className="mt-1.5 text-[11px] font-medium text-[var(--text-muted)]">
                                                                {evento.criadoEm.toLocaleString(
                                                                    "pt-BR"
                                                                )}
                                                            </p>
                                                        </div>
                                                    </li>
                                                )
                                            )}
                                        </ol>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Coluna lateral */}
                    <aside className="min-w-0 space-y-6">
                        {/* Resumo */}
                        <section className="animate-fade-in stagger-1">
                            <div className="surface-card overflow-hidden">
                                <div className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-5 py-5">
                                    <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                                        Resumo financeiro
                                    </h2>

                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        Valores registrados no processo.
                                    </p>
                                </div>

                                <div className="space-y-4 p-5">
                                    <div className="rounded-xl bg-[var(--surface-soft)] p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                            Solicitado
                                        </p>

                                        <p className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                                            {formatarMoeda(
                                                solicitacao.valorSolicitado
                                            )}
                                        </p>
                                    </div>

                                    {solicitacao.valorAprovado != null && (
                                        <div className="rounded-xl bg-[var(--success-light)] p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--success)]">
                                                Aprovado
                                            </p>

                                            <p className="mt-1 text-xl font-extrabold tracking-tight text-[var(--success)]">
                                                {formatarMoeda(
                                                    solicitacao.valorAprovado
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {solicitacao.valorExecutado != null && (
                                        <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                                Executado / pago
                                            </p>

                                            <p className="mt-1 text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
                                                {formatarMoeda(
                                                    solicitacao.valorExecutado
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Ações */}
                        <section className="animate-fade-in stagger-2">
                            <div className="surface-card overflow-hidden">
                                <div className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-5 py-5">
                                    <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                                        Ações do processo
                                    </h2>

                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                        Operações disponíveis nesta etapa.
                                    </p>
                                </div>

                                <div className="space-y-4 p-5">
                                    {/* Rascunho */}
                                    {solicitacao.status === "RASCUNHO" && (
                                        <form
                                            action={enviarParaAnalise}
                                            className="rounded-xl border border-[var(--gold)]/35 bg-[var(--gold-light)]/50 p-4"
                                        >
                                            <input
                                                type="hidden"
                                                name="solicitacaoId"
                                                value={solicitacao.id}
                                            />

                                            <p className="text-sm font-extrabold text-[var(--text-primary)]">
                                                Enviar para análise
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                                Após o envio, a solicitação não
                                                poderá mais ser editada livremente.
                                            </p>

                                            <button
                                                type="submit"
                                                className="press mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-bold text-white shadow-sm hover:bg-[var(--brand-soft)] hover:shadow-md"
                                            >
                                                Enviar para Análise
                                            </button>
                                        </form>
                                    )}

                                    {/* Correção */}
                                    {ehDono &&
                                        solicitacao.status ===
                                        "CORRECAO_SOLICITADA" && (
                                            <form
                                                action={reenviarSolicitacao}
                                                className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-light)]/65 p-4"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="solicitacaoId"
                                                    value={solicitacao.id}
                                                />

                                                <p className="text-sm font-extrabold text-[var(--text-primary)]">
                                                    Correção solicitada
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                                    Revise as pendências e reenvie o
                                                    processo após realizar as
                                                    correções.
                                                </p>

                                                <button
                                                    type="submit"
                                                    className="press mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--warning)] px-4 text-sm font-bold text-white shadow-sm hover:brightness-105 hover:shadow-md"
                                                >
                                                    Reenviar Solicitação
                                                </button>
                                            </form>
                                        )}

                                    {/* Iniciar análise (somente Analista) */}
                                    {ehAnalista &&
                                        ["ENVIADA", "REENVIADA"].includes(
                                            solicitacao.status
                                        ) && (
                                            <form
                                                action={iniciarAnalise}
                                                className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="solicitacaoId"
                                                    value={solicitacao.id}
                                                />

                                                <p className="text-sm font-extrabold text-[var(--text-primary)]">
                                                    Iniciar análise
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                                    Inicie formalmente a análise
                                                    administrativa e financeira.
                                                </p>

                                                <button
                                                    type="submit"
                                                    className="press mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-bold text-white shadow-sm hover:bg-[var(--brand-soft)] hover:shadow-md"
                                                >
                                                    Iniciar Análise
                                                </button>
                                            </form>
                                        )}

                                    {/* Análise */}
                                    {ehPerfilFinanceiro &&
                                        solicitacao.status === "EM_ANALISE" && (
                                            <div className="space-y-3">
                                                {ehAnalista && (
                                                    <p className="rounded-lg bg-[var(--surface-soft)] px-3.5 py-3 text-xs leading-5 text-[var(--text-secondary)]">
                                                        A decisão (aprovar ou rejeitar) cabe ao Gestor Financeiro. Você pode solicitar correções.
                                                    </p>
                                                )}

                                                {/* ALTERADO: aprovar somente para o Gestor */}
                                                {ehGestor && (
                                                    <form
                                                        action={aprovarSolicitacao}
                                                        className="rounded-xl border border-[var(--success-border)] bg-[var(--success-light)]/55 p-4"
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="solicitacaoId"
                                                            value={solicitacao.id}
                                                        />

                                                        <label className="block text-sm font-extrabold text-[var(--text-primary)]">
                                                            Aprovar solicitação
                                                        </label>

                                                        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                                            Registre o parecer da aprovação,
                                                            quando aplicável.
                                                        </p>

                                                        <textarea
                                                            name="conclusaoParecer"
                                                            rows={4}
                                                            placeholder="Observações sobre a aprovação (opcional)"
                                                            className="mt-3 w-full resize-y rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm leading-5 text-[var(--text-primary)] outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                                                        />

                                                        <button
                                                            type="submit"
                                                            className="press mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--success)] px-4 text-sm font-bold text-white shadow-sm hover:brightness-105 hover:shadow-md"
                                                        >
                                                            Aprovar Solicitação
                                                        </button>
                                                    </form>
                                                )}

                                                {/* Solicitar correção: Analista e Gestor */}
                                                <form
                                                    action={solicitarCorrecao}
                                                    className="rounded-xl border border-[var(--warning-border)] bg-[var(--warning-light)]/55 p-4"
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="solicitacaoId"
                                                        value={solicitacao.id}
                                                    />

                                                    <label className="block text-sm font-extrabold text-[var(--text-primary)]">
                                                        Solicitar correção
                                                    </label>

                                                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                                        Informe o que precisa ser
                                                        corrigido ou complementado.
                                                    </p>

                                                    <textarea
                                                        name="observacaoCorrecao"
                                                        rows={4}
                                                        required
                                                        placeholder="O que precisa ser corrigido ou complementado?"
                                                        className="mt-3 w-full resize-y rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm leading-5 text-[var(--text-primary)] outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                                                    />

                                                    <button
                                                        type="submit"
                                                        className="press mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--warning)] px-4 text-sm font-bold text-white shadow-sm hover:brightness-105 hover:shadow-md"
                                                    >
                                                        Solicitar Correção
                                                    </button>
                                                </form>

                                                {/* ALTERADO: rejeitar somente para o Gestor */}
                                                {ehGestor && (
                                                    <form
                                                        action={rejeitarSolicitacao}
                                                        className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-light)]/55 p-4"
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="solicitacaoId"
                                                            value={solicitacao.id}
                                                        />

                                                        <label className="block text-sm font-extrabold text-[var(--text-primary)]">
                                                            Rejeitar solicitação
                                                        </label>

                                                        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                                            A rejeição deve ser acompanhada
                                                            da justificativa correspondente.
                                                        </p>

                                                        <textarea
                                                            name="conclusaoParecer"
                                                            rows={4}
                                                            required
                                                            placeholder="Justificativa da rejeição"
                                                            className="mt-3 w-full resize-y rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm leading-5 text-[var(--text-primary)] outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[var(--danger)] focus:ring-4 focus:ring-[var(--danger)]/10"
                                                        />

                                                        <button
                                                            type="submit"
                                                            className="press mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--danger)] px-4 text-sm font-bold text-white shadow-sm hover:brightness-105 hover:shadow-md"
                                                        >
                                                            Rejeitar Solicitação
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}

                                    {/* Aprovação */}
                                    {ehPerfilFinanceiro &&
                                        solicitacao.status === "APROVADA" && (
                                            <div className="space-y-3">
                                                <form
                                                    action={registrarExecucao}
                                                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="solicitacaoId"
                                                        value={solicitacao.id}
                                                    />

                                                    <label
                                                        htmlFor="valorExecutado"
                                                        className="block text-sm font-extrabold text-[var(--text-primary)]"
                                                    >
                                                        Registrar execução /
                                                        pagamento
                                                    </label>

                                                    <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                                        Registre o valor efetivamente
                                                        executado, pago ou reembolsado.
                                                    </p>

                                                    <div className="relative mt-3">
                                                        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-bold text-[var(--text-muted)]">
                                                            R$
                                                        </span>

                                                        <input
                                                            id="valorExecutado"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            name="valorExecutado"
                                                            required
                                                            placeholder="0,00"
                                                            className="h-11 w-full rounded-lg border border-[var(--border)] bg-white pl-11 pr-3 text-sm font-semibold text-[var(--text-primary)] outline-none transition-all duration-150 placeholder:text-slate-400 focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                                                        />
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        className="press mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-bold text-white shadow-sm hover:bg-[var(--brand-soft)] hover:shadow-md"
                                                    >
                                                        Registrar Execução
                                                    </button>
                                                </form>

                                                <form action={encerrarSolicitacao}>
                                                    <input
                                                        type="hidden"
                                                        name="solicitacaoId"
                                                        value={solicitacao.id}
                                                    />

                                                    <button
                                                        type="submit"
                                                        className="press inline-flex h-10 w-full items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white px-4 text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                                                    >
                                                        Encerrar sem execução registrada
                                                    </button>
                                                </form>
                                            </div>
                                        )}

                                    {/* Executada / paga */}
                                    {ehPerfilFinanceiro &&
                                        solicitacao.status ===
                                        "EXECUTADA_PAGA" && (
                                            <form action={encerrarSolicitacao}>
                                                <input
                                                    type="hidden"
                                                    name="solicitacaoId"
                                                    value={solicitacao.id}
                                                />

                                                <button
                                                    type="submit"
                                                    className="press inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-bold text-white shadow-sm hover:bg-[var(--brand-soft)] hover:shadow-md"
                                                >
                                                    Encerrar Processo
                                                </button>
                                            </form>
                                        )}

                                    {!(
                                        solicitacao.status === "RASCUNHO" ||
                                        (
                                            ehDono &&
                                            solicitacao.status ===
                                            "CORRECAO_SOLICITADA"
                                        ) ||
                                        /* ALTERADO: ENVIADA/REENVIADA só tem ação para o Analista */
                                        (
                                            ehAnalista &&
                                            ["ENVIADA", "REENVIADA"].includes(
                                                solicitacao.status
                                            )
                                        ) ||
                                        (
                                            ehPerfilFinanceiro &&
                                            solicitacao.status ===
                                            "EM_ANALISE"
                                        ) ||
                                        (
                                            ehPerfilFinanceiro &&
                                            ["APROVADA", "EXECUTADA_PAGA"].includes(
                                                solicitacao.status
                                            )
                                        )
                                    ) && (
                                            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-5 text-center">
                                                <p className="text-xs font-semibold text-[var(--text-secondary)]">
                                                    Nenhuma ação operacional disponível
                                                    nesta etapa.
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </section>

                        {/* Operações excepcionais */}
                        {session.user.perfil === "ADMINISTRADOR_SISTEMA" &&
                            solicitacao.status === "CANCELADA" && (
                                <section className="animate-fade-in stagger-3">
                                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5">
                                        <div className="mb-4">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                                                Operação administrativa
                                            </p>

                                            <h2 className="mt-1 text-sm font-extrabold text-[var(--text-primary)]">
                                                Reabrir solicitação
                                            </h2>

                                            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                                A reabertura exige uma justificativa
                                                e não apaga o histórico anterior.
                                            </p>
                                        </div>

                                        <form
                                            action={reabrirSolicitacao}
                                            className="space-y-3"
                                        >
                                            <input
                                                type="hidden"
                                                name="solicitacaoId"
                                                value={solicitacao.id}
                                            />

                                            <textarea
                                                name="justificativa"
                                                rows={4}
                                                required
                                                placeholder="Justificativa para a reabertura"
                                                className="w-full resize-y rounded-lg border border-indigo-200 bg-white px-3 py-2.5 text-sm leading-5 text-[var(--text-primary)] outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                                            />

                                            <button
                                                type="submit"
                                                className="press inline-flex h-10 w-full items-center justify-center rounded-lg bg-indigo-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-indigo-800 hover:shadow-md"
                                            >
                                                Reabrir Solicitação
                                            </button>
                                        </form>
                                    </div>
                                </section>
                            )}

                        {/* Cancelamento */}
                        {ehDono &&
                            [
                                "RASCUNHO",
                                "ENVIADA",
                                "EM_ANALISE",
                                "CORRECAO_SOLICITADA",
                                "REENVIADA",
                            ].includes(solicitacao.status) && (
                                <section className="animate-fade-in stagger-4">
                                    <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-light)]/50 p-5">
                                        <div className="mb-4">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--danger)]">
                                                Área de encerramento
                                            </p>

                                            <h2 className="mt-1 text-sm font-extrabold text-[var(--text-primary)]">
                                                Cancelar solicitação
                                            </h2>

                                            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                                O cancelamento ficará registrado no
                                                histórico do processo.
                                            </p>
                                        </div>

                                        <form
                                            action={cancelarSolicitacao}
                                            className="space-y-3"
                                        >
                                            <input
                                                type="hidden"
                                                name="solicitacaoId"
                                                value={solicitacao.id}
                                            />

                                            <textarea
                                                name="justificativa"
                                                rows={3}
                                                placeholder="Motivo do cancelamento (opcional)"
                                                className="w-full resize-y rounded-lg border border-[var(--danger-border)] bg-white px-3 py-2.5 text-sm leading-5 text-[var(--text-primary)] outline-none transition-all focus:border-[var(--danger)] focus:ring-4 focus:ring-[var(--danger)]/10"
                                            />

                                            <button
                                                type="submit"
                                                className="press inline-flex h-10 w-full items-center justify-center rounded-lg border border-[var(--danger)] bg-white px-4 text-sm font-bold text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white"
                                            >
                                                Cancelar Solicitação
                                            </button>
                                        </form>
                                    </div>
                                </section>
                            )}
                    </aside>
                </div>
            </main>
        </div>
    );
}