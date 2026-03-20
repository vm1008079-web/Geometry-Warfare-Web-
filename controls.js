console.log('Controls.js cargando...');

class InputManager {
    constructor() {
        this.moveTouchId = null;
        this.fireTouchId = null;
        this.isDesktop = this.checkIfDesktop();
        
        // Estado para teclado
        this.keys = {
            'w': false, 'a': false, 's': false, 'd': false,
            'W': false, 'A': false, 'S': false, 'D': false
        };
        
        // Estado para mouse
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButton = false;
        this.rightButtonPressed = false;
        
        if (this.isDesktop) {
            this.setupDesktopControls();
        } else {
            this.setupMobileControls();
        }
    }
    
    checkIfDesktop() {
        // Detectar si es PC/escritorio
        const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
        const hasHover = window.matchMedia('(hover: hover)').matches;
        const isTouch = 'ontouchstart' in window;
        const width = window.innerWidth;
        
        // Consideramos desktop si: no es táctil, o tiene mouse, o es pantalla grande
        return (hasFinePointer && hasHover && !isTouch) || width > 1024;
    }
    
    setupDesktopControls() {
        console.log('Modo PC detectado - activando controles de teclado y mouse');
        
        const canvas = document.getElementById('gameCanvas');
        canvas.focus();
        
        // Prevenir menú contextual del click derecho
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Eventos de teclado
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
                this.keys[key] = true;
                this.keys[key.toUpperCase()] = true;
            }
            // Tecla R para recargar
            if (key === 'r' && !state.isReloading && !state.infiniteAmmo) {
                e.preventDefault();
                if (window.game) window.game.reload();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
                this.keys[key] = false;
                this.keys[key.toUpperCase()] = false;
            }
        });
        
        // Eventos de mouse
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            // Obtener posición en coordenadas del canvas
            const canvasX = (e.clientX - rect.left) * scaleX;
            const canvasY = (e.clientY - rect.top) * scaleY;
            
            // Convertir a coordenadas del mundo
            this.mousePosition.x = canvasX + state.camera.x;
            this.mousePosition.y = canvasY + state.camera.y;
        });
        
        canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            
            if (e.button === 2) { // Click derecho
                this.rightButtonPressed = true;
                canvas.style.cursor = 'grabbing';
            } else if (e.button === 0) { // Click izquierdo
                this.mouseButton = true;
            }
        });
        
        window.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.rightButtonPressed = false;
                canvas.style.cursor = 'crosshair';
            } else if (e.button === 0) {
                this.mouseButton = false;
            }
        });
        
        // Perder foco del canvas
        window.addEventListener('blur', () => {
            // Resetear todas las teclas
            for (let key in this.keys) {
                this.keys[key] = false;
            }
        });
    }
    
    setupMobileControls() {
        console.log('Modo móvil detectado - activando joysticks táctiles');
        this.setupMoveJoystick();
        this.setupFireJoystick();
    }

    setupMoveJoystick() {
        const zone = document.getElementById('joystickZone');
        const stick = document.getElementById('joystickStick');
        if(!zone || !stick) return;
        
        this.setupJoystickGeneric(zone, stick, input.move, 'move');
    }

    setupFireJoystick() {
        const zone = document.getElementById('fireJoystickZone');
        const stick = document.getElementById('fireJoystickStick');
        if(!zone || !stick) return;
        
        this.setupJoystickGeneric(zone, stick, input.fire, 'fire');
    }

    setupJoystickGeneric(zone, stick, targetInput, type) {
        const maxDist = 35;
        let joyCenter = { x: 0, y: 0 };

        const getPos = (e) => {
            const t = e.touches ? e.touches[0] : e;
            return { x: t.clientX, y: t.clientY };
        };

        const handleStart = (e) => {
            e.preventDefault();
            
            const t = e.touches ? e.changedTouches[0] : e;
            
            if(e.touches) {
                if(type === 'move') this.moveTouchId = t.identifier;
                else this.fireTouchId = t.identifier;
            }

            const rect = zone.getBoundingClientRect();
            joyCenter.x = rect.left + rect.width / 2;
            joyCenter.y = rect.top + rect.height / 2;
            
            targetInput.active = true;
            this.updateJoystick(t.clientX, t.clientY, targetInput, stick, maxDist, joyCenter, type);
        };

        const handleMove = (e) => {
            e.preventDefault();
            if(!targetInput.active) return;

            let t = null;
            
            if(e.touches) {
                const targetId = type === 'move' ? this.moveTouchId : this.fireTouchId;
                for(let i = 0; i < e.touches.length; i++) {
                    if(e.touches[i].identifier === targetId) {
                        t = e.touches[i];
                        break;
                    }
                }
            } else {
                t = e;
            }

            if(t) {
                this.updateJoystick(t.clientX, t.clientY, targetInput, stick, maxDist, joyCenter, type);
            }
        };

        const handleEnd = (e) => {
            e.preventDefault();
            
            if(e.changedTouches && e.changedTouches.length > 0) {
                const endedTouch = e.changedTouches[0];
                const targetId = type === 'move' ? this.moveTouchId : this.fireTouchId;
                
                if(endedTouch.identifier !== targetId) return;
                
                if(type === 'move') this.moveTouchId = null;
                else this.fireTouchId = null;
            }

            targetInput.active = false;
            targetInput.x = 0;
            targetInput.y = 0;
            if(type === 'fire') targetInput.angle = 0;
            stick.style.transform = `translate(-50%, -50%)`;
        };

        zone.addEventListener('touchstart', handleStart, {passive:false});
        zone.addEventListener('touchmove', handleMove, {passive:false});
        zone.addEventListener('touchend', handleEnd);
        zone.addEventListener('touchcancel', handleEnd);

        zone.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', (e) => {
            if(targetInput.active) handleMove(e);
        });
        window.addEventListener('mouseup', (e) => {
            if(targetInput.active) handleEnd(e);
        });
    }
    
    updateJoystick(clientX, clientY, targetInput, stick, maxDist, joyCenter, type) {
        const dx = clientX - joyCenter.x;
        const dy = clientY - joyCenter.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        let clampedDist = Math.min(distance, maxDist);
        const angle = Math.atan2(dy, dx);
        
        targetInput.x = (Math.cos(angle) * clampedDist) / maxDist;
        targetInput.y = (Math.sin(angle) * clampedDist) / maxDist;
        
        if(type === 'fire') {
            targetInput.angle = angle;
        }

        stick.style.transform = `translate(calc(-50% + ${Math.cos(angle)*clampedDist}px), calc(-50% + ${Math.sin(angle)*clampedDist}px))`;
    }
    
    // Método para obtener el movimiento del teclado
    getKeyboardMovement() {
        let moveX = 0;
        let moveY = 0;
        
        if (this.keys['w'] || this.keys['W']) moveY -= 1;
        if (this.keys['s'] || this.keys['S']) moveY += 1;
        if (this.keys['a'] || this.keys['A']) moveX -= 1;
        if (this.keys['d'] || this.keys['D']) moveX += 1;
        
        // Normalizar si hay diagonal
        if (moveX !== 0 && moveY !== 0) {
            const len = Math.sqrt(moveX*moveX + moveY*moveY);
            moveX /= len;
            moveY /= len;
        }
        
        return { x: moveX, y: moveY, active: moveX !== 0 || moveY !== 0 };
    }
    
    // Método para obtener el ángulo de disparo del mouse
    getMouseAngle() {
        const dx = this.mousePosition.x - player.x;
        const dy = this.mousePosition.y - player.y;
        return Math.atan2(dy, dx);
    }

    setupRestart(callback) {
        if(ui.restartBtn) {
            ui.restartBtn.addEventListener('click', callback);
            ui.restartBtn.addEventListener('touchstart', (e) => { 
                e.preventDefault(); 
                callback(); 
            });
        }
    }
}

console.log('Controls.js cargado correctamente');