// ============================================
// Utilitários de formatação
// ============================================

export const formatTwoDigits = (num: number): string => {
    return String(num).padStart(2, '0');
};

export const formatNumbers = (numbers: number[]): string => {
    return numbers.map(n => formatTwoDigits(n)).join(', ');
};

export const formatMoney = (value: number): string => {
    return `R$ ${value.toFixed(2)}`;
};

export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
};

export const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('pt-BR');
};

export const formatCompactNumber = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return String(value);
};

export const maskConfig = (texto: string | null | undefined): string => {
    if (!texto) return '🔒 Disponível no plano PRO';
    if (typeof texto === 'string' && texto.length > 10) {
        return '🔒 ' + texto.substring(0, 6) + '...';
    }
    return '🔒 Ative o PRO para ver';
};
