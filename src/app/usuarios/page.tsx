import { auth } from "@/../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NavHeader } from "@/components/NavHeader";
import {
  criarUsuario,
  alterarStatusUsuario,
  arquivarUsuario,
} from "./actions";

export default async function UsuariosPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.perfil !== "ADMINISTRADOR_SISTEMA") {
    redirect("/dashboard");
  }

  const usuarios = await prisma.usuario.findMany({
    where: {
      arquivado: false,
    },
    orderBy: { criadoEm: "desc" },
  });

  const usuariosArquivados = await prisma.usuario.findMany({
    where: {
      arquivado: true,
    },
    orderBy: { arquivadoEm: "desc" },
    include: {
      // Não é possível incluir arquivadoPor diretamente ainda,
      // pois a relação será adicionada na próxima etapa do schema.
    },
  });

  const perfilLabel: Record<string, string> = {
    SOLICITANTE: "Solicitante",
    ANALISTA_FINANCEIRO: "Analista Financeiro",
    GESTOR_FINANCEIRO: "Gestor Financeiro",
    ADMINISTRADOR_SISTEMA: "Administrador do Sistema",
  };

  const totalAtivos = usuarios.filter((usuario) => usuario.ativo).length;
  const totalInativos = usuarios.length - totalAtivos;

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
                  Administração do sistema
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] md:text-3xl">
                  Gerenciar Usuários
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                  Gerencie as contas de acesso, os perfis e o status dos
                  usuários cadastrados no sistema.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="min-w-[88px] rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Atuais
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-[var(--brand-dark)]">
                    {usuarios.length}
                  </p>
                </div>

                <div className="min-w-[88px] rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                    Ativos
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                    {totalAtivos}
                  </p>
                </div>

                <div className="min-w-[88px] rounded-2xl border border-red-100 bg-red-50 px-4 py-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-red-600">
                    Inativos
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-red-700">
                    {totalInativos}
                  </p>
                </div>
              </div>
            </div>
          </section>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
            {/* Usuários atuais */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-7">
                <div>
                  <h2 className="text-lg font-bold text-[var(--brand-dark)]">
                    Usuários atuais
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Contas que ainda fazem parte da operação do sistema.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold-light)] px-3 py-1.5 text-xs font-bold text-[var(--gold-dark)]">
                  {usuarios.length} contas
                </span>
              </div>

              {usuarios.length === 0 ? (
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
                        d="M16.5 19.25a4.5 4.5 0 0 0-9 0"
                      />
                      <circle cx="12" cy="9" r="3.25" />
                    </svg>
                  </div>

                  <h3 className="text-base font-bold text-slate-700">
                    Nenhum usuário atual
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Não existem usuários ativos ou inativos fora do arquivo.
                  </p>
                </div>
              ) : (
                                <div className="md:overflow-x-auto">
                  {/* Celular: lista em cartões */}
                  <ul className="divide-y divide-slate-100 md:hidden">
                    {usuarios.map((u) => (
                      <li key={u.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-extrabold text-slate-500">
                            {u.nome.trim().charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-bold text-slate-800">
                              {u.nome}
                            </p>
                            <p className="break-all text-xs text-slate-500">
                              {u.email}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                {perfilLabel[u.perfil] ?? u.perfil}
                              </span>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                                  u.ativo
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }`}
                              >
                                {u.ativo ? "Ativo" : "Inativo"}
                              </span>

                              {u.id === session.user.id && (
                                <span className="rounded-full border border-[var(--gold)]/40 bg-[var(--gold-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--gold-dark)]">
                                  Sua conta
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {u.id !== session.user.id && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <form action={alterarStatusUsuario}>
                              <input type="hidden" name="usuarioId" value={u.id} />
                              <input
                                type="hidden"
                                name="novoStatus"
                                value={(!u.ativo).toString()}
                              />
                              <button
                                type="submit"
                                className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-xs font-bold ${
                                  u.ativo
                                    ? "border-red-200 bg-white text-red-600"
                                    : "border-emerald-200 bg-white text-emerald-700"
                                }`}
                              >
                                {u.ativo ? "Desativar" : "Ativar"}
                              </button>
                            </form>

                            {!u.ativo && (
                              <form action={arquivarUsuario}>
                                <input type="hidden" name="usuarioId" value={u.id} />
                                <button
                                  type="submit"
                                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600"
                                >
                                  Arquivar
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  <table className="hidden w-full min-w-[900px] text-left md:table">
                    <thead className="border-b border-slate-200 bg-slate-50/70">
                      <tr>
                        <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                          Usuário
                        </th>

                        <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                          E-mail
                        </th>

                        <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                          Perfil
                        </th>

                        <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                          Status
                        </th>

                        <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                          Ação
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {usuarios.map((u) => (
                        <tr
                          key={u.id}
                          className="group transition-colors duration-150 hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4 md:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-extrabold text-slate-500 transition-colors duration-150 group-hover:bg-[var(--gold-light)] group-hover:text-[var(--gold-dark)]">
                                {u.nome
                                  .trim()
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-800">
                                  {u.nome}
                                </p>

                                {u.id === session.user.id && (
                                  <span className="mt-1 inline-flex rounded-full border border-[var(--gold)]/40 bg-[var(--gold-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--gold-dark)]">
                                    Sua conta
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 md:px-6">
                            <span className="block max-w-[240px] truncate text-sm text-slate-600">
                              {u.email}
                            </span>
                          </td>

                          <td className="px-5 py-4 md:px-6">
                            <div className="max-w-[210px]">
                              <span className="inline-flex max-w-full whitespace-normal break-words rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold leading-5 text-slate-600 [overflow-wrap:anywhere]">
                                {perfilLabel[u.perfil] ?? u.perfil}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 md:px-6">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${u.ativo
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-red-200 bg-red-50 text-red-700"
                                }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${u.ativo
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                  }`}
                              />

                              {u.ativo ? "Ativo" : "Inativo"}
                            </span>
                          </td>

                          <td className="px-5 py-4 md:px-6">
                            {u.id !== session.user.id ? (
                              <div className="flex flex-wrap gap-2">
                                <form action={alterarStatusUsuario}>
                                  <input
                                    type="hidden"
                                    name="usuarioId"
                                    value={u.id}
                                  />

                                  <input
                                    type="hidden"
                                    name="novoStatus"
                                    value={(!u.ativo).toString()}
                                  />

                                  <button
                                    type="submit"
                                    className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-150 ${u.ativo
                                        ? "border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50"
                                        : "border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
                                      }`}
                                  >
                                    {u.ativo ? "Desativar" : "Ativar"}
                                  </button>
                                </form>

                                {!u.ativo && (
                                  <form action={arquivarUsuario}>
                                    <input
                                      type="hidden"
                                      name="usuarioId"
                                      value={u.id}
                                    />

                                    <button
                                      type="submit"
                                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-all duration-150 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
                                    >
                                      Arquivar
                                    </button>
                                  </form>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-slate-400">
                                Conta atual
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Cadastro */}
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
                      d="M15 19.25a4.5 4.5 0 0 0-9 0"
                    />
                    <circle cx="10.5" cy="8.75" r="3" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25v6"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.25 11.25h6"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-extrabold tracking-tight">
                  Cadastrar novo usuário
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/65">
                  Crie uma nova conta e defina o perfil de acesso
                  correspondente.
                </p>
              </div>

              <div className="p-6 md:p-7">
                <form action={criarUsuario} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                    <div>
                      <label
                        htmlFor="nome"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Nome
                      </label>

                      <input
                        id="nome"
                        type="text"
                        name="nome"
                        required
                        placeholder="Nome completo"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--gold-dark)] focus:bg-white focus:ring-4 focus:ring-[var(--gold)]/15"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        E-mail
                      </label>

                      <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        placeholder="usuario@exemplo.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--gold-dark)] focus:bg-white focus:ring-4 focus:ring-[var(--gold)]/15"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="senha"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Senha inicial
                      </label>

                      <input
                        id="senha"
                        type="password"
                        name="senha"
                        required
                        minLength={6}
                        placeholder="Mínimo de 6 caracteres"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--gold-dark)] focus:bg-white focus:ring-4 focus:ring-[var(--gold)]/15"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="diretoria"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Diretoria{" "}
                        <span className="font-medium text-slate-400">
                          (opcional)
                        </span>
                      </label>

                      <input
                        id="diretoria"
                        type="text"
                        name="diretoria"
                        placeholder="Ex.: Diretoria Administrativa"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[var(--gold-dark)] focus:bg-white focus:ring-4 focus:ring-[var(--gold)]/15"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="perfil"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Perfil
                    </label>

                    <select
                      id="perfil"
                      name="perfil"
                      defaultValue="SOLICITANTE"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-[var(--gold-dark)] focus:bg-white focus:ring-4 focus:ring-[var(--gold)]/15"
                    >
                      <option value="SOLICITANTE">
                        Solicitante
                      </option>

                      <option value="ANALISTA_FINANCEIRO">
                        Analista Financeiro
                      </option>

                      <option value="GESTOR_FINANCEIRO">
                        Gestor Financeiro
                      </option>

                      <option value="ADMINISTRADOR_SISTEMA">
                        Administrador do Sistema
                      </option>
                    </select>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-slate-500">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <circle cx="12" cy="12" r="8.25" />
                          <path strokeLinecap="round" d="M12 10.5v5" />
                          <path strokeLinecap="round" d="M12 7.75h.01" />
                        </svg>
                      </div>

                      <p className="text-xs leading-5 text-slate-500">
                        O perfil selecionado determina as permissões
                        associadas à conta dentro do sistema.
                      </p>
                    </div>
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

                    Cadastrar usuário
                  </button>
                </form>
              </div>
            </aside>
          </div>

          {/* Usuários arquivados */}
          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-7">
              <div>
                <h2 className="text-lg font-bold text-[var(--brand-dark)]">
                  Usuários arquivados
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Contas retiradas da operação, mantidas para preservação do
                  histórico institucional.
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
                {usuariosArquivados.length} arquivados
              </span>
            </div>

            {usuariosArquivados.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center md:py-14">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 7.5h13.5"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 7.5v10.75A1.75 1.75 0 0 0 9.25 20h5.5a1.75 1.75 0 0 0 1.75-1.75V7.5"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.25 7.5V5.75A1.25 1.25 0 0 1 10.5 4.5h3A1.25 1.25 0 0 1 14.75 5.75V7.5"
                    />
                  </svg>
                </div>

                <h3 className="text-base font-bold text-slate-700">
                  Nenhum usuário arquivado
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  As contas arquivadas aparecerão nesta área.
                </p>
              </div>
            ) : (
                            <div className="md:overflow-x-auto">
                {/* Celular: lista em cartões */}
                <ul className="divide-y divide-slate-100 md:hidden">
                  {usuariosArquivados.map((u) => (
                    <li key={u.id} className="p-4">
                      <p className="break-words text-sm font-bold text-slate-700">
                        {u.nome}
                      </p>
                      <p className="break-all text-xs text-slate-500">{u.email}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          {perfilLabel[u.perfil] ?? u.perfil}
                        </span>
                        <span>
                          Arquivado em{" "}
                          {u.arquivadoEm
                            ? new Intl.DateTimeFormat("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(u.arquivadoEm)
                            : "—"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <table className="hidden w-full min-w-[900px] text-left md:table">
                  <thead className="border-b border-slate-200 bg-slate-50/70">
                    <tr>
                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                        Usuário
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                        E-mail
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                        Perfil
                      </th>

                      <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-400 md:px-6">
                        Arquivado em
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {usuariosArquivados.map((u) => (
                      <tr
                        key={u.id}
                        className="transition-colors duration-150 hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4 md:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-extrabold text-slate-400">
                              {u.nome
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <p className="text-sm font-bold text-slate-700">
                              {u.nome}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 md:px-6">
                          <span className="block max-w-[260px] truncate text-sm text-slate-500">
                            {u.email}
                          </span>
                        </td>

                        <td className="px-5 py-4 md:px-6">
                          <span className="inline-flex max-w-[220px] whitespace-normal break-words rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold leading-5 text-slate-500 [overflow-wrap:anywhere]">
                            {perfilLabel[u.perfil] ?? u.perfil}
                          </span>
                        </td>

                        <td className="px-5 py-4 md:px-6">
                          <span className="text-sm text-slate-500">
                            {u.arquivadoEm
                              ? new Intl.DateTimeFormat("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(u.arquivadoEm)
                              : "—"}
                          </span>
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