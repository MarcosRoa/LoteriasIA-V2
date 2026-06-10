// js/utils.js - Funções auxiliares (V2.0)
function mostrarToast(mensagem, tipo = 'success') {
    console.log('📢 Toast:', mensagem, tipo);
    
    const oldToasts = document.querySelectorAll('.toast-custom');
    oldToasts.forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = 'toast-custom';
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: ${tipo === 'success' ? '#22c55e' : tipo === 'warning' ? '#f59e0b' : '#ef4444'};
        color: white; padding: 12px 20px; border-radius: 8px;
        z-index: 9999; font-size: 13px; font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
    `;
    toast.innerHTML = mensagem;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function toggleTema() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('tema', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

function carregarTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'light') document.body.classList.add('light-mode');
}

function atualizarQuantidadePorRange(valor) {
    const qtdJogos = document.getElementById('qtdJogos');
    const qtdRange = document.getElementById('qtdRange');
    if (qtdJogos) qtdJogos.value = valor;
    if (qtdRange) qtdRange.value = valor;
}

function atualizarQuantidadePorInput(valor) {
    const qtdRange = document.getElementById('qtdRange');
    if (qtdRange) qtdRange.value = valor;
}

function getModoTexto(modo) {
    const modos = {
        'ia_especialista': '🎓 IA Especialista',
        'aleatorio_inteligente': '🎲 Aleatório Inteligente',
        'probabilistico': '📊 Probabilístico',
        'aleatorio_puro': '🎯 Aleatório Puro'
    };
    return modos[modo] || modo;
}

window.mostrarToast = mostrarToast;
window.toggleTema = toggleTema;
window.carregarTema = carregarTema;
window.atualizarQuantidadePorRange = atualizarQuantidadePorRange;
window.atualizarQuantidadePorInput = atualizarQuantidadePorInput;
window.getModoTexto = getModoTexto;

console.log('✅ UTILS.js carregado (V2.0)');
