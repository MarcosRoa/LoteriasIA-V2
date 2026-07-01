//public/js/estatisticas/core/calculos.js

// ============================================
// CÁLCULOS COMPARTILHADOS - TODAS AS LOTERIAS 01/07/2026
// ============================================

// ============================================
// CÁLCULOS - FUNÇÕES MATEMÁTICAS PURAS
// ============================================

/**
 * Calcula a frequência de cada número
 */
export function calcularFrequencia(dados, maxNumero, incluirZero = false) {
    const limite = maxNumero + (incluirZero ? 1 : 0);
    const freq = new Array(limite).fill(0);
    
    dados.forEach(jogo => {
        jogo.forEach(numero => {
            if (numero >= 0 && numero < limite) freq[numero]++;
        });
    });
    
    const resultados = [];
    for (let i = incluirZero ? 0 : 1; i < limite; i++) {
        resultados.push({ numero: i, quantidade: freq[i] });
    }
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

/**
 * Calcula o ranking a partir de uma frequência
 */
export function calcularRanking(frequencia) {
    return frequencia.map((item, index) => ({
        ...item,
        posicao: index + 1
    }));
}

/**
 * Calcula duplas mais frequentes
 */
export function calcularDuplas(dados) {
    const duplas = new Map();
    
    dados.forEach(jogo => {
        for (let i = 0; i < jogo.length; i++) {
            for (let j = i + 1; j < jogo.length; j++) {
                const key = `${Math.min(jogo[i], jogo[j])},${Math.max(jogo[i], jogo[j])}`;
                duplas.set(key, (duplas.get(key) || 0) + 1);
            }
        }
    });
    
    return Array.from(duplas.entries())
        .map(([key, quantidade]) => {
            const [num1, num2] = key.split(',').map(Number);
            return { dupla: [num1, num2], quantidade };
        })
        .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Calcula triplas mais frequentes
 */
export function calcularTriplas(dados) {
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
    
    return Array.from(triplas.entries())
        .map(([key, quantidade]) => {
            const [num1, num2, num3] = key.split(',').map(Number);
            return { tripla: [num1, num2, num3], quantidade };
        })
        .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Calcula atraso (última ocorrência)
 */
export function calcularAtraso(dados, elementos) {
    const ultimaOcorrencia = new Map();
    elementos.forEach((el, idx) => {
        ultimaOcorrencia.set(el, idx);
    });
    
    const total = elementos.length;
    return Array.from(ultimaOcorrencia.entries())
        .map(([nome, ultima]) => ({
            nome,
            ultimaVez: ultima + 1,
            concursosAtraso: total - 1 - ultima
        }))
        .sort((a, b) => b.concursosAtraso - a.concursosAtraso);
}

/**
 * Calcula distribuição por faixas
 */
export function calcularDistribuicao(dados, faixas) {
    const resultado = faixas.map(faixa => ({
        ...faixa,
        quantidade: 0
    }));
    
    dados.forEach(jogo => {
        jogo.forEach(num => {
            faixas.forEach((faixa, idx) => {
                if (num >= faixa.min && num <= faixa.max) {
                    resultado[idx].quantidade++;
                }
            });
        });
    });
    
    const total = resultado.reduce((acc, r) => acc + r.quantidade, 0);
    return resultado.map(r => ({
        ...r,
        percentual: total > 0 ? (r.quantidade / total) * 100 : 0
    }));
}

/**
 * Calcula proporção Pares × Ímpares
 */
export function calcularParesImpares(dados) {
    const proporcoes = new Map();
    
    dados.forEach(jogo => {
        let pares = 0, impares = 0;
        jogo.forEach(num => {
            if (num % 2 === 0) pares++;
            else impares++;
        });
        const key = `${pares}x${impares}`;
        proporcoes.set(key, (proporcoes.get(key) || 0) + 1);
    });
    
    const total = dados.length;
    return Array.from(proporcoes.entries())
        .map(([proporcao, quantidade]) => ({
            proporcao,
            quantidade,
            percentual: total > 0 ? (quantidade / total) * 100 : 0
        }))
        .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Calcula heatmap (frequência por categoria)
 */
export function calcularHeatmap(dados, categorias, maxCategoria) {
    const heatmap = [];
    for (let i = 0; i < categorias; i++) {
        heatmap[i] = new Array(maxCategoria + 1).fill(0);
    }
    
    dados.forEach(item => {
        item.forEach((valor, idx) => {
            if (idx < categorias && valor >= 0 && valor <= maxCategoria) {
                heatmap[idx][valor]++;
            }
        });
    });
    
    return heatmap;
}

/**
 * Calcula tendência (últimos N concursos)
 */
export function calcularTendencia(dados, elementos, ultimosN = 30) {
    const ultimos = elementos.slice(-ultimosN);
    const freq = new Map();
    ultimos.forEach(el => {
        freq.set(el, (freq.get(el) || 0) + 1);
    });
    
    return Array.from(freq.entries())
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);
}

/**
 * Extrai UF do nome (ex: PALMEIRAS/SP → SP)
 */
export function extrairUF(nome) {
    if (!nome) return 'OUTROS';
    const partes = nome.split('/');
    return partes.length > 1 ? partes[1] : 'OUTROS';
}

/**
 * Agrupa elementos por categoria (ex: times por estado)
 */
export function agruparPorCategoria(elementos, categorias, extrator) {
    const grupos = new Map();
    elementos.forEach(el => {
        const categoria = extrator(el);
        if (!grupos.has(categoria)) {
            grupos.set(categoria, { elementos: [], quantidade: 0 });
        }
        const grupo = grupos.get(categoria);
        grupo.elementos.push(el);
        grupo.quantidade++;
    });
    
    return Array.from(grupos.entries())
        .map(([categoria, data]) => ({
            categoria,
            elementos: data.elementos,
            quantidade: data.quantidade,
            percentual: elementos.length > 0 ? (data.quantidade / elementos.length) * 100 : 0
        }))
        .sort((a, b) => b.quantidade - a.quantidade);
}
