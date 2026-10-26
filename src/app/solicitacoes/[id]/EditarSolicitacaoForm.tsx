"use client";

import { useState } from "react";
import { editarSolicitacao } from "./actions";

type Props = {
  solicitacao: {
    id: string;
    tipo: string;
    titulo: string;
    descricao: string;
    valorSolicitado: string;
  };
};

const campoClass =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--text-primary)] outline-none transition-all duration-150 hover:border-[var(--border-strong)] focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15";

const labelClass =
  "mb-1.5 block text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]";

export function EditarSolicitacaoForm({ solicitacao }: Props) {
  const [editando, setEditando] = useState(false);

  if (!editando) {
    return (
      <button
        type="button"
        onClick={() => setEditando(true)}
        className="press inline-flex h-11 w-full items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white px-5 text-sm font-bold text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)] sm:w-auto"
      >
        Editar solicitação
      </button>
    );
  }

  return (
    <form action={editarSolicitacao} className="space-y-4">
      <input type="hidden" name="solicitacaoId" value={solicitacao.id} />

      <div>
        <label htmlFor="edit-tipo" className={labelClass}>
          Tipo de solicitação
        </label>
        <select
          id="edit-tipo"
          name="tipo"
          defaultValue={solicitacao.tipo}
          className={`${campoClass} h-11`}
        >
          <option value="VERBA">Verba</option>
          <option value="CUSTEIO">Custeio</option>
          <option value="REEMBOLSO">Reembolso</option>
        </select>
      </div>

      <div>
        <label htmlFor="edit-titulo" className={labelClass}>
          Título
        </label>
        <input
          id="edit-titulo"
          type="text"
          name="titulo"
          defaultValue={solicitacao.titulo}
          required
          className={`${campoClass} h-11`}
        />
      </div>

      <div>
        <label htmlFor="edit-descricao" className={labelClass}>
          Descrição
        </label>
        <textarea
          id="edit-descricao"
          name="descricao"
          defaultValue={solicitacao.descricao}
          rows={5}
          required
          className={`${campoClass} resize-y py-3 leading-6`}
        />
      </div>

      <div>
        <label htmlFor="edit-valor" className={labelClass}>
          Valor solicitado (R$)
        </label>
        <input
          id="edit-valor"
          type="number"
          name="valor"
          step="0.01"
          min="0"
          inputMode="decimal"
          defaultValue={solicitacao.valorSolicitado}
          required
          className={`${campoClass} h-11 sm:max-w-xs`}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          className="press inline-flex h-11 items-center justify-center rounded-lg bg-[var(--brand-dark)] px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--brand)] hover:shadow-md"
        >
          Salvar alterações
        </button>

        <button
          type="button"
          onClick={() => setEditando(false)}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border-strong)] bg-white px-5 text-sm font-semibold text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-muted)]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}