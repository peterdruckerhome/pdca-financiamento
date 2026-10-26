import Link from "next/link";
import { signOut } from "@/../auth";
import { MobileMenu } from "./MobileMenu";

export function NavHeader({
  nome,
  perfil,
  naoLidas = 0,
}: {
  nome: string;
  perfil: string;
  naoLidas?: number;
}) {
  const ehFinanceiro = [
    "ANALISTA_FINANCEIRO",
    "GESTOR_FINANCEIRO",
    "ADMINISTRADOR_SISTEMA",
  ].includes(perfil);

  const perfilLabel: Record<string, string> = {
    SOLICITANTE: "Solicitante",
    ANALISTA_FINANCEIRO: "Analista Financeiro",
    GESTOR_FINANCEIRO: "Gestor Financeiro",
    ADMINISTRADOR_SISTEMA: "Administrador",
  };

  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  const links = [
    { href: "/dashboard", label: "Meu Painel" },
    { href: "/modelos", label: "Modelos" },
    ...(ehFinanceiro
      ? [
        { href: "/financeiro", label: "Quadro Financeiro" },
        { href: "/auditoria", label: "Auditoria" },
      ]
      : []),
    ...(perfil === "ADMINISTRADOR_SISTEMA"
      ? [{ href: "/usuarios", label: "Usuários" }]
      : []),
  ];

  const linksMobile = [...links, { href: "/perfil", label: "Meu Perfil" }];

  async function sair() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  const linkClass =
    "rounded-md px-3 py-1.5 text-sm font-medium text-white/70 transition-all duration-150 hover:bg-white/10 hover:text-[var(--gold)]";

  return (
    <header className="brand-gradient sticky top-0 z-20 shadow-lg">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 xl:gap-8">
          <Link href="/dashboard" className="group flex shrink-0 items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold text-[#1a1d24] shadow-sm transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: "var(--gold)" }}
            >
              ₣
            </span>
            <div className="leading-tight">
              <span className="block text-sm font-bold text-white">PDCA Financeiro</span>
              <span className="hidden text-[11px] text-white/50 sm:block">
                Gestão de Solicitações
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {naoLidas > 0 && (
            <span
              className="animate-pulse-gold flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold text-[#1a1d24]"
              style={{ backgroundColor: "var(--gold)" }}
            >
              {naoLidas}
            </span>
          )}

          <Link
            href="/perfil"
            className="group flex items-center gap-2.5 rounded-md px-1 py-1.5 transition-colors duration-150 hover:bg-white/10 xl:px-2"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-[#1a1d24] transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: "var(--gold)" }}
            >
              {iniciais}
            </span>
            <div className="hidden text-left leading-tight xl:block">
              <span className="block text-xs font-semibold text-white">{nome}</span>
              <span className="block text-[11px] text-white/50">
                {perfilLabel[perfil] ?? perfil}
              </span>
            </div>
          </Link>

          <form action={sair} className="hidden lg:block">
            <button
              type="submit"
              className="press rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/70 transition-all duration-150 hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              Sair
            </button>
          </form>

          <MobileMenu
            links={linksMobile}
            nome={nome}
            perfilLabel={perfilLabel[perfil] ?? perfil}
          >
            <form action={sair}>
              <button
                type="submit"
                className="press flex min-h-11 w-full items-center justify-center rounded-lg border border-white/15 px-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Sair
              </button>
            </form>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}