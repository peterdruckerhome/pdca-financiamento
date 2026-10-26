import { auth } from "@/../auth";
import { redirect } from "next/navigation";
import { NavHeader } from "@/components/NavHeader";
import { AlterarSenhaForm } from "./AlterarSenhaForm";

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const perfilLabel: Record<string, string> = {
    SOLICITANTE: "Solicitante",
    ANALISTA_FINANCEIRO: "Analista Financeiro",
    GESTOR_FINANCEIRO: "Gestor Financeiro",
    ADMINISTRADOR_SISTEMA: "Administrador do Sistema",
  };

  const perfilExibicao =
    perfilLabel[session.user.perfil] ?? session.user.perfil;

  const nome = session.user.name ?? "Usuário";
  const inicial = nome.trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <NavHeader
        nome={session.user.name ?? ""}
        perfil={session.user.perfil}
      />

      <main className="w-full px-6 py-8 md:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-[1200px]">
          {/* Cabeçalho */}
          <section className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-dark)]" />
              Conta do usuário
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--brand-dark)] md:text-3xl">
              Meu Perfil
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Consulte as informações da sua conta e mantenha
              suas credenciais de acesso protegidas.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
            {/* Informações da conta */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="brand-gradient px-6 py-7 text-white md:px-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--gold)] text-xl font-extrabold text-[var(--brand-dark)] shadow-lg shadow-black/15">
                    {inicial}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/55">
                      Usuário autenticado
                    </p>

                    <h2 className="mt-1 truncate text-xl font-extrabold tracking-tight">
                      {nome}
                    </h2>

                    <p className="mt-1 truncate text-sm text-white/65">
                      {session.user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-[var(--brand-dark)]">
                    Informações da conta
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Dados vinculados à sua sessão no
                    sistema.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
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
                            d="M15.75 7.5A3.75 3.75 0 1 1 8.25 7.5a3.75 3.75 0 0 1 7.5 0Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 20.25a7.5 7.5 0 0 1 15 0"
                          />
                        </svg>
                      </div>

                      <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                        Nome
                      </span>
                    </div>

                    <p className="break-words text-sm font-bold text-slate-800">
                      {session.user.name}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
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
                            d="M3.75 6.75A2.25 2.25 0 0 1 6 4.5h12a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V6.75Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 6 7.5 5.25L19.5 6"
                          />
                        </svg>
                      </div>

                      <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                        E-mail
                      </span>
                    </div>

                    <p className="break-all text-sm font-bold text-slate-800">
                      {session.user.email}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
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
                            d="M12 3.75 19.5 6v5.25c0 4.25-2.77 7.98-7.5 9-4.73-1.02-7.5-4.75-7.5-9V6L12 3.75Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m9.25 12 1.85 1.85L14.75 10.2"
                          />
                        </svg>
                      </div>

                      <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                        Perfil de acesso
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-bold text-slate-800">
                        {perfilExibicao}
                      </p>

                      <span className="inline-flex w-fit items-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold-light)] px-3 py-1.5 text-xs font-bold text-[var(--gold-dark)]">
                        {session.user.perfil}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--gold-light)] text-[var(--gold-dark)]">
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
                          d="M12 9v3.75"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 16.5h.008"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.29 4.86 3.82 16.14a1.5 1.5 0 0 0 1.3 2.25h13.76a1.5 1.5 0 0 0 1.3-2.25L13.71 4.86a1.5 1.5 0 0 0-2.6 0Z"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Perfil e permissões
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        As permissões disponíveis no
                        sistema são determinadas pelo
                        perfil de acesso associado à
                        sua conta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Segurança */}
            <section className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 md:px-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gold-light)] text-[var(--gold-dark)]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <rect
                        width="15"
                        height="10"
                        x="4.5"
                        y="10.5"
                        rx="1.75"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 10.5V7.75a4.5 4.5 0 0 1 9 0v2.75"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 14.25v3"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[var(--brand-dark)]">
                      Segurança da conta
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Mantenha sua senha atualizada para
                      proteger o acesso ao sistema.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-7">
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-slate-500">
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
                          d="M12 3.75 19.5 6v5.25c0 4.25-2.77 7.98-7.5 9-4.73-1.02-7.5-4.75-7.5-9V6L12 3.75Z"
                        />
                      </svg>
                    </div>

                    <p className="text-xs leading-5 text-slate-500">
                      A alteração de senha atualiza
                      somente as credenciais da sua
                      própria conta.
                    </p>
                  </div>
                </div>

                <AlterarSenhaForm />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}