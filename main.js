console.log('Main.js cargando...');

window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM listo, iniciando...');
    try {
        const game = new Game();
        game.init();
        
        // Enfocar el canvas para capturar eventos de teclado inmediatamente
        const canvas = document.getElementById('gameCanvas');
        canvas.focus();
        
    } catch(e) {
        console.error('Error al iniciar el juego:', e);
    }
});