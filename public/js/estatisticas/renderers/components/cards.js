// ============================================
// CAMINHO: public/js/estatisticas/renderers/components/cards.js
// ============================================
// COMPONENTE: CARDS DE ESTATÍSTICAS
// ============================================

// ============================================
// FUNÇÃO DE FORMATAÇÃO (LOCAL)
// ============================================

function formatarNumero(num, incluirZero = false) {
    if (num === 0 && incluirZero) return '00';
    return String(num).padStart(2, '0');
}

function formatarDupla(dupla, incluirZero = false) {
    return `(${formatarNumero(dupla[0], incluirZero)}, ${formatarNumero(dupla[1], incluirZero)})`;
}

function formatarTripla(tripla, incluirZero = false) {
    return `(${formatarNumero(tripla[0], incluirZero)}, ${formatarNumero(tripla[1], incluirZero)}, ${formatarNumero(tripla[2], incluirZero)})`;
}

// ============================================
// CRIA ITEM DE ESTATÍSTICA
// ============================================

function criarItemStats(label, quantidade, isPro = false) {
    const labelClass = isPro ? 'numero' : 'numero-pro';
    const labelDisplay = isPro ? label : '⭐⭐ PRO ⭐⭐';
    return `
        <div class="stats-item">
            <span class="${labelClass}">${labelDisplay}</span>
            <span class="quantidade">${quantidade} vez(es)</span>
        </div>
    `;
}

// ============================================
// CRIA CARDS DE ESTATÍSTICAS
// ============================================

export function criarCards(maisSorteados, menosSorteados, duplas, triplas, isPro, incluirZero) {
    return `
        <div class="stats-cards-grid">
            <div class="stats-card">
                <h4>🔢 MAIS SORTEADOS (Top 20)</h4>
                <div class="stats-list">
                    ${maisSorteados.length > 0 ? maisSorteados.map(item => 
                        criarItemStats(formatarNumero(item.numero, incluirZero), item.quantidade, isPro)
                    ).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 MENOS SORTEADOS (Bottom 20)</h4>
                <div class="stats-list">
                    ${menosSorteados.length > 0 ? menosSorteados.map(item => 
                        criarItemStats(formatarNumero(item.numero, incluirZero), item.quantidade, isPro)
                    ).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhum dado disponível
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>👥 DUPLAS MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${duplas.length > 0 ? duplas.map(item => 
                        criarItemStats(formatarDupla(item.dupla, incluirZero), item.quantidade, isPro)
                    ).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma dupla encontrada
                        </div>
                    `}
                </div>
            </div>
            
            <div class="stats-card">
                <h4>🔢 TRÍADES MAIS SORTEADAS</h4>
                <div class="stats-list">
                    ${triplas.length > 0 ? triplas.map(item => 
                        criarItemStats(formatarTripla(item.tripla, incluirZero), item.quantidade, isPro)
                    ).join('') : `
                        <div class="stats-item" style="justify-content: center; color: #94a3b8; padding: 20px;">
                            Nenhuma tríade encontrada
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}
