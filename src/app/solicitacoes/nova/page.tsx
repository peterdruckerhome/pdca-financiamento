import { criarSolicitacaoRascunho } from "./actions";
import Link from "next/link";

const tiposSolicitacao = [
  {
    value: "VERBA",
    title: "Verba",
    description: "Solicitação de disponibilização de um valor para uma atividade.",
  },
  {
    value: "CUSTEIO",
    title: "Custeio",
    description: "Solicitação para que o PDCA arque diretamente com uma despesa.",
  },
  {
    value: "REEMBOLSO",
    title: "Reembolso",
    description: "Solicitação de restituição de uma despesa já realizada.",
  },
];

export default function NovaSolicitacaoPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Barra superior */}
      <div className="border-b border-[var(--border-soft)] bg-white">
        <div className="mx-auto flex min-h-[64px] w-full max-w-5xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
          >
            <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5">
              ←
            </span>

            Voltar para o painel
          </Link>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Cabeçalho */}
        <section className="animate-fade-in mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--gold-dark)" }}
            />

            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Novo processo financeiro
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                Nova Solicitação
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Preencha os dados iniciais do processo. Você poderá continuar
                o preenchimento enquanto a solicitação estiver em rascunho.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-[11px] font-semibold text-[var(--text-muted)] sm:flex">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--gold-dark)" }}
              />
              Etapa inicial
            </div>
          </div>
        </section>

        {/* Indicador visual do fluxo */}
        <section className="animate-fade-in stagger-1 mb-6">
          <div className="surface-card p-5">
            <div className="flex items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-[#1a1d24] shadow-sm"
                  style={{ backgroundColor: "var(--gold)" }}
                >
                  1
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-[var(--text-primary)]">
                    Dados da solicitação
                  </p>

                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                    Informações básicas do processo
                  </p>
                </div>
              </div>

              <div className="mx-3 h-px flex-1 bg-[var(--border)] sm:mx-5" />

              <div className="hidden items-center gap-3 opacity-45 sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-bold text-[var(--text-muted)]">
                  2
                </span>

                <div>
                  <p className="text-xs font-bold text-[var(--text-secondary)]">
                    Documentação
                  </p>

                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                    Próxima etapa
                  </p>
                </div>
              </div>

              <div className="mx-3 h-px hidden flex-1 bg-[var(--border)] sm:mx-5 sm:block" />

              <div className="hidden items-center gap-3 opacity-45 lg:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-bold text-[var(--text-muted)]">
                  3
                </span>

                <div>
                  <p className="text-xs font-bold text-[var(--text-secondary)]">
                    Análise
                  </p>

                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                    Fluxo administrativo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Formulário */}
        <section className="animate-fade-in stagger-2">
          <div className="surface-card overflow-hidden">
            <div className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-5 py-5 sm:px-6">
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">
                Informações da solicitação
              </h2>

              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                Os dados abaixo serão associados ao processo criado no
                sistema.
              </p>
            </div>

            <form action={criarSolicitacaoRascunho} className="space-y-7 p-5 sm:p-6">
              {/* Tipo */}
              <div>
                <div className="mb-3">
                  <label
                    htmlFor="tipo"
                    className="block text-sm font-bold text-[var(--text-primary)]"
                  >
                    Tipo de solicitação
                  </label>

                  <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                    Selecione a modalidade que corresponde ao seu pedido.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {tiposSolicitacao.map((tipo, index) => (
                    <label
                      key={tipo.value}
                      className="group relative cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="tipo"
                        value={tipo.value}
                        defaultChecked={index === 0}
                        className="peer sr-only"
                      />

                      <div className="h-full rounded-xl border border-[var(--border)] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] peer-checked:border-[var(--gold-dark)] peer-checked:bg-[var(--gold-light)]/45 peer-checked:shadow-[0_0_0_3px_rgba(255,219,77,0.12)]">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <span className="text-sm font-extrabold text-[var(--text-primary)]">
                            {tipo.title}
                          </span>

                          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white text-[10px] text-transparent transition-all peer-checked:border-[var(--gold-dark)] peer-checked:bg-[var(--gold)] peer-checked:text-[#1a1d24]">
                            ✓
                          </span>
                        </div>

                        <p className="text-xs leading-5 text-[var(--text-secondary)]">
                          {tipo.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Divisor */}
              <div className="h-px bg-[var(--border-soft)]" />

              {/* Título */}
              <div>
                <label
                  htmlFor="titulo"
                  className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                >
                  Título da solicitação
                </label>

                <p className="mb-2.5 text-xs text-[var(--text-muted)]">
                  Use um título objetivo que permita identificar rapidamente o
                  pedido.
                </p>

                <input
                  id="titulo"
                  type="text"
                  name="titulo"
                  placeholder="Ex.: Aquisição de materiais para Semana Acadêmica"
                  required
                  className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--text-primary)] outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-[var(--border-strong)] focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                />
              </div>

              {/* Descrição */}
              <div>
                <div className="mb-2.5 flex items-end justify-between gap-3">
                  <div>
                    <label
                      htmlFor="descricao"
                      className="block text-sm font-bold text-[var(--text-primary)]"
                    >
                      Descrição
                    </label>

                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      Explique a finalidade, atividade relacionada, justificativa
                      e demais informações relevantes.
                    </p>
                  </div>
                </div>

                <textarea
                  id="descricao"
                  name="descricao"
                  rows={6}
                  placeholder="Explique o que está sendo solicitado, para qual finalidade, a atividade relacionada, a justificativa e outras informações importantes para a análise."
                  required
                  className="w-full resize-y rounded-lg border border-[var(--border)] bg-white px-3.5 py-3 text-sm leading-6 text-[var(--text-primary)] outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-[var(--border-strong)] focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                />
              </div>

              {/* Valor */}
              <div>
                <label
                  htmlFor="valor"
                  className="mb-1.5 block text-sm font-bold text-[var(--text-primary)]"
                >
                  Valor solicitado
                </label>

                <p className="mb-2.5 text-xs text-[var(--text-muted)]">
                  Informe o valor pretendido para a solicitação.
                </p>

                <div className="relative max-w-sm">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-bold text-[var(--text-muted)]">
                    R$
                  </span>

                  <input
                    id="valor"
                    type="number"
                    name="valor"
                    step="0.01"
                    min="0"
                    required
                    className="h-12 w-full rounded-lg border border-[var(--border)] bg-white pl-11 pr-3.5 text-base font-semibold text-[var(--text-primary)] outline-none transition-all duration-150 placeholder:text-slate-400 hover:border-[var(--border-strong)] focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold)]/15"
                  />
                </div>
              </div>

              {/* Rodapé */}
              <div className="border-t border-[var(--border-soft)] pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-md">
                    <p className="text-xs font-semibold text-[var(--text-secondary)]">
                      Salvamento em rascunho
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">
                      O processo será criado como rascunho e ainda não será
                      considerado formalmente enviado para análise.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="press inline-flex h-11 w-full items-center justify-center rounded-lg px-5 text-sm font-bold text-[#1a1d24] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
                    style={{ backgroundColor: "var(--gold)" }}
                  >
                    Salvar como Rascunho
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}