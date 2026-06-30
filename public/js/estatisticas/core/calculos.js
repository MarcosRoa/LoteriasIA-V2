//public/js/estatisticas/core/calculos.js

// ============================================
// CÁLCULOS COMPARTILHADOS - TODAS AS LOTERIAS
// ============================================

/**
 * Calcula a frequência de cada número em um conjunto de dados
 */
export function calcularFrequenciaNumeros(dados, maxNumero, incluirZero = false) {
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

/**
 * Calcula as duplas mais sorteadas
 */
export function calcularDuplasMaisSorteadas(dados) {
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

/**
 * Calcula as triplas mais sorteadas
 */
export function calcularTriplasMaisSorteadas(dados) {
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

/**
 * Calcula elementos extras (times, meses, trevos)
 */
export function calcularElementosExtras(elementos, tipo) {
    const freq = new Map();
    
    elementos.forEach(el => {
        if (el === null || el === undefined || el === 0 || el === 'Desconhecido' || el === '') {
            return;
        }
        
        let nome = String(el);
        freq.set(nome, (freq.get(nome) || 0) + 1);
    });
    
    const resultados = Array.from(freq.entries()).map(([nome, quantidade]) => ({
        nome,
        quantidade
    }));
    
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados.slice(0, 20);
}

/**
 * Extrai UF do nome do time (ex: PALMEIRAS/SP → SP)
 */
export function extrairUF(time) {
    if (!time) return 'OUTROS';
    const partes = time.split('/');
    return partes.length > 1 ? partes[1] : 'OUTROS';
}

/**
 * Calcula distribuição por faixas de dezenas
 */
export function calcularDistribuicaoDezenas(dados, faixas) {
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
