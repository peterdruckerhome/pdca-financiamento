import { auth } from "@/../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cadastrarModelo } from "./actions";
import { NavHeader } from "@/components/NavHeader";

export default async function ModelosPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const perfisGerenciamento = [
        "ANALISTA_FINANCEIRO",
        "GESTOR_FINANCEIRO",
        "ADMINISTRADOR_SISTEMA",
    ];

    const podeGerenciar = perfisGerenciamento.includes(session.user.perfil);

    const modelos = await prisma.modeloDocumento.findMany({
        where: { arquivado: false },
        orderBy: { criadoEm: "desc" },
    });

    const formatarData = (data: Date) =>
        new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(data);

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <NavHeader
                nome={session.user.name ?? ""}
                perfil={session.user.perfil}
            />

            <main className="w-full px-6 py-8 md:px-8 lg:px-10">
                <div className="mx-auto w-full max-w-[1500px]">
                    {/* Cabeçalho da página */}
                    <section className="mb-8">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 shadow-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-dark)]" />
                                    Documentação institucional
                                </div>

                                <h1 className="text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] md:text-3xl">
                                    Modelos de Documentos
                                </h1>

                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                                    Gerencie os modelos oficiais utilizados no
                                    fluxo de solicitações financeiras e mantenha
                                    suas versões organizadas.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                                    Modelos ativos
                                </p>

                                <p className="mt-1 text-2xl font-extrabold text-[var(--brand-dark)]">
                                    {modelos.length}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Conteúdo principal */}
                    <div
                        className={
                            podeGerenciar
                                ? "grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]"
                                : "block"
                        }
                    >
                        {/* Lista de modelos */}
                        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-6 py-5 md:px-7">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--brand-dark)]">
                                            Modelos disponíveis
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Consulte e acesse os arquivos
                                            atualmente ativos.
                                        </p>
                                    </div>

                                    <div className="hidden rounded-xl bg-[var(--gold-light)] px-3 py-2 text-xs font-semibold text-[var(--gold-dark)] sm:block">
                                        Versões ativas
                                    </div>
                                </div>
                            </div>

                            {modelos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center px-6 py-16 text-center md:py-20">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-7 w-7"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M7 3.75h7.5L19 8.25v12A.75.75 0 0 1 18.25 21h-11.5a.75.75 0 0 1-.75-.75v-16.5A.75.75 0 0 1 6.75 3H7Z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M14 3.75V8.5h4.75"
                                            />
                                        </svg>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-700">
                                        Nenhum modelo cadastrado
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                        Ainda não existem modelos ativos
                                        disponíveis no sistema.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {modelos.map((m) => (
                                        <article
                                            key={m.id}
                                            className="group flex flex-col gap-5 px-6 py-5 transition-colors duration-150 hover:bg-slate-50/70 md:px-7 lg:flex-row lg:items-center lg:justify-between"
                                        >
                                            <div className="flex min-w-0 items-start gap-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors duration-150 group-hover:bg-[var(--gold-light)] group-hover:text-[var(--gold-dark)]">
                                                    <svg
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.8"
                                                        className="h-5 w-5"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M7 3.75h7.5L19 8.25v12A.75.75 0 0 1 18.25 21h-11.5a.75.75 0 0 1-.75-.75v-16.5A.75.75 0 0 1 6.75 3H7Z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M14 3.75V8.5h4.75"
                                                        />
                                                    </svg>
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="break-words text-sm font-bold text-slate-800 md:text-base">
                                                            {m.nome}
                                                        </h3>

                                                        <span className="inline-flex items-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold-light)] px-2.5 py-1 text-[11px] font-bold text-[var(--gold-dark)]">
                                                            v{m.versao}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1.5 max-w-3xl break-words text-sm leading-6 text-slate-500">
                                                        {m.descricao ||
                                                            "Sem descrição ou finalidade informada."}
                                                    </p>

                                                    <p className="mt-2 text-xs font-medium text-slate-400">
                                                        Cadastrado em{" "}
                                                        {formatarData(
                                                            m.criadoEm
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <a
                                                href={m.caminhoArquivo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-[var(--gold-dark)] hover:bg-[var(--gold-light)] hover:text-[var(--brand-dark)] lg:self-center"
                                            >
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    className="h-4 w-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 3.75v10.5m0 0 3.75-3.75M12 14.25 8.25 10.5"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5.25 18.75h13.5"
                                                    />
                                                </svg>
                                                Baixar modelo
                                            </a>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Área de gerenciamento */}
                        {podeGerenciar && (
                            <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                                <div className="brand-gradient px-6 py-6 text-white md:px-7">
                                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 3.75a2.25 2.25 0 0 1 2.25 2.25v.25a5.9 5.9 0 0 1 1.8.76l.18-.18a2.25 2.25 0 0 1 3.18 3.18l-.18.18a5.9 5.9 0 0 1 .76 1.8h.25a2.25 2.25 0 0 1 0 4.5h-.25a5.9 5.9 0 0 1-.76 1.8l.18.18a2.25 2.25 0 1 1-3.18 3.18l-.18-.18a5.9 5.9 0 0 1-1.8.76v.25a2.25 2.25 0 0 1-4.5 0v-.25a5.9 5.9 0 0 1-1.8-.76l-.18.18a2.25 2.25 0 1 1-3.18-3.18l.18-.18a5.9 5.9 0 0 1-.76-1.8h-.25a2.25 2.25 0 0 1 0-4.5h.25a5.9 5.9 0 0 1 .76-1.8l-.18-.18A2.25 2.25 0 0 1 7.7 6.76l.18.18a5.9 5.9 0 0 1 1.8-.76V6A2.25 2.25 0 0 1 12 3.75Z"
                                            />
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="2.75"
                                            />
                                        </svg>
                                    </div>

                                    <h2 className="text-xl font-extrabold tracking-tight">
                                        Cadastrar novo modelo
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-white/65">
                                        Adicione um novo documento oficial ao
                                        acervo de modelos do sistema.
                                    </p>
                                </div>

                                <div className="p-6 md:p-7">
                                    <form
                                        action={cadastrarModelo}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label
                                                htmlFor="nome"
                                                className="mb-2 block text-sm font-bold text-slate-700"
                                            >
                                                Nome do modelo
                                            </label>

                                            <input
                                                id="nome"
                                                type="text"
                                                name="nome"
                                                required
                                                placeholder="Ex.: Termo de Solicitação de Verba"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--gold-dark)] focus:bg-white focus:ring-4 focus:ring-[var(--gold)]/15"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="descricao"
                                                className="mb-2 block text-sm font-bold text-slate-700"
                                            >
                                                Descrição / finalidade
                                            </label>

                                            <textarea
                                                id="descricao"
                                                name="descricao"
                                                rows={4}
                                                placeholder="Informe a finalidade ou utilização do modelo."
                                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--gold-dark)] focus:bg-white focus:ring-4 focus:ring-[var(--gold)]/15"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="arquivo"
                                                className="mb-2 block text-sm font-bold text-slate-700"
                                            >
                                                Arquivo do modelo
                                            </label>

                                            <input
                                                id="arquivo"
                                                type="file"
                                                name="arquivo"
                                                required
                                                className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-800 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700"
                                            />

                                            <p className="mt-2 text-xs leading-5 text-slate-400">
                                                Selecione o arquivo oficial que
                                                será utilizado como modelo.
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-dark)] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-[var(--brand)] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-300"
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-4 w-4"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M12 5v14M5 12h14"
                                                />
                                            </svg>

                                            Cadastrar modelo
                                        </button>
                                    </form>
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}