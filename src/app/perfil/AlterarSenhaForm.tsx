"use client";

import { useState } from "react";
import { alterarSenha } from "./actions";

const campoClass =
  "h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--text-primary)] outline-none transition-all duration-150 hover:border-[var(--border-strong)] focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15";

const labelClass =
  "mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]";

export function AlterarSenhaForm() {
  const [mensagem, setMensagem] = useState<{
    tipo: "erro" | "sucesso";
    texto: string;
  } | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(formData: FormData) {
    setCarregando(true);
    setMensagem(null);

    try {
      await alterarSenha(formData);
      setMensagem({ tipo: "sucesso", texto: "Senha alterada com sucesso!" });
    } catch (erro) {
      setMensagem({
        tipo: "erro",
        texto: erro instanceof Error ? erro.message : "Erro ao alterar senha.",
      });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="senhaAtual" className={labelClass}>
          Senha atual
        </label>
        <input
          id="senhaAtual"
          type="password"
          name="senhaAtual"
          autoComplete="current-password"
          required
          className={campoClass}
        />
      </div>

      <div>
        <label htmlFor="novaSenha" className={labelClass}>
          Nova senha
        </label>
        <input
          id="novaSenha"
          type="password"
          name="novaSenha"
          autoComplete="new-password"
          required
          minLength={6}
          className={campoClass}
        />
      </div>

      <div>
        <label htmlFor="confirmarSenha" className={labelClass}>
          Confirmar nova senha
        </label>
        <input
          id="confirmarSenha"
          type="password"
          name="confirmarSenha"
          autoComplete="new-password"
          required
          minLength={6}
          className={campoClass}
        />
      </div>

      {mensagem && (
        <p
          role="status"
          className={`rounded-lg border px-3.5 py-3 text-sm font-medium ${mensagem.tipo === "erro"
              ? "border-[var(--danger)]/15 bg-[var(--danger-light)] text-[var(--danger)]"
              : "border-[var(--success)]/15 bg-[var(--success-light)] text-[var(--success)]"
            }`}
        >
          {mensagem.texto}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="press inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--brand-dark)] px-5 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-[var(--brand)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {carregando ? "Salvando..." : "Alterar Senha"}
      </button>
    </form>
  );
}