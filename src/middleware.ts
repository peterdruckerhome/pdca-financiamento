import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const ROTAS_PUBLICAS = ["/login"];
const ROTAS_SOMENTE_FINANCEIRO = ["/financeiro", "/auditoria"];
const PERFIS_FINANCEIRO = [
    "ANALISTA_FINANCEIRO",
    "GESTOR_FINANCEIRO",
    "ADMINISTRADOR_SISTEMA",
];

const ROTAS_SOMENTE_ADMIN = ["/usuarios"];

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const estaLogado = !!req.auth?.user;
    const perfilUsuario = req.auth?.user?.perfil;
    const ehRotaPublica = ROTAS_PUBLICAS.includes(pathname);

    if (!estaLogado && !ehRotaPublica) {
        const loginUrl = new URL("/login", req.nextUrl.origin);
        return NextResponse.redirect(loginUrl);
    }

    if (estaLogado && pathname === "/login") {
        const dashboardUrl = new URL("/dashboard", req.nextUrl.origin);
        return NextResponse.redirect(dashboardUrl);
    }

    const ehRotaFinanceiro = ROTAS_SOMENTE_FINANCEIRO.some((rota) =>
        pathname.startsWith(rota)
    );

    if (ehRotaFinanceiro && !PERFIS_FINANCEIRO.includes(perfilUsuario ?? "")) {
        const dashboardUrl = new URL("/dashboard", req.nextUrl.origin);
        return NextResponse.redirect(dashboardUrl);
    }

    const ehRotaAdmin = ROTAS_SOMENTE_ADMIN.some((rota) =>
        pathname.startsWith(rota)
    );

    if (ehRotaAdmin && perfilUsuario !== "ADMINISTRADOR_SISTEMA") {
        const dashboardUrl = new URL("/dashboard", req.nextUrl.origin);
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        {
            source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
            missing: [
                { type: "header", key: "next-action" },
            ],
        },
    ],
};