"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

type LinkItem = { href: string; label: string };

export function MobileMenu({
    links,
    nome,
    perfilLabel,
    children,
}: {
    links: LinkItem[];
    nome: string;
    perfilLabel: string;
    children: ReactNode;
}) {
    const [aberto, setAberto] = useState(false);

    return (
        <div className="lg:hidden">
            <button
                type="button"
                onClick={() => setAberto((v) => !v)}
                aria-label={aberto ? "Fechar menu" : "Abrir menu"}
                aria-expanded={aberto}
                className="flex h-11 w-11 items-center justify-center rounded-md text-white transition hover:bg-white/10"
            >
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    {aberto ? (
                        <path d="M6 6l12 12M18 6L6 18" />
                    ) : (
                        <path d="M4 7h16M4 12h16M4 17h16" />
                    )}
                </svg>
            </button>

            {aberto && (
                <div className="animate-fade-in absolute inset-x-0 top-full max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-white/10 bg-[var(--brand-dark)] px-4 pb-4 pt-3 shadow-xl">
                    <div className="mb-3 border-b border-white/10 pb-3">
                        <p className="text-sm font-semibold text-white">{nome}</p>
                        <p className="text-xs text-white/50">{perfilLabel}</p>
                    </div>

                    <nav className="flex flex-col gap-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setAberto(false)}
                                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-[var(--gold)]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-3 border-t border-white/10 pt-3">{children}</div>
                </div>
            )}
        </div>
    );
}