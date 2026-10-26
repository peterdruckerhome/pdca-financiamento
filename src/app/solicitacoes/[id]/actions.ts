"use server";

import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { criarNotificacao } from "@/lib/notificacoes";

export async function anexarDocumento(formData: FormData) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Usuário não autenticado.");
    }

    const solicitacaoId = formData.get("solicitacaoId") as string;
    const tipoDocumento = formData.get("tipoDocumento") as string;
    const arquivo = formData.get("arquivo") as File;

    if (!solicitacaoId || !tipoDocumento || !arquivo || arquivo.size === 0) {
        throw new Error("Selecione um arquivo e o tipo de documento.");
    }

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) {
        throw new Error("Solicitação não encontrada.");
    }

    const perfisFinanceiro = ["ANALISTA_FINANCEIRO", "GESTOR_FINANCEIRO"];
    const ehDono = solicitacao.solicitanteId === session.user.id;
    const ehFinanceiro = perfisFinanceiro.includes(session.user.perfil);

    if (!ehDono && !ehFinanceiro) {
        throw new Error("Você não tem permissão para anexar documentos a esta solicitação.");
    }

    if (ehDono && solicitacao.status !== "RASCUNHO" && solicitacao.status !== "CORRECAO_SOLICITADA") {
        throw new Error("O solicitante só pode anexar documentos em rascunho ou quando houver correção solicitada.");
    }

    const statusPermitidosFinanceiro = ["EM_ANALISE", "APROVADA", "EXECUTADA_PAGA"];
    if (ehFinanceiro && !ehDono && !statusPermitidosFinanceiro.includes(solicitacao.status)) {
        throw new Error("A Diretoria só pode anexar documentos durante a análise, aprovação ou execução.");
    }

    const blob = await put(
        `solicitacoes/${solicitacaoId}/${arquivo.name}`,
        arquivo,
        { access: "public", addRandomSuffix: true }
    );

    const caminhoRelativo = blob.url;

    await prisma.documento.create({
        data: {
            nomeArquivo: arquivo.name,
            caminhoArquivo: caminhoRelativo,
            tipo: tipoDocumento as
                | "TERMO_SOLICITACAO"
                | "ORCAMENTO"
                | "COMPROVANTE"
                | "RECIBO"
                | "EXTRATO"
                | "DOCUMENTO_FISCAL"
                | "PARECER_ANEXO"
                | "OUTRO",
            solicitacaoId: solicitacaoId,
            enviadoPorId: session.user.id,
        },
    });

    await prisma.historicoEvento.create({
        data: {
            tipo: "UPLOAD_DOCUMENTO",
            descricao: `Documento "${arquivo.name}" anexado à solicitação.`,
            solicitacaoId: solicitacaoId,
            responsavelId: session.user.id,
        },
    });

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
}

export async function enviarParaAnalise(formData: FormData) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Usuário não autenticado.");
    }

    const solicitacaoId = formData.get("solicitacaoId") as string;

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) {
        throw new Error("Solicitação não encontrada.");
    }

    if (solicitacao.solicitanteId !== session.user.id) {
        throw new Error("Você não tem permissão para enviar esta solicitação.");
    }

    if (solicitacao.status !== "RASCUNHO") {
        throw new Error("Apenas solicitações em rascunho podem ser enviadas.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            status: "ENVIADA",
            historico: {
                create: {
                    tipo: "ENVIO",
                    descricao: "Solicitação enviada formalmente para análise.",
                    statusAnterior: "RASCUNHO",
                    statusNovo: "ENVIADA",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
}

export async function iniciarAnalise(formData: FormData) {
    const session = await auth();

    if (!session?.user) {
        throw new Error("Usuário não autenticado.");
    }

    const perfisPermitidos = ["ANALISTA_FINANCEIRO"];

    if (!perfisPermitidos.includes(session.user.perfil)) {
        throw new Error("Você não tem permissão para analisar solicitações.");
    }

    const solicitacaoId = formData.get("solicitacaoId") as string;

    if (!solicitacaoId) {
        throw new Error("Identificador da solicitação não informado.");
    }

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) {
        throw new Error("Solicitação não encontrada.");
    }

    if (solicitacao.solicitanteId === session.user.id) {
        throw new Error(
            "Você não pode analisar sua própria solicitação."
        );
    }

    if (!["ENVIADA", "REENVIADA"].includes(solicitacao.status)) {
        throw new Error("Esta solicitação não está aguardando análise.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            status: "EM_ANALISE",
            responsavelAnaliseId: session.user.id,
            historico: {
                create: {
                    tipo: "INICIO_ANALISE",
                    descricao: `${session.user.name} iniciou a análise da solicitação.`,
                    statusAnterior: solicitacao.status,
                    statusNovo: "EM_ANALISE",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    await criarNotificacao(
        solicitacao.solicitanteId,
        `Sua solicitação ${solicitacao.numero} entrou em análise.`,
        solicitacaoId
    );

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
    revalidatePath("/financeiro");
}

export async function aprovarSolicitacao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const perfisPermitidos = ["GESTOR_FINANCEIRO"];
    if (!perfisPermitidos.includes(session.user.perfil)) {
        throw new Error("Você não tem permissão para aprovar solicitações.");
    }

    const solicitacaoId = formData.get("solicitacaoId") as string;
    const conclusaoParecer = formData.get("conclusaoParecer") as string;

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    if (solicitacao.solicitanteId === session.user.id) {
        throw new Error("Você não pode aprovar sua própria solicitação.");
    }

    if (solicitacao.status !== "EM_ANALISE") {
        throw new Error("Apenas solicitações em análise podem ser aprovadas.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            status: "APROVADA",
            responsavelDecisaoId: session.user.id,
            valorAprovado: solicitacao.valorSolicitado,
            pareceres: {
                create: {
                    conclusao: conclusaoParecer || "Solicitação aprovada conforme documentação apresentada.",
                    emitidoPorId: session.user.id,
                },
            },
            historico: {
                create: {
                    tipo: "APROVACAO",
                    descricao: `${session.user.name} aprovou a solicitação.`,
                    statusAnterior: "EM_ANALISE",
                    statusNovo: "APROVADA",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    await criarNotificacao(
        solicitacao.solicitanteId,
        `Sua solicitação ${solicitacao.numero} foi aprovada.`,
        solicitacaoId
    );

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
    revalidatePath(`/financeiro`);
}

export async function rejeitarSolicitacao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const perfisPermitidos = ["GESTOR_FINANCEIRO"];
    if (!perfisPermitidos.includes(session.user.perfil)) {
        throw new Error("Você não tem permissão para rejeitar solicitações.");
    }

    const solicitacaoId = formData.get("solicitacaoId") as string;
    const conclusaoParecer = formData.get("conclusaoParecer") as string;

    if (!conclusaoParecer || conclusaoParecer.trim() === "") {
        throw new Error("É obrigatório justificar a rejeição.");
    }

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    if (solicitacao.solicitanteId === session.user.id) {
        throw new Error("Você não pode rejeitar sua própria solicitação.");
    }

    if (solicitacao.status !== "EM_ANALISE") {
        throw new Error("Apenas solicitações em análise podem ser rejeitadas.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            status: "REJEITADA",
            pareceres: {
                create: {
                    conclusao: conclusaoParecer,
                    emitidoPorId: session.user.id,
                },
            },
            historico: {
                create: {
                    tipo: "REJEICAO",
                    descricao: `${session.user.name} rejeitou a solicitação. Motivo: ${conclusaoParecer}`,
                    statusAnterior: "EM_ANALISE",
                    statusNovo: "REJEITADA",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    await criarNotificacao(
        solicitacao.solicitanteId,
        `Sua solicitação ${solicitacao.numero} foi rejeitada.`,
        solicitacaoId
    );

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
    revalidatePath(`/financeiro`);
}

export async function solicitarCorrecao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const perfisPermitidos = ["ANALISTA_FINANCEIRO", "GESTOR_FINANCEIRO"];
    if (!perfisPermitidos.includes(session.user.perfil)) {
        throw new Error("Você não tem permissão para solicitar correções.");
    }

    const solicitacaoId = formData.get("solicitacaoId") as string;
    const observacaoCorrecao = formData.get("observacaoCorrecao") as string;

    if (!observacaoCorrecao || observacaoCorrecao.trim() === "") {
        throw new Error("É obrigatório indicar o que precisa ser corrigido.");
    }

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    if (solicitacao.status !== "EM_ANALISE") {
        throw new Error("Apenas solicitações em análise podem retornar para correção.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            status: "CORRECAO_SOLICITADA",
            historico: {
                create: {
                    tipo: "SOLICITACAO_CORRECAO",
                    descricao: `${session.user.name} solicitou correção: ${observacaoCorrecao}`,
                    statusAnterior: "EM_ANALISE",
                    statusNovo: "CORRECAO_SOLICITADA",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    await criarNotificacao(
        solicitacao.solicitanteId,
        `Sua solicitação ${solicitacao.numero} precisa de correções.`,
        solicitacaoId
    );

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
    revalidatePath(`/financeiro`);
}

export async function reenviarSolicitacao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const solicitacaoId = formData.get("solicitacaoId") as string;

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    if (solicitacao.solicitanteId !== session.user.id) {
        throw new Error("Você não tem permissão para reenviar esta solicitação.");
    }

    if (solicitacao.status !== "CORRECAO_SOLICITADA") {
        throw new Error("Apenas solicitações com correção solicitada podem ser reenviadas.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            status: "REENVIADA",
            historico: {
                create: {
                    tipo: "REENVIO",
                    descricao: `${session.user.name} reenviou a solicitação após correção.`,
                    statusAnterior: "CORRECAO_SOLICITADA",
                    statusNovo: "REENVIADA",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
    revalidatePath(`/financeiro`);
}

export async function registrarExecucao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const perfisPermitidos = ["ANALISTA_FINANCEIRO", "GESTOR_FINANCEIRO"];
    if (!perfisPermitidos.includes(session.user.perfil)) {
        throw new Error("Você não tem permissão para registrar execução/pagamento.");
    }

    const solicitacaoId = formData.get("solicitacaoId") as string;
    const valorExecutado = formData.get("valorExecutado") as string;

    if (!valorExecutado) {
        throw new Error("Informe o valor executado/pago.");
    }

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    if (solicitacao.status !== "APROVADA") {
        throw new Error("Apenas solicitações aprovadas podem ter execução registrada.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            status: "EXECUTADA_PAGA",
            valorExecutado: valorExecutado,
            historico: {
                create: {
                    tipo: "REGISTRO_EXECUCAO_PAGAMENTO",
                    descricao: `${session.user.name} registrou a execução/pagamento no valor de R$ ${valorExecutado}.`,
                    statusAnterior: "APROVADA",
                    statusNovo: "EXECUTADA_PAGA",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    await criarNotificacao(
        solicitacao.solicitanteId,
        `A execução/pagamento da solicitação ${solicitacao.numero} foi registrada.`,
        solicitacaoId
    );

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
    revalidatePath(`/financeiro`);
    revalidatePath(`/dashboard`);
}

export async function encerrarSolicitacao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const perfisPermitidos = ["ANALISTA_FINANCEIRO", "GESTOR_FINANCEIRO"];
    if (!perfisPermitidos.includes(session.user.perfil)) {
        throw new Error("Você não tem permissão para encerrar solicitações.");
    }

    const solicitacaoId = formData.get("solicitacaoId") as string;

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    if (!["APROVADA", "EXECUTADA_PAGA"].includes(solicitacao.status)) {
        throw new Error("Apenas solicitações aprovadas ou executadas podem ser encerradas.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            status: "ENCERRADA",
            historico: {
                create: {
                    tipo: "ENCERRAMENTO",
                    descricao: `${session.user.name} encerrou o processo.`,
                    statusAnterior: solicitacao.status,
                    statusNovo: "ENCERRADA",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    await criarNotificacao(
        solicitacao.solicitanteId,
        `Sua solicitação ${solicitacao.numero} foi encerrada.`,
        solicitacaoId
    );

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
    revalidatePath(`/financeiro`);
    revalidatePath(`/dashboard`);
}

const STATUS_CANCELAVEIS = [
    "RASCUNHO",
    "ENVIADA",
    "EM_ANALISE",
    "CORRECAO_SOLICITADA",
    "REENVIADA",
];

export async function cancelarSolicitacao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const solicitacaoId = formData.get("solicitacaoId") as string;
    const justificativa = formData.get("justificativa") as string;

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    const ehDono = solicitacao.solicitanteId === session.user.id;

    if (!ehDono) {
        throw new Error("Apenas o solicitante pode cancelar a própria solicitação.");
    }

    if (!STATUS_CANCELAVEIS.includes(solicitacao.status)) {
        throw new Error("Esta solicitação não pode mais ser cancelada.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            status: "CANCELADA",
            historico: {
                create: {
                    tipo: "CANCELAMENTO",
                    descricao: `${session.user.name} cancelou a solicitação.${justificativa ? ` Motivo: ${justificativa}` : ""
                        }`,
                    statusAnterior: solicitacao.status,
                    statusNovo: "CANCELADA",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    if (solicitacao.solicitanteId !== session.user.id) {
        await criarNotificacao(
            solicitacao.solicitanteId,
            `Sua solicitação ${solicitacao.numero} foi cancelada.`,
            solicitacaoId
        );
    }

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
    revalidatePath(`/financeiro`);
    revalidatePath(`/dashboard`);
}

export async function reabrirSolicitacao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    if (session.user.perfil !== "ADMINISTRADOR_SISTEMA") {
        throw new Error("Apenas o Administrador do Sistema pode efetivar a reabertura.");
    }

    const solicitacaoId = formData.get("solicitacaoId") as string;
    const justificativa = formData.get("justificativa") as string;

    if (!justificativa || justificativa.trim() === "") {
        throw new Error("É obrigatório justificar a reabertura.");
    }

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    if (solicitacao.status !== "CANCELADA") {
        throw new Error("Apenas solicitações canceladas podem ser reabertas.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            status: "EM_ANALISE",
            historico: {
                create: {
                    tipo: "REABERTURA",
                    descricao: `${session.user.name} (Administrador do Sistema) reabriu a solicitação. Justificativa: ${justificativa}`,
                    statusAnterior: "CANCELADA",
                    statusNovo: "EM_ANALISE",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
    revalidatePath(`/financeiro`);
    revalidatePath(`/dashboard`);
}

export async function editarSolicitacao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const solicitacaoId = formData.get("solicitacaoId") as string;
    const tipo = formData.get("tipo") as string;
    const titulo = formData.get("titulo") as string;
    const descricao = formData.get("descricao") as string;
    const valor = formData.get("valor") as string;

    if (!tipo || !titulo || !descricao || !valor) {
        throw new Error("Todos os campos são obrigatórios.");
    }

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    if (solicitacao.solicitanteId !== session.user.id) {
        throw new Error("Você não tem permissão para editar esta solicitação.");
    }

    if (solicitacao.status !== "RASCUNHO") {
        throw new Error("Apenas solicitações em rascunho podem ser editadas.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: {
            tipo: tipo as "VERBA" | "CUSTEIO" | "REEMBOLSO",
            titulo,
            descricao,
            valorSolicitado: valor,
            historico: {
                create: {
                    tipo: "EDICAO",
                    descricao: "Solicitante editou os dados da solicitação.",
                    responsavelId: session.user.id,
                },
            },
        },
    });

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
}

export async function removerDocumento(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const documentoId = formData.get("documentoId") as string;
    const solicitacaoId = formData.get("solicitacaoId") as string;

    const documento = await prisma.documento.findUnique({
        where: { id: documentoId },
        include: { solicitacao: true },
    });

    if (!documento) throw new Error("Documento não encontrado.");

    if (documento.solicitacao.solicitanteId !== session.user.id) {
        throw new Error("Você não tem permissão para remover este documento.");
    }

    if (documento.solicitacao.status !== "RASCUNHO") {
        throw new Error("Documentos só podem ser removidos enquanto a solicitação está em rascunho.");
    }

    try {
        await del(documento.caminhoArquivo);
    } catch {
        // Se o arquivo já não existir no Blob, seguimos para remover o registro mesmo assim.
    }

    await prisma.documento.delete({
        where: { id: documentoId },
    });

    await prisma.historicoEvento.create({
        data: {
            tipo: "UPLOAD_DOCUMENTO",
            descricao: `${session.user.name} removeu o documento "${documento.nomeArquivo}".`,
            solicitacaoId: solicitacaoId,
            responsavelId: session.user.id,
        },
    });

    revalidatePath(`/solicitacoes/${solicitacaoId}`);
}

export async function arquivarSolicitacao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const solicitacaoId = formData.get("solicitacaoId") as string;

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    if (solicitacao.solicitanteId !== session.user.id) {
        throw new Error("Você não tem permissão para arquivar esta solicitação.");
    }

    if (!["ENCERRADA", "REJEITADA", "CANCELADA"].includes(solicitacao.status)) {
        throw new Error("Apenas solicitações encerradas, rejeitadas ou canceladas podem ser arquivadas.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: { arquivada: true },
    });

    revalidatePath("/dashboard");
}

export async function desarquivarSolicitacao(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error("Usuário não autenticado.");

    const solicitacaoId = formData.get("solicitacaoId") as string;

    const solicitacao = await prisma.solicitacao.findUnique({
        where: { id: solicitacaoId },
    });

    if (!solicitacao) throw new Error("Solicitação não encontrada.");

    if (solicitacao.solicitanteId !== session.user.id) {
        throw new Error("Você não tem permissão para desarquivar esta solicitação.");
    }

    await prisma.solicitacao.update({
        where: { id: solicitacaoId },
        data: { arquivada: false },
    });

    revalidatePath("/dashboard");
}