// ============================================
// ESTATISTICAS.js - Cálculo e exibição de estatísticas (FASE 11)
// ============================================

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

function calcularFrequenciaNumeros(dados, maxNumero, incluirZero = false) {
    const limite = maxNumero + (incluirZero ? 1 : 0);
    const freq = new Array(limite).fill(0);
    
    dados.forEach(jogo => {
        jogo.forEach(numero => {
            if (numero >= 0 && numero < limite) {
                freq[numero]++;
            }
        });
    });
    
    const resultados = [];
    for (let i = 0; i < limite; i++) {
        if (incluirZero || i > 0) {
            resultados.push({ numero: i, quantidade: freq[i] });
        }
    }
    
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

function calcularDuplasMaisSorteadas(dados, maxNumero, incluirZero = false) {
    const duplas = new Map();
    
    dados.forEach(jogo => {
        for (let i = 0; i < jogo.length; i++) {
            for (let j = i + 1; j < jogo.length; j++) {
                const num1 = Math.min(jogo[i], jogo[j]);
                const num2 = Math.max(jogo[i], jogo[j]);
                const key = `${num1},${num2}`;
                duplas.set(key, (duplas.get(key) || 0) + 1);
            }
        }
    });
    
    const resultados = Array.from(duplas.entries()).map(([key, quantidade]) => {
        const [num1, num2] = key.split(',').map(Number);
        return { dupla: [num1, num2], quantidade };
    });
    
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

function calcularTriplasMaisSorteadas(dados, maxNumero, incluirZero = false) {
    const triplas = new Map();
    
    dados.forEach(jogo => {
        for (let i = 0; i < jogo.length; i++) {
            for (let j = i + 1; j < jogo.length; j++) {
                for (let k = j + 1; k < jogo.length; k++) {
                    const nums = [jogo[i], jogo[j], jogo[k]].sort((a, b) => a - b);
                    const key = `${nums[0]},${nums[1]},${nums[2]}`;
                    triplas.set(key, (triplas.get(key) || 0) + 1);
                }
            }
        }
    });
    
    const resultados = Array.from(triplas.entries()).map(([key, quantidade]) => {
        const [num1, num2, num3] = key.split(',').map(Number);
        return { tripla: [num1, num2, num3], quantidade };
    });
    
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

// ============================================
// RENDERIZAÇÃO
// ============================================

async function renderizarEstatisticas(loteriaId, dados) {
    const container = document.getElementById('estatisticasContainer');
    const config = window.LOTERIAS[loteriaId];
    
    if (!dados || dados.length === 0) {
        container.innerHTML = '<div class="stats-error">⚠️ Nenhum dado disponível para esta loteria. Faça upload do CSV.</div>';
        return;
    }
    
    // Calcular estatísticas
    const frequenciaNumeros = calcularFrequenciaNumeros(dados, config.maxNumero, config.incluirZero || false);
    const numerosMaisSorteados = frequenciaNumeros.slice(0, 20);
    const numerosMenosSorteados = [...frequenciaNumeros].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
    const duplasMaisSorteadas = calcularDuplasMaisSorteadas(dados, config.maxNumero, config.incluirZero || false).slice(0, 20);
    const triplasMaisSorteadas = calcularTriplasMaisSorteadas(dados, config.maxNumero, config.incluirZero || false).slice(0, 20);
    
    // Formatar número com zero à esquerda
    const formatarNumero = (num, incluirZero) => {
        if (num === 0 && incluirZero) return '00';
        return String(num).padStart(2, '0');
    };
    
    const formatarDupla = (dupla, incluirZero) => {
        return `(${formatarNumero(dupla[0], incluirZero)}, ${formatarNumero(dupla[1], incluirZero)})`;
    };
    
    const formatarTripla = (tripla, incluirZero) => {
        return `(${formatarNumero(tripla[0], incluirZero)}, ${formatarNumero(tripla[1], incluirZero)}, ${formatarNumero(tripla[2], incluirZero)})`;
    };
    
    const incluirZero = config.incluirZero || false;
    
    const html = `
        <div class="stats-grid-cards">
            <!-- Números Mais Sorteados -->
            <div class="stats-card">
                <h4>🔢 MAIS SORTEADOS</h4>
                <div class="stats-numbers-list">
                    ${numerosMaisSorteados.map(item => `
                        <div class="stats-number-item">
                            <span class="numero">${formatarNumero(item.numero, incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Números Menos Sorteados -->
            <div class="stats-card">
                <h4>🔢 MENOS SORTEADOS</h4>
                <div class="stats-numbers-list">
                    ${numerosMenosSorteados.map(item => `
                        <div class="stats-number-item">
                            <span class="numero">${formatarNumero(item.numero, incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Duplas Mais Sorteadas -->
            <div class="stats-card">
                <h4>👥 DUPLAS MAIS SORTEADAS</h4>
                <div class="stats-numbers-list">
                    ${duplasMaisSorteadas.map(item => `
                        <div class="stats-pair-item">
                            <span class="pair">${formatarDupla(item.dupla, incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Tríades Mais Sorteadas -->
            <div class="stats-card">
                <h4>🔢 TRÍADES MAIS SORTEADAS</h4>
                <div class="stats-numbers-list">
                    ${triplasMaisSorteadas.map(item => `
                        <div class="stats-trio-item">
                            <span class="trio">${formatarTripla(item.tripla, incluirZero)}</span>
                            <span class="quantidade">${item.quantidade} vez(es)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(56, 189, 248, 0.1); border-radius: 12px; text-align: center;">
            <div style="font-size: 13px; color: var(--text-secondary);">
                📊 Baseado em <strong>${dados.length}</strong> concursos | 
                🎯 ${config.numeros} números por concurso | 
                ${config.incluirZero ? '✅ Inclui zero' : '❌ Não inclui zero'}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// EXPORTAÇÃO
// ============================================
window.renderizarEstatisticas = renderizarEstatisticas;
window.calcularFrequenciaNumeros = calcularFrequenciaNumeros;
window.calcularDuplasMaisSorteadas = calcularDuplasMaisSorteadas;
window.calcularTriplasMaisSorteadas = calcularTriplasMaisSorteadas;
