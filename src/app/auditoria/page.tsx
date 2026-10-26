import { auth } from "@/../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NavHeader } from "@/components/NavHeader";
import Link from "next/link";

export default async function AuditoriaPage() {
    const session = await auth();

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

    const [eventosSolicitacoes, eventosAdministrativos] =
        await Promise.all([
            prisma.historicoEvento.findMany({
                orderBy: { criadoEm: "desc" },
                take: 100,
                include: {
                    responsavel: true,
                    solicitacao: true,
                },
            }),

            prisma.auditoriaAdministrativa.findMany({
                orderBy: { criadoEm: "desc" },
                take: 100,
                include: {
                    responsavel: true,
                    usuarioAlvo: true,
                },
            }),
        ]);

    const formatarData = (data: Date) =>
        new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(data);

    const perfilLabel: Record<string, string> = {
        SOLICITANTE: "Solicitante",
        ANALISTA_FINANCEIRO: "Analista Financeiro",
        GESTOR_FINANCEIRO: "Gestor Financeiro",
        ADMINISTRADOR_SISTEMA: "Administrador do Sistema",
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <NavHeader
                nome={session.user.name ?? ""}
                perfil={session.user.perfil}
            />

            <main className="w-full px-6 py-8 md:px-8 lg:px-10">
                <div className="mx-auto w-full max-w-[1500px]">
                    {/* Cabeçalho */}
                    <section className="mb-8">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 shadow-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-dark)]" />
                                    Rastreabilidade do sistema
                                </div>

                                <h1 className="text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] md:text-3xl">
                                    Auditoria
                                </h1>

                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                                    Consulte os registros das ações realizadas
                                    no sistema e acompanhe a sequência dos
                                    eventos administrativos.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                        Solicitações
                                    </p>

                                    <p className="mt-1 text-2xl font-extrabold text-[var(--brand-dark)]">
                                        {eventosSolicitacoes.length}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold-light)] px-5 py-4 shadow-sm">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--gold-dark)]">
                                        Administrativos
                                    </p>

                                    <p className="mt-1 text-2xl font-extrabold text-[var(--brand-dark)]">
                                        {eventosAdministrativos.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Eventos de solicitações */}
                    <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5 md:px-7">
                            <h2 className="text-lg font-bold text-[var(--brand-dark)]">
                                Eventos das solicitações
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Histórico operacional dos processos financeiros,
                                ordenado do mais recente para o mais antigo.
                            </p>
                        </div>

                        {eventosSolicitacoes.length === 0 ? (
                            <div className="px-6 py-12 text-center text-sm text-slate-500">
                                Nenhum evento de solicitação registrado.
                            </div>
                        ) : (
                            <div className="md:overflow-x-auto">
                                {/* Celular: lista em cartões */}
                                <ul className="divide-y divide-slate-100 md:hidden">
                                    {eventosSolicitacoes.map((evento) => (
                                        <li key={evento.id} className="p-4">
                                            <p className="text-[11px] font-semibold text-slate-400">
                                                {formatarData(evento.criadoEm)}
                                            </p>

                                            <span className="mt-2 inline-flex max-w-full break-all rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                                {evento.tipo}
                                            </span>

                                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                                {evento.descricao}
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-xs font-semibold text-slate-700">
                                                    {evento.responsavel.nome}
                                                </span>

                                                <Link
                                                    href={`/solicitacoes/${evento.solicitacaoId}`}
                                                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
                                                >
                                                    {evento.solicitacao.numero} →
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <table className="hidden w-full min-w-[1050px] text-left md:table">
                                    <thead className="border-b border-slate-200 bg-slate-50/70">
                                        <tr>
                                            <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                                                Data / Hora
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                                                Usuário
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                                                Ação
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                                                Solicitação
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                                                Descrição
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {eventosSolicitacoes.map((evento) => (
                                            <tr
                                                key={evento.id}
                                                className="group transition-colors duration-150 hover:bg-slate-50/80"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 align-top md:px-6">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-300 group-hover:bg-[var(--gold-dark)]" />

                                                        <div>
                                                            <p className="text-xs font-bold text-slate-700">
                                                                {formatarData(
                                                                    evento.criadoEm
                                                                )}
                                                            </p>

                                                            <p className="mt-1 text-[11px] text-slate-400">
                                                                Evento registrado
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 align-top md:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-extrabold text-slate-500">
                                                            {evento.responsavel.nome
                                                                .trim()
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {
                                                                evento
                                                                    .responsavel
                                                                    .nome
                                                            }
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 align-top md:px-6">
                                                    <span className="inline-flex max-w-[220px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold leading-5 text-slate-600">
                                                        <span className="min-w-0 whitespace-normal break-all">
                                                            {evento.tipo}
                                                        </span>
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 align-top md:px-6">
                                                    <Link
                                                        href={`/solicitacoes/${evento.solicitacaoId}`}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-[var(--gold-dark)] hover:bg-[var(--gold-light)] hover:text-[var(--brand-dark)]"
                                                    >
                                                        {evento.solicitacao.numero}

                                                        <span>
                                                            →
                                                        </span>
                                                    </Link>
                                                </td>

                                                <td className="max-w-[520px] px-5 py-4 align-top md:px-6">
                                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                                        {evento.descricao}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Auditoria administrativa */}
                    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5 md:px-7">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--brand-dark)]">
                                        Auditoria administrativa
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Alterações administrativas realizadas
                                        sobre usuários e seus acessos.
                                    </p>
                                </div>

                                <span className="inline-flex w-fit items-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold-light)] px-3 py-1.5 text-xs font-bold text-[var(--gold-dark)]">
                                    {eventosAdministrativos.length} registros
                                </span>
                            </div>
                        </div>

                        {eventosAdministrativos.length === 0 ? (
                            <div className="px-6 py-12 text-center text-sm text-slate-500">
                                Nenhum evento administrativo registrado.
                            </div>
                        ) : (
                            <div className="md:overflow-x-auto">
                                {/* Celular: lista em cartões */}
                                <ul className="divide-y divide-slate-100 md:hidden">
                                    {eventosAdministrativos.map((evento) => (
                                        <li key={evento.id} className="p-4">
                                            <p className="text-[11px] font-semibold text-slate-400">
                                                {formatarData(evento.criadoEm)}
                                            </p>

                                            <span className="mt-2 inline-flex max-w-full break-all rounded-lg border border-[var(--gold)]/30 bg-[var(--gold-light)] px-2.5 py-1 text-[11px] font-bold text-[var(--gold-dark)]">
                                                {evento.tipo}
                                            </span>

                                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                                {evento.descricao}
                                            </p>

                                            <div className="mt-3 space-y-1 text-xs text-slate-500">
                                                <p>
                                                    <span className="font-semibold text-slate-700">
                                                        Responsável:
                                                    </span>{" "}
                                                    {evento.responsavel.nome}
                                                </p>
                                                <p className="break-all">
                                                    <span className="font-semibold text-slate-700">
                                                        Afetado:
                                                    </span>{" "}
                                                    {evento.usuarioAlvo.nome} (
                                                    {evento.usuarioAlvo.email})
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <table className="hidden w-full min-w-[1100px] text-left md:table">
                                    <thead className="border-b border-slate-200 bg-slate-50/70">
                                        <tr>
                                            <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                                                Data / Hora
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                                                Responsável
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                                                Ação
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                                                Usuário afetado
                                            </th>

                                            <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                                                Descrição
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {eventosAdministrativos.map((evento) => (
                                            <tr
                                                key={evento.id}
                                                className="group transition-colors duration-150 hover:bg-slate-50/80"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 align-top md:px-6">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--gold-dark)]" />

                                                        <div>
                                                            <p className="text-xs font-bold text-slate-700">
                                                                {formatarData(
                                                                    evento.criadoEm
                                                                )}
                                                            </p>

                                                            <p className="mt-1 text-[11px] text-slate-400">
                                                                Registro
                                                                administrativo
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 align-top md:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-extrabold text-slate-500">
                                                            {evento.responsavel.nome
                                                                .trim()
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {
                                                                    evento
                                                                        .responsavel
                                                                        .nome
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                                {
                                                                    perfilLabel[
                                                                    evento
                                                                        .responsavel
                                                                        .perfil
                                                                    ]
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 align-top md:px-6">
                                                    <span className="inline-flex max-w-[230px] rounded-xl border border-[var(--gold)]/30 bg-[var(--gold-light)] px-3 py-1.5 text-xs font-bold leading-5 text-[var(--gold-dark)]">
                                                        <span className="min-w-0 whitespace-normal break-all">
                                                            {evento.tipo}
                                                        </span>
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 align-top md:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-extrabold text-slate-500">
                                                            {evento.usuarioAlvo.nome
                                                                .trim()
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {
                                                                    evento
                                                                        .usuarioAlvo
                                                                        .nome
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {
                                                                    evento
                                                                        .usuarioAlvo
                                                                        .email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="max-w-[500px] px-5 py-4 align-top md:px-6">
                                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                                        {evento.descricao}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}