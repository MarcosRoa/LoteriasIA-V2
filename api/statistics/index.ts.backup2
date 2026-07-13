// api/statistics/index.ts 27/06/26
// api/statistics/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ============================================
// MAPEAMENTO DE MESES (Apenas para exibição)
// ============================================
const MESES_NOME: Record<number, string> = {
    1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
    5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
    9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
};

// ============================================
// CONFIGURAÇÕES DAS LOTERIAS
// ============================================
const LOTTERY_CONFIGS: Record<string, { 
    maxNumero: number; 
    numerosPadrao: number; 
    incluirZero: boolean;
    nome: string;
    temElementoExtra?: boolean;
    nomeElemento?: string;
    tipoElemento?: 'time' | 'mes' | 'trevo';
    isSuperSete?: boolean;
    isMilionaria?: boolean;
    isTimemania?: boolean;
    isDiaDeSorte?: boolean;
}> = {
    megasena: { 
        maxNumero: 60, 
        numerosPadrao: 6, 
        incluirZero: false,
        nome: 'Mega-Sena' 
    },
    quina: { 
        maxNumero: 80, 
        numerosPadrao: 5, 
        incluirZero: false,
        nome: 'Quina' 
    },
    lotofacil: { 
        maxNumero: 25, 
        numerosPadrao: 15, 
        incluirZero: false,
        nome: 'Lotofácil' 
    },
    lotomania: { 
        maxNumero: 99, 
        numerosPadrao: 20, 
        incluirZero: true,
        nome: 'Lotomania' 
    },
    duplasena: { 
        maxNumero: 50, 
        numerosPadrao: 6, 
        incluirZero: false,
        nome: 'Dupla Sena' 
    },
    timemania: { 
        maxNumero: 80, 
        numerosPadrao: 7, 
        incluirZero: false,
        nome: 'Timemania',
        temElementoExtra: true,
        nomeElemento: 'Time do Coração',
        tipoElemento: 'time',
        isTimemania: true
    },
    milionaria: { 
        maxNumero: 50, 
        numerosPadrao: 6, 
        incluirZero: false,
        nome: '+Milionária',
        temElementoExtra: true,
        nomeElemento: 'Trevo',
        tipoElemento: 'trevo',
        isMilionaria: true
    },
    loteca: { 
        maxNumero: 3, 
        numerosPadrao: 14, 
        incluirZero: true,
        nome: 'Loteca' 
    },
    diadesorte: { 
        maxNumero: 31, 
        numerosPadrao: 7, 
        incluirZero: false,
        nome: 'Dia de Sorte',
        temElementoExtra: true,
        nomeElemento: 'Mês de Sorte',
        tipoElemento: 'mes',
        isDiaDeSorte: true
    },
    supersete: { 
        maxNumero: 9, 
        numerosPadrao: 7, 
        incluirZero: true,
        nome: 'Super Sete',
        isSuperSete: true
    }
};

// ============================================
// PROCESSAR CSV
// ============================================
function processarCSV(texto: string, config: any): { 
    dados: number[][]; 
    datas: string[]; 
    elementosExtras: (number | string)[];
    dadosBrutos: number[][];
    trevos?: number[][];
} {
    const linhas = texto.split('\n').filter(l => l.trim() && !l.startsWith('Data'));
    const dados: number[][] = [];
    const dadosBrutos: number[][] = [];
    const datas: string[] = [];
    const elementosExtras: (number | string)[] = [];
    const trevos: number[][] = [];
    
    if (linhas.length === 0) {
        console.log(`⚠️ Nenhuma linha encontrada no CSV para ${config.nome}`);
        return { dados, datas, elementosExtras, dadosBrutos, trevos };
    }
    
    const sep = linhas[0]?.includes(';') ? ';' : ',';
    console.log(`📊 Processando ${config.nome} com separador: "${sep}"`);
    
    const header = linhas[0];
    const colunasHeader = header.split(sep);
    let extraColumnIndex = -1;
    let dataIndex = -1;
    let extraColumnName = '';
    let isSuperSete = config.isSuperSete || false;
    let isMilionaria = config.isMilionaria || false;
    const trevoIndices: number[] = [];
    
    for (let j = 0; j < colunasHeader.length; j++) {
        const colName = colunasHeader[j].trim().toLowerCase();
        
        if (colName.includes('data') || colName.includes('sorteio')) {
            dataIndex = j;
            console.log(`📅 Coluna de Data detectada: "${colunasHeader[j].trim()}" (índice ${j})`);
        }
        
        if (colName.includes('trevo') || colName.includes('Trevo')) {
            trevoIndices.push(j);
            console.log(`🍀 Coluna Trevo detectada: "${colunasHeader[j].trim()}" (índice ${j})`);
        }
        
        if (colName.includes('mes') || colName.includes('mês') || colName.includes('time') || colName.includes('coração') || colName.includes('Coração')) {
            extraColumnIndex = j;
            extraColumnName = colunasHeader[j].trim();
            console.log(`📊 Coluna Extra detectada: "${extraColumnName}" (índice ${j})`);
        }
    }
    
    if (dataIndex === -1) {
        dataIndex = 0;
        console.log(`⚠️ Coluna de Data não detectada, usando primeira coluna`);
    }
    
    if (extraColumnIndex === -1 && !isMilionaria) {
        extraColumnIndex = colunasHeader.length - 1;
        extraColumnName = colunasHeader[extraColumnIndex]?.trim() || 'Extra';
        console.log(`⚠️ Coluna extra não detectada, usando última: "${extraColumnName}"`);
    }
    
    const isDiaDeSorte = config.isDiaDeSorte || false;
    const isTimemania = config.isTimemania || false;
    const isLoteca = config.nome === 'Loteca';
    
    for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        if (!linha.trim()) continue;
        
        let colunas = linha.split(sep);
        
        while (colunas.length > 0 && colunas[colunas.length - 1].trim() === '') {
            colunas.pop();
        }
        
        if (colunas.length < 2) continue;
        
        let dataStr = colunas[dataIndex]?.trim() || '';
        let dataFormatada = dataStr;
        if (dataStr.includes('-')) {
            const [a, m, d] = dataStr.split('-');
            dataFormatada = `${d}/${m}/${a}`;
        }
        datas.push(dataFormatada);
        
        let elementoExtra: number | string | null = null;
        const trevosLinha: number[] = [];
        
        // Capturar trevos para +Milionária
        if (isMilionaria && trevoIndices.length >= 2) {
            trevoIndices.forEach(idx => {
                if (idx < colunas.length) {
                    const valor = colunas[idx]?.trim();
                    if (valor) {
                        const num = parseInt(valor);
                        if (!isNaN(num) && num >= 1 && num <= 6) {
                            trevosLinha.push(num);
                        }
                    }
                }
            });
            if (trevosLinha.length === 2) {
                trevos.push(trevosLinha);
                elementoExtra = trevosLinha[0];
            }
        }
        
        // Capturar elementos extras para outras loterias (Timemania, Dia de Sorte)
        if (!isMilionaria && extraColumnIndex < colunas.length) {
            const valor = colunas[extraColumnIndex]?.trim() || '';
            
            if (isDiaDeSorte) {
                const num = parseInt(valor);
                if (!isNaN(num) && num >= 1 && num <= 12) {
                    elementoExtra = num;
                    if (i < 5) console.log(`📅 Mês capturado: ${num} (${MESES_NOME[num]})`);
                }
            } else if (isTimemania) {
                if (valor && valor.length > 0 && isNaN(parseInt(valor))) {
                    elementoExtra = valor;
                    if (i < 5) console.log(`⚽ Time capturado: "${valor}"`);
                }
            }
        }
        
        const numeros: number[] = [];
        const numerosBrutos: number[] = [];
        
        for (let j = 0; j < colunas.length; j++) {
            if (j === dataIndex) continue;
            if (isMilionaria && trevoIndices.includes(j)) continue;
            if (!isMilionaria && j === extraColumnIndex) continue;
            
            let valor = colunas[j]?.trim();
            if (valor === '' || valor === undefined) continue;
            
            if (isLoteca) {
                let num: number | null = null;
                if (valor.includes('Coluna 1') || valor === '1') num = 0;
                else if (valor.includes('Coluna do meio') || valor.includes('Meio') || valor === 'X') num = 1;
                else if (valor.includes('Coluna 2') || valor === '2') num = 2;
                else {
                    const match = valor.match(/\d+/);
                    if (match) num = parseInt(match[0]);
                }
                
                if (num !== null && num >= 0 && num <= 3) {
                    numeros.push(num);
                    numerosBrutos.push(num);
                }
                continue;
            }
            
            let num = parseInt(valor);
            if (isNaN(num)) {
                const match = valor.match(/\d+/);
                if (match) num = parseInt(match[0]);
                else continue;
            }
            
            const min = config.incluirZero ? 0 : 1;
            if (num >= min && num <= config.maxNumero) {
                numeros.push(num);
                numerosBrutos.push(num);
            }
        }
        
        if (config.temElementoExtra && elementoExtra !== null && !isMilionaria) {
            elementosExtras.push(elementoExtra);
        } else if (config.temElementoExtra && !isMilionaria) {
            if (isDiaDeSorte) {
                elementosExtras.push(0);
            } else if (isTimemania) {
                elementosExtras.push('Desconhecido');
            }
        }
        
        if (numeros.length >= config.numerosPadrao) {
            const numerosSorteados = numeros.slice(0, config.numerosPadrao);
            const numerosOrdenados = [...numerosSorteados].sort((a, b) => a - b);
            dados.push(numerosOrdenados);
            
            if (isSuperSete) {
                const numerosBrutosFiltrados = numerosBrutos.slice(0, config.numerosPadrao);
                dadosBrutos.push(numerosBrutosFiltrados);
            }
        }
    }
    
    console.log(`✅ Processado ${dados.length} concursos para ${config.nome}`);
    console.log(`📊 Elementos extras capturados: ${elementosExtras.length}`);
    if (isSuperSete) {
        console.log(`📊 Dados brutos para Super Sete: ${dadosBrutos.length}`);
    }
    if (isMilionaria) {
        console.log(`🍀 Trevos capturados: ${trevos.length}`);
    }
    
    return { dados, datas, elementosExtras, dadosBrutos, trevos };
}

// ============================================
// FUNÇÃO PARA OBTER ÚLTIMA DATA
// ============================================
function obterUltimaData(datas: string[]): Date | null {
    const datasValidas = datas
        .map(dataStr => {
            const partes = dataStr.split('/');
            if (partes.length !== 3) return null;
            const [d, m, a] = partes.map(Number);
            return new Date(a, m - 1, d);
        })
        .filter(d => d !== null && !isNaN(d.getTime())) as Date[];
    
    if (datasValidas.length === 0) return null;
    return new Date(Math.max(...datasValidas.map(d => d.getTime())));
}

// ============================================
// FILTRO POR PERÍODO
// ============================================
function filtrarPorPeriodoComDatas(
    dados: number[][], 
    datas: string[],
    elementosExtras: (number | string)[],
    dadosBrutos: number[][],
    trevos: number[][],
    period: string | number | string[]
): { 
    dadosFiltrados: number[][]; 
    datasFiltradas: string[];
    elementosExtrasFiltrados: (number | string)[];
    dadosBrutosFiltrados: number[][];
    trevosFiltrados: number[][];
    dataInicio: string; 
    dataFim: string 
} {
    let periodValue: string | number;
    if (Array.isArray(period)) {
        periodValue = period[0] || 'all';
    } else {
        periodValue = period;
    }
    
    if (periodValue === 'all' || dados.length === 0 || datas.length === 0) {
        return {
            dadosFiltrados: dados,
            datasFiltradas: datas,
            elementosExtrasFiltrados: elementosExtras,
            dadosBrutosFiltrados: dadosBrutos,
            trevosFiltrados: trevos,
            dataInicio: datas.length > 0 ? datas[0] : '',
            dataFim: datas.length > 0 ? datas[datas.length - 1] : ''
        };
    }
    
    const anos = typeof periodValue === 'number' ? periodValue : parseInt(periodValue as string);
    if (isNaN(anos) || anos <= 0) {
        return {
            dadosFiltrados: dados,
            datasFiltradas: datas,
            elementosExtrasFiltrados: elementosExtras,
            dadosBrutosFiltrados: dadosBrutos,
            trevosFiltrados: trevos,
            dataInicio: datas.length > 0 ? datas[0] : '',
            dataFim: datas.length > 0 ? datas[datas.length - 1] : ''
        };
    }
    
    const ultimaData = obterUltimaData(datas);
    if (!ultimaData) {
        return {
            dadosFiltrados: dados,
            datasFiltradas: datas,
            elementosExtrasFiltrados: elementosExtras,
            dadosBrutosFiltrados: dadosBrutos,
            trevosFiltrados: trevos,
            dataInicio: datas.length > 0 ? datas[0] : '',
            dataFim: datas.length > 0 ? datas[datas.length - 1] : ''
        };
    }
    
    const dataCorte = new Date(
        ultimaData.getFullYear() - anos,
        ultimaData.getMonth(),
        ultimaData.getDate()
    );
    dataCorte.setHours(0, 0, 0, 0);
    
    const dadosFiltrados: number[][] = [];
    const datasFiltradas: string[] = [];
    const elementosExtrasFiltrados: (number | string)[] = [];
    const dadosBrutosFiltrados: number[][] = [];
    const trevosFiltrados: number[][] = [];
    
    for (let i = 0; i < dados.length; i++) {
        const dataStr = datas[i];
        if (!dataStr) continue;
        
        const partes = dataStr.split('/');
        if (partes.length !== 3) continue;
        
        const [d, m, a] = partes.map(Number);
        const dataConcurso = new Date(a, m - 1, d);
        dataConcurso.setHours(0, 0, 0, 0);
        
        if (dataConcurso >= dataCorte) {
            dadosFiltrados.push(dados[i]);
            datasFiltradas.push(dataStr);
            if (elementosExtras && i < elementosExtras.length) {
                elementosExtrasFiltrados.push(elementosExtras[i]);
            }
            if (dadosBrutos && i < dadosBrutos.length) {
                dadosBrutosFiltrados.push(dadosBrutos[i]);
            }
            if (trevos && i < trevos.length) {
                trevosFiltrados.push(trevos[i]);
            }
        }
    }
    
    return {
        dadosFiltrados,
        datasFiltradas,
        elementosExtrasFiltrados,
        dadosBrutosFiltrados,
        trevosFiltrados,
        dataInicio: datasFiltradas.length > 0 ? datasFiltradas[0] : '',
        dataFim: datasFiltradas.length > 0 ? datasFiltradas[datasFiltradas.length - 1] : ''
    };
}

// ============================================
// CÁLCULOS ESTATÍSTICOS - TODOS DINÂMICOS DO CSV
// ============================================
function calcularFrequenciaNumeros(dados: number[][], maxNumero: number, incluirZero: boolean = false) {
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
    for (let i = incluirZero ? 0 : 1; i < limite; i++) {
        resultados.push({ numero: i, quantidade: freq[i] });
    }
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados;
}

function calcularDuplasMaisSorteadas(dados: number[][]) {
    const duplas = new Map<string, number>();
    
    dados.forEach(jogo => {
        for (let i = 0; i < jogo.length; i++) {
            for (let j = i + 1; j < jogo.length; j++) {
                const key = `${Math.min(jogo[i], jogo[j])},${Math.max(jogo[i], jogo[j])}`;
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

function calcularTriplasMaisSorteadas(dados: number[][]) {
    const triplas = new Map<string, number>();
    
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
// CÁLCULOS DINÂMICOS PARA ELEMENTOS EXTRAS
// ============================================
function calcularElementosExtras(
    elementos: (number | string)[],
    tipo: 'time' | 'mes' | 'trevo'
): { nome: string; quantidade: number; id?: number }[] {
    const freq = new Map<string, number>();
    const idMap = new Map<string, number>();
    
    elementos.forEach(el => {
        if (el === null || el === undefined) return;
        if (el === 0 || el === 'Desconhecido' || el === '') return;
        
        let nome: string;
        let id: number | undefined;
        
        if (tipo === 'trevo' && typeof el === 'number') {
            nome = `Trevo ${el}`;
            id = el;
        } else if (tipo === 'mes' && typeof el === 'number') {
            nome = `${MESES_NOME[el] || el} (${el})`;
            id = el;
        } else {
            nome = String(el);
        }
        
        freq.set(nome, (freq.get(nome) || 0) + 1);
        if (id !== undefined) idMap.set(nome, id);
    });
    
    const resultados = Array.from(freq.entries()).map(([nome, quantidade]) => ({
        nome,
        quantidade,
        id: idMap.get(nome)
    }));
    
    resultados.sort((a, b) => b.quantidade - a.quantidade);
    return resultados.slice(0, 20);
}

// ============================================
// CÁLCULOS ESPECÍFICOS PARA TIMEMANIA (DO CSV)
// ============================================
function calcularEstatisticasTimemania(
    dados: number[][],
    elementosExtras: string[],
    datas: string[]
) {
    // 1. Distribuição por dezenas (01-10, 11-20, ...)
    const faixas = [
        { label: '01-10', min: 1, max: 10 },
        { label: '11-20', min: 11, max: 20 },
        { label: '21-30', min: 21, max: 30 },
        { label: '31-40', min: 31, max: 40 },
        { label: '41-50', min: 41, max: 50 },
        { label: '51-60', min: 51, max: 60 },
        { label: '61-70', min: 61, max: 70 },
        { label: '71-80', min: 71, max: 80 }
    ];
    
    const distribuicao = faixas.map(faixa => ({
        ...faixa,
        quantidade: 0
    }));
    
    dados.forEach(jogo => {
        jogo.forEach(num => {
            faixas.forEach((faixa, idx) => {
                if (num >= faixa.min && num <= faixa.max) {
                    distribuicao[idx].quantidade++;
                }
            });
        });
    });
    
    const totalDezenas = distribuicao.reduce((acc, r) => acc + r.quantidade, 0);
    const distribuicaoDezenas = distribuicao.map(r => ({
        ...r,
        percentual: totalDezenas > 0 ? (r.quantidade / totalDezenas) * 100 : 0
    }));
    
    // 2. Pares × Ímpares
    const proporcoes = new Map<string, number>();
    dados.forEach(jogo => {
        let pares = 0, impares = 0;
        jogo.forEach(num => {
            if (num % 2 === 0) pares++;
            else impares++;
        });
        const key = `${pares}x${impares}`;
        proporcoes.set(key, (proporcoes.get(key) || 0) + 1);
    });
    
    const totalJogos = dados.length;
    const paresImpares = Array.from(proporcoes.entries())
        .map(([proporcao, quantidade]) => ({
            proporcao,
            quantidade,
            percentual: totalJogos > 0 ? (quantidade / totalJogos) * 100 : 0
        }))
        .sort((a, b) => b.quantidade - a.quantidade);
    
    // 3. Estatísticas dos Times (TUDO DO CSV)
    const timesValidos = elementosExtras.filter(t => t && t !== 'Desconhecido');
    
    // Frequência dos times
    const freqTimes = new Map<string, number>();
    timesValidos.forEach(t => {
        freqTimes.set(t, (freqTimes.get(t) || 0) + 1);
    });
    
    const rankingTimes = Array.from(freqTimes.entries())
        .map(([time, quantidade]) => ({ time, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);
    
    // Times por estado (extraído do CSV)
    function extrairUF(time: string): string {
        const partes = time.split('/');
        return partes.length > 1 ? partes[1] : 'OUTROS';
    }
    
    const timesPorEstado = new Map<string, { times: string[]; quantidade: number }>();
    rankingTimes.forEach(({ time, quantidade }) => {
        const uf = extrairUF(time);
        if (!timesPorEstado.has(uf)) {
            timesPorEstado.set(uf, { times: [], quantidade: 0 });
        }
        const entry = timesPorEstado.get(uf)!;
        entry.times.push(time);
        entry.quantidade += quantidade;
    });
    
    const estadosRanking = Array.from(timesPorEstado.entries())
        .map(([estado, data]) => ({
            estado,
            times: data.times,
            quantidade: data.quantidade,
            percentual: timesValidos.length > 0 ? (data.quantidade / timesValidos.length) * 100 : 0
        }))
        .sort((a, b) => b.quantidade - a.quantidade);
    
    // Times atrasados
    const ultimaOcorrencia = new Map<string, number>();
    timesValidos.forEach((t, idx) => {
        ultimaOcorrencia.set(t, idx);
    });
    
    const totalConcursos = timesValidos.length;
    const timesAtraso = Array.from(ultimaOcorrencia.entries())
        .map(([time, ultima]) => {
            const concursosAtraso = totalConcursos - 1 - ultima;
            let status = '🟢';
            if (concursosAtraso > 30) status = '🔴';
            else if (concursosAtraso > 15) status = '🟡';
            return {
                time,
                ultimaVez: ultima + 1,
                concursosAtraso,
                status
            };
        })
        .sort((a, b) => b.concursosAtraso - a.concursosAtraso)
        .slice(0, 10);
    
    // Tendência (últimos 30 concursos)
    const ultimos30 = timesValidos.slice(-30);
    const freqUltimos30 = new Map<string, number>();
    ultimos30.forEach(t => {
        freqUltimos30.set(t, (freqUltimos30.get(t) || 0) + 1);
    });
    
    const tendencia = Array.from(freqUltimos30.entries())
        .map(([time, quantidade]) => ({ time, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 8);
    
    // Resumo IA (dinâmico)
    const resumoIA: string[] = [];
    if (rankingTimes.length > 0) {
        const top = rankingTimes[0];
        resumoIA.push(`${top.time} é o time mais frequente (${top.quantidade} ocorrências)`);
    }
    if (rankingTimes.length > 1) {
        const segundo = rankingTimes[1];
        resumoIA.push(`${segundo.time} aparece em segundo lugar (${segundo.quantidade} ocorrências)`);
    }
    if (estadosRanking.length > 0) {
        const topEstado = estadosRanking[0];
        resumoIA.push(`Times do ${topEstado.estado} representam ${topEstado.percentual.toFixed(1)}% dos resultados`);
    }
    if (estadosRanking.length > 1) {
        const segundoEstado = estadosRanking[1];
        resumoIA.push(`Times do ${segundoEstado.estado} aparecem em segundo (${segundoEstado.quantidade} ocorrências)`);
    }
    if (timesAtraso.length > 0 && timesAtraso[0].concursosAtraso > 10) {
        resumoIA.push(`${timesAtraso[0].time} está há ${timesAtraso[0].concursosAtraso} concursos sem aparecer`);
    }
    
    return {
        distribuicaoDezenas,
        paresImpares,
        times: {
            ranking: rankingTimes.slice(0, 20),
            frequencia: rankingTimes.slice(0, 10),
            porEstado: estadosRanking,
            atraso: timesAtraso,
            tendencia
        },
        resumoIA: resumoIA.length > 0 ? resumoIA : ['Análise disponível após mais concursos']
    };
}

// ============================================
// CÁLCULOS ESPECÍFICOS PARA TREVOS (+MILIONÁRIA)
// ============================================
function calcularEstatisticasTrevos(trevos: number[][]) {
    if (!trevos || trevos.length === 0) {
        return {
            frequencia: [],
            pares: [],
            matriz: [],
            atraso: [],
            ranking: [],
            resumoIA: ['Nenhum dado de trevos disponível']
        };
    }
    
    const freq = new Array(7).fill(0);
    trevos.forEach(par => {
        par.forEach(trevo => {
            if (trevo >= 1 && trevo <= 6) freq[trevo]++;
        });
    });
    
    const totalTrevos = trevos.length * 2;
    const frequencia = [];
    for (let i = 1; i <= 6; i++) {
        frequencia.push({
            trevo: i,
            quantidade: freq[i],
            percentual: totalTrevos > 0 ? (freq[i] / totalTrevos) * 100 : 0
        });
    }
    frequencia.sort((a, b) => b.quantidade - a.quantidade);
    
    const paresMap = new Map<string, number>();
    trevos.forEach(par => {
        if (par.length === 2) {
            const key = `${Math.min(par[0], par[1])}-${Math.max(par[0], par[1])}`;
            paresMap.set(key, (paresMap.get(key) || 0) + 1);
        }
    });
    
    const pares = Array.from(paresMap.entries())
        .map(([key, quantidade]) => {
            const [t1, t2] = key.split('-').map(Number);
            return { par: [t1, t2], quantidade };
        })
        .sort((a, b) => b.quantidade - a.quantidade);
    
    const matriz: (number | null)[][] = [];
    for (let i = 1; i <= 6; i++) {
        matriz[i - 1] = [];
        for (let j = 1; j <= 6; j++) {
            if (i === j) {
                matriz[i - 1][j - 1] = null;
            } else {
                const key = `${Math.min(i, j)}-${Math.max(i, j)}`;
                matriz[i - 1][j - 1] = paresMap.get(key) || 0;
            }
        }
    }
    
    const ultimaOcorrencia = new Array(7).fill(-1);
    trevos.forEach((par, index) => {
        par.forEach(trevo => {
            if (trevo >= 1 && trevo <= 6) {
                ultimaOcorrencia[trevo] = index;
            }
        });
    });
    
    const totalConcursos = trevos.length;
    const atraso = [];
    for (let i = 1; i <= 6; i++) {
        const ultima = ultimaOcorrencia[i];
        const concursosAtraso = ultima === -1 ? totalConcursos : (totalConcursos - 1 - ultima);
        let status = '🟢';
        if (concursosAtraso > 20) status = '🔴';
        else if (concursosAtraso > 10) status = '🟡';
        atraso.push({
            trevo: i,
            ultimaVez: ultima === -1 ? 'Nunca' : String(ultima + 1),
            concursosAtraso,
            status
        });
    }
    atraso.sort((a, b) => a.concursosAtraso - b.concursosAtraso);
    
    const ranking = frequencia.map((item, index) => ({
        trevo: item.trevo,
        posicao: index + 1,
        quantidade: item.quantidade
    }));
    
    const resumoIA: string[] = [];
    if (frequencia.length > 0) {
        const top = frequencia[0];
        resumoIA.push(`Trevo ${top.trevo} é o mais frequente (${top.quantidade} ocorrências)`);
    }
    if (frequencia.length > 1) {
        const segundo = frequencia[1];
        resumoIA.push(`Trevo ${segundo.trevo} aparece em segundo (${segundo.quantidade} ocorrências)`);
    }
    if (pares.length > 0) {
        const topPar = pares[0];
        resumoIA.push(`Par ${topPar.par[0]}-${topPar.par[1]} é o mais recorrente (${topPar.quantidade} vezes)`);
    }
    const media = totalTrevos / 6;
    const acimaMedia = frequencia.filter(f => f.quantidade > media);
    if (acimaMedia.length > 0) {
        resumoIA.push(`Trevos ${acimaMedia.map(f => f.trevo).join(', ')} estão acima da média`);
    }
    
    return {
        frequencia,
        pares: pares.slice(0, 10),
        matriz,
        atraso,
        ranking,
        resumoIA
    };
}

// ============================================
// CÁLCULOS PARA LOTECA
// ============================================
function calcularEstatisticasLoteca(dados: number[][]) {
    const freqGlobal = [0, 0, 0];
    const freqPorJogo: { casa: number; empate: number; fora: number }[] = [];
    
    if (dados.length > 0) {
        for (let i = 0; i < dados[0].length; i++) {
            freqPorJogo.push({ casa: 0, empate: 0, fora: 0 });
        }
    }
    
    dados.forEach(jogo => {
        jogo.forEach((resultado, index) => {
            if (resultado === 0) {
                freqGlobal[0]++;
                if (freqPorJogo[index]) freqPorJogo[index].casa++;
            } else if (resultado === 1) {
                freqGlobal[1]++;
                if (freqPorJogo[index]) freqPorJogo[index].empate++;
            } else if (resultado === 2) {
                freqGlobal[2]++;
                if (freqPorJogo[index]) freqPorJogo[index].fora++;
            }
        });
    });
    
    return {
        frequenciaGlobal: [
            { resultado: '🏠 Casa (1)', quantidade: freqGlobal[0] },
            { resultado: '🤝 Empate (X)', quantidade: freqGlobal[1] },
            { resultado: '✈️ Fora (2)', quantidade: freqGlobal[2] }
        ],
        frequenciaPorJogo: freqPorJogo.map((f, i) => ({
            jogo: i + 1,
            casa: f.casa,
            empate: f.empate,
            fora: f.fora,
            total: f.casa + f.empate + f.fora
        }))
    };
}

// ============================================
// HANDLER PRINCIPAL
// ============================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const { lottery, period = 'all' } = req.query;
    
    if (!lottery) return res.status(400).json({ error: 'Loteria é obrigatória' });
    
    const config = LOTTERY_CONFIGS[lottery as string];
    if (!config) return res.status(400).json({ error: 'Loteria inválida' });
    
    try {
        const host = req.headers.host;
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const csvUrl = `${protocol}://${host}/csv/${lottery}.csv`;
        
        console.log(`📥 Buscando CSV: ${csvUrl}`);
        
        const response = await fetch(csvUrl);
        if (!response.ok) {
            console.log(`❌ CSV não encontrado: ${response.status}`);
            return res.status(200).json({
                success: false,
                error: 'CSV não encontrado',
                totalDraws: 0,
                filteredDraws: 0,
                period,
                lottery,
                dataInicio: '',
                dataFim: '',
                maisSorteados: [],
                menosSorteados: [],
                duplas: [],
                triplas: [],
                elementosExtras: [],
                columns: [],
                trevos: null,
                isTimemania: false,
                isMilionaria: false,
                isDiaDeSorte: false
            });
        }
        
        const csvText = await response.text();
        const { dados, datas, elementosExtras, dadosBrutos, trevos } = processarCSV(csvText, config);
        const totalDraws = dados.length;
        
        if (totalDraws === 0) {
            return res.status(200).json({
                success: false,
                error: 'Nenhum dado encontrado no CSV',
                totalDraws: 0,
                filteredDraws: 0,
                period,
                lottery,
                dataInicio: '',
                dataFim: '',
                maisSorteados: [],
                menosSorteados: [],
                duplas: [],
                triplas: [],
                elementosExtras: [],
                columns: [],
                trevos: null,
                isTimemania: false,
                isMilionaria: false,
                isDiaDeSorte: false
            });
        }
        
        const { dadosFiltrados, datasFiltradas, elementosExtrasFiltrados, dadosBrutosFiltrados, trevosFiltrados, dataInicio, dataFim } = 
            filtrarPorPeriodoComDatas(dados, datas, elementosExtras, dadosBrutos, trevos || [], period as string);
        
        const filteredDraws = dadosFiltrados.length;
        
        if (filteredDraws === 0) {
            return res.status(200).json({
                success: true,
                totalDraws,
                filteredDraws: 0,
                period,
                lottery,
                dataInicio: '',
                dataFim: '',
                message: 'Nenhum dado para o período selecionado',
                maisSorteados: [],
                menosSorteados: [],
                duplas: [],
                triplas: [],
                elementosExtras: [],
                columns: [],
                trevos: null,
                isTimemania: false,
                isMilionaria: false,
                isDiaDeSorte: false
            });
        }
        
        // ============================================
        // LOTECA
        // ============================================
        if (config.nome === 'Loteca') {
            const estatisticasLoteca = calcularEstatisticasLoteca(dadosFiltrados);
            const frequencia = calcularFrequenciaNumeros(dadosFiltrados, config.maxNumero, config.incluirZero);
            const maisSorteados = frequencia.slice(0, 20);
            const menosSorteados = [...frequencia].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
            
            return res.status(200).json({
                success: true,
                lottery: lottery as string,
                period: period as string,
                totalDraws,
                filteredDraws,
                dataInicio,
                dataFim,
                maisSorteados,
                menosSorteados,
                duplas: [],
                triplas: [],
                elementosExtras: [],
                columns: [],
                trevos: null,
                isTimemania: false,
                isMilionaria: false,
                isDiaDeSorte: false,
                loteca: estatisticasLoteca
            });
        }
        
        // ============================================
        // TIMEMANIA - TELA ESPECIAL (TUDO DO CSV)
        // ============================================
        if (config.isTimemania) {
            const frequencia = calcularFrequenciaNumeros(dadosFiltrados, config.maxNumero, config.incluirZero);
            const duplas = calcularDuplasMaisSorteadas(dadosFiltrados);
            const triplas = calcularTriplasMaisSorteadas(dadosFiltrados);
            
            const maisSorteados = frequencia.slice(0, 20);
            const menosSorteados = [...frequencia].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
            
            const timemaniaStats = calcularEstatisticasTimemania(
                dadosFiltrados,
                elementosExtrasFiltrados as string[],
                datasFiltradas
            );
            
            return res.status(200).json({
                success: true,
                lottery: lottery as string,
                period: period as string,
                totalDraws,
                filteredDraws,
                dataInicio,
                dataFim,
                maisSorteados,
                menosSorteados,
                duplas: duplas.slice(0, 20),
                triplas: triplas.slice(0, 20),
                elementosExtras: [],
                columns: [],
                trevos: null,
                isTimemania: true,
                isMilionaria: false,
                isDiaDeSorte: false,
                timemania: timemaniaStats
            });
        }
        
        // ============================================
        // +MILIONÁRIA - TELA ESPECIAL (TUDO DO CSV)
        // ============================================
        if (config.isMilionaria) {
            const frequencia = calcularFrequenciaNumeros(dadosFiltrados, config.maxNumero, config.incluirZero);
            const duplas = calcularDuplasMaisSorteadas(dadosFiltrados);
            const triplas = calcularTriplasMaisSorteadas(dadosFiltrados);
            
            const maisSorteados = frequencia.slice(0, 20);
            const menosSorteados = [...frequencia].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
            
            const trevosData = trevosFiltrados && trevosFiltrados.length > 0 
                ? calcularEstatisticasTrevos(trevosFiltrados)
                : {
                    frequencia: [],
                    pares: [],
                    matriz: [],
                    atraso: [],
                    ranking: [],
                    resumoIA: ['Nenhum dado de trevos disponível']
                };
            
            return res.status(200).json({
                success: true,
                lottery: lottery as string,
                period: period as string,
                totalDraws,
                filteredDraws,
                dataInicio,
                dataFim,
                maisSorteados,
                menosSorteados,
                duplas: duplas.slice(0, 20),
                triplas: triplas.slice(0, 20),
                elementosExtras: [],
                columns: [],
                trevos: trevosData,
                isTimemania: false,
                isMilionaria: true,
                isDiaDeSorte: false
            });
        }
        
        // ============================================
        // DIA DE SORTE - ELEMENTO EXTRA (MÊS)
        // ============================================
        if (config.isDiaDeSorte) {
            const frequencia = calcularFrequenciaNumeros(dadosFiltrados, config.maxNumero, config.incluirZero);
            const duplas = calcularDuplasMaisSorteadas(dadosFiltrados);
            const triplas = calcularTriplasMaisSorteadas(dadosFiltrados);
            
            const maisSorteados = frequencia.slice(0, 20);
            const menosSorteados = [...frequencia].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
            
            const elementosExtrasCalculados = calcularElementosExtras(
                elementosExtrasFiltrados,
                'mes'
            );
            
            return res.status(200).json({
                success: true,
                lottery: lottery as string,
                period: period as string,
                totalDraws,
                filteredDraws,
                dataInicio,
                dataFim,
                maisSorteados,
                menosSorteados,
                duplas: duplas.slice(0, 20),
                triplas: triplas.slice(0, 20),
                elementosExtras: elementosExtrasCalculados,
                columns: [],
                trevos: null,
                isTimemania: false,
                isMilionaria: false,
                isDiaDeSorte: true,
                nomeElemento: config.nomeElemento || 'Mês de Sorte'
            });
        }
        
        // ============================================
        // SUPER SETE - TRATAMENTO ESPECIAL
        // ============================================
        if (config.isSuperSete) {
            const columns: number[][] = [[], [], [], [], [], [], []];
            
            const dadosParaColunas = dadosBrutosFiltrados.length > 0 ? dadosBrutosFiltrados : dadosFiltrados;
            
            dadosParaColunas.forEach(jogo => {
                for (let i = 0; i < Math.min(jogo.length, 7); i++) {
                    if (i < columns.length) {
                        columns[i].push(jogo[i]);
                    }
                }
            });
            
            const freqGlobal = new Array(10).fill(0);
            dadosFiltrados.forEach(jogo => {
                jogo.forEach(num => {
                    if (num >= 0 && num <= 9) freqGlobal[num]++;
                });
            });
            
            const duplas = calcularDuplasMaisSorteadas(dadosFiltrados);
            const triplas = calcularTriplasMaisSorteadas(dadosFiltrados);
            
            return res.status(200).json({
                success: true,
                lottery: lottery as string,
                period: period as string,
                totalDraws,
                filteredDraws,
                dataInicio,
                dataFim,
                columns: columns,
                frequenciaGlobal: freqGlobal.map((qtd, num) => ({ numero: num, quantidade: qtd })),
                duplas: duplas.slice(0, 20),
                triplas: triplas.slice(0, 20),
                maisSorteados: [],
                menosSorteados: [],
                elementosExtras: [],
                trevos: null,
                isTimemania: false,
                isMilionaria: false,
                isDiaDeSorte: false
            });
        }
        
        // ============================================
        // OUTRAS LOTERIAS (MEGA-SENA, QUINA, ETC)
        // ============================================
        const frequencia = calcularFrequenciaNumeros(dadosFiltrados, config.maxNumero, config.incluirZero);
        const duplas = calcularDuplasMaisSorteadas(dadosFiltrados);
        const triplas = calcularTriplasMaisSorteadas(dadosFiltrados);
        
        const maisSorteados = frequencia.slice(0, 20);
        const menosSorteados = [...frequencia].sort((a, b) => a.quantidade - b.quantidade).slice(0, 20);
        
        return res.status(200).json({
            success: true,
            lottery: lottery as string,
            period: period as string,
            totalDraws,
            filteredDraws,
            dataInicio,
            dataFim,
            maisSorteados,
            menosSorteados,
            duplas: duplas.slice(0, 20),
            triplas: triplas.slice(0, 20),
            elementosExtras: [],
            columns: [],
            trevos: null,
            isTimemania: false,
            isMilionaria: false,
            isDiaDeSorte: false
        });
        
    } catch (error: any) {
        console.error('❌ Erro:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro interno do servidor',
            lottery: lottery as string,
            period: period as string,
            totalDraws: 0,
            filteredDraws: 0,
            dataInicio: '',
            dataFim: '',
            maisSorteados: [],
            menosSorteados: [],
            duplas: [],
            triplas: [],
            elementosExtras: [],
            columns: [],
            trevos: null,
            isTimemania: false,
            isMilionaria: false,
            isDiaDeSorte: false
        });
    }
}
