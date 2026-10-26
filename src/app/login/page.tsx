"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const resultado = await signIn("credentials", {
      email,
      senha,
      redirect: false,
    });

    setCarregando(false);

    if (resultado?.error) {
      setErro("Email ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
            className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-6"
      style={{
        background:
          "radial-gradient(circle at 15% 15%, rgba(255, 219, 77, 0.08), transparent 28%), radial-gradient(circle at 85% 85%, rgba(255, 255, 255, 0.04), transparent 30%), linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 55%, #252936 100%)",
      }}
    >
      {/* Elementos decorativos */}
      <div className="pointer-events-none absolute left-[-80px] top-[-80px] h-56 w-56 rounded-full border border-white/5" />
      <div className="pointer-events-none absolute right-[-100px] bottom-[-100px] h-72 w-72 rounded-full border border-white/5" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[65%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        {/* Área institucional */}
        <div className="hidden px-6 lg:block">
          <div className="max-w-xl">
            <div className="mb-8 flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-extrabold text-[#1a1d24] shadow-lg"
                style={{ backgroundColor: "var(--gold)" }}
              >
                ₣
              </span>

              <div className="leading-tight">
                <span className="block text-base font-extrabold tracking-tight text-white">
                  PDCA Financeiro
                </span>
                <span className="block text-xs text-white/45">
                  Gestão de Solicitações
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p
                  className="mb-3 text-xs font-bold uppercase tracking-[0.22em]"
                  style={{ color: "var(--gold)" }}
                >
                  Acesso institucional
                </p>

                <h1 className="max-w-lg text-4xl font-extrabold leading-[1.12] tracking-tight text-white">
                  Gestão financeira com
                  <span className="block text-white/75">
                    organização e rastreabilidade.
                  </span>
                </h1>
              </div>

              <p className="max-w-md text-sm leading-7 text-white/55">
                Plataforma destinada à formalização, análise, acompanhamento e
                arquivamento das solicitações financeiras do PDCA.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60">
                  Solicitações
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60">
                  Documentos
                </span>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60">
                  Auditoria
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card de login */}
        <div className="w-full max-w-md justify-self-center">
          <div
            className="rounded-2xl border border-white/10 bg-white p-7 shadow-2xl sm:p-9 animate-[fadeInScale_0.4s_ease-out]"
            style={{
              boxShadow:
                "0 24px 70px rgba(0, 0, 0, 0.35), 0 8px 24px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div className="mb-7 flex flex-col items-center text-center">
              <div
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-extrabold text-[#1a1d24] shadow-md"
                style={{ backgroundColor: "var(--gold)" }}
              >
                ₣
              </div>

              <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
                PDCA Financeiro
              </h2>

              <p className="mt-1.5 text-xs font-medium text-slate-500">
                Gestão de Solicitações Financeiras
              </p>

              <div className="mt-4 h-px w-14" style={{ backgroundColor: "var(--gold)" }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-400 focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Senha
                </label>

                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-slate-400 focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                />
              </div>

              {erro && (
                <p className="animate-[fadeIn_0.2s_ease-out] rounded-lg border border-[var(--danger)]/15 bg-[var(--danger-light)] px-3.5 py-3 text-sm font-medium text-[var(--danger)]">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="press w-full rounded-lg px-4 py-3 text-sm font-bold text-[#1a1d24] shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: "var(--gold)" }}
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-5 text-center">
              <p className="text-[11px] leading-5 text-slate-400">
                Acesso restrito aos usuários autorizados do PDCA.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.97) translateY(6px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}