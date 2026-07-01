 // public/js/estatisticas/renderers/components/tabela.js

// ============================================
// COMPONENTE: TABELA  01/07/2026
// ============================================
// ============================================
// COMPONENTE: TABELA
// ============================================

/**
 * Renderiza uma tabela genérica
 */
export function renderizarTabela(dados, colunas, titulo = '') {
    if (!dados || dados.length === 0) return '';
    
    const headerHtml = colunas.map(col => `
        <th style="padding: 8px; text-align: ${col.alinhamento || 'left'}; color: #94a3b8;">${col.titulo}</th>
    `).join('');
    
    const bodyHtml = dados.map(item => {
        const cells = colunas.map(col => {
            const valor = col.acessor ? col.acessor(item) : item[col.chave];
            const estilo = col.estilo ? col.estilo(valor) : '';
            return `<td style="padding: 6px 8px; text-align: ${col.alinhamento || 'left'}; ${estilo}">${valor}</td>`;
        }).join('');
        return `<tr style="border-bottom: 1px solid #1e293b;">${cells}</tr>`;
    }).join('');
    
    return `
        <div style="overflow-x: auto; margin-bottom: 20px;">
            ${titulo ? `<h5 style="color: #f59e0b; font-size: 14px; margin-bottom: 12px;">${titulo}</h5>` : ''}
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; min-width: 700px;">
                <thead>
                    <tr style="background: #334155;">
                        ${headerHtml}
                    </tr>
                </thead>
                <tbody>
                    ${bodyHtml}
                </tbody>
            </table>
        </div>
    `;
}
