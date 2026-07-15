// ============================================
// CAMINHO: public/js/estatisticas/loterias/diadesorte.js
// ============================================
// DIA DE SORTE - COM MÊS FORMATADO (VERSÃO CORRIGIDA)
// ============================================

import { renderizarBase, renderizarHeatmap, renderizarResumoIA } from '../renderers/base.js';
import { renderizarExtras } from '../renderers/components/extras.js';

// ============================================
// CONFIGURAÇÕES
// ============================================

const NOMES_MESES = [
    '',        // índice 0 (vazio)
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
];

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

export function renderizar(data, config, userData, periodo) {
    // 1. Base (resumo, cards, etc.)
    const base = renderizarBase(data, config, userData, periodo);

    // 2. Dados dos meses
    const elementosExtras = data.elementosExtras || [];
    const nomeElemento = data.nomeElemento || 'Mês de Sorte';

    // 3. ⭐ FORMATAR MESES: "1" → "1 - Janeiro"
    const mesesFormatados = elementosExtras.map(item => {
        const num = parseInt(item.nome);
        if (num >= 1 && num <= 12 && NOMES_MESES[num]) {
            return {
                ...item,
                nome: `${item.nome} - ${NOMES_MESES[num]}`
            };
        }
        return item;
    });

    // 4. ⭐ ORDENAR POR QUANTIDADE (decrescente) para o resumo IA
    const ranking = [...mesesFormatados].sort((a, b) => b.quantidade - a.quantidade);

    // 5. Renderizar card de meses (com dados formatados)
    const mesesHtml = renderizarExtras(
        mesesFormatados,
        nomeElemento,
        '📅',
        userData.isPro
    );

    // 6. Renderizar heatmap (com dados formatados)
    const mesesHeatmap = mesesFormatados.map(item => ({
        nome: item.nome,
        quantidade: item.quantidade
    }));
    const heatmap = renderizarHeatmap(mesesHeatmap, '📊 Distribuição dos Meses');

    // 7. ⭐ Resumo IA com meses formatados e ordenação explícita
    const mesMaisFrequente = ranking[0]?.nome || 'N/A';
    const mesMenosFrequente = ranking[ranking.length - 1]?.nome || 'N/A';
    const qtdMaisFrequente = ranking[0]?.quantidade || 0;
    const qtdMenosFrequente = ranking[ranking.length - 1]?.quantidade || 0;

    const resumoIA = renderizarResumoIA([
        `Dia de Sorte: ${data.filteredDraws || data.totalDraws || 0} concursos analisados`,
        `📅 Mês mais frequente: ${mesMaisFrequente} (${qtdMaisFrequente} vezes)`,
        `📅 Mês menos frequente: ${mesMenosFrequente} (${qtdMenosFrequente} vezes)`,
        `📊 Total de meses analisados: ${data.filteredDraws || data.totalDraws || 0}`
    ]);

    // 8. Montar HTML final
    return `
        ${base.proBanner}
        ${base.resumo}
        ${base.cards}
        ${mesesHtml}
        ${heatmap}
        ${resumoIA}
        ${base.footer}
    `;
}

export default { renderizar };
