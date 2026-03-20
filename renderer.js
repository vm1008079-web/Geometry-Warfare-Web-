console.log('Renderer.js cargando...');

class Renderer {
    constructor() {
        this.ctx = ctx;
    }

    clear() {
        this.ctx.fillStyle = 'rgba(5, 5, 8, 1)';
        this.ctx.fillRect(0, 0, state.width, state.height);
    }

    applyCamera() {
        this.ctx.save();
        if(state.shake > 0) {
            this.ctx.translate(
                (Math.random()-0.5)*state.shake, 
                (Math.random()-0.5)*state.shake
            );
        }
        this.ctx.translate(-state.camera.x, -state.camera.y);
    }

    restoreCamera() {
        this.ctx.restore();
    }

    drawWorld() {
        const currentRadius = WORLD.radius * (1 - WORLD.shrinkLevel * 0.1);
        
        const gradient = this.ctx.createRadialGradient(
            WORLD.centerX, WORLD.centerY, 0,
            WORLD.centerX, WORLD.centerY, currentRadius
        );
        gradient.addColorStop(0, 'rgba(20, 10, 40, 0.8)');
        gradient.addColorStop(0.7, 'rgba(10, 5, 20, 0.9)');
        gradient.addColorStop(1, 'rgba(5, 5, 8, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(WORLD.centerX, WORLD.centerY, currentRadius, 0, Math.PI * 2);
        this.ctx.fill();

        const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.1;
        let borderColor = '#00f3ff';
        if(state.furyMode) borderColor = '#ff0000';
        else if(state.darkness) borderColor = '#440044';
        
        this.ctx.shadowBlur = 30 * pulse;
        this.ctx.shadowColor = borderColor;
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(WORLD.centerX, WORLD.centerY, currentRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(WORLD.centerX, WORLD.centerY, currentRadius - 5, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
    }

    drawPowerUps() {
        powerUps.forEach(p => {
            const pulse = Math.sin(p.pulse) * 3;
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = p.color;
            
            this.ctx.strokeStyle = p.color;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size + pulse, 0, Math.PI*2);
            this.ctx.stroke();
            
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = 0.3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size * 0.6, 0, Math.PI*2);
            this.ctx.fill();
            
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(p.type === 'shield' ? 'S' : '⚡', 0, 1);
            
            this.ctx.restore();
        });
        this.ctx.shadowBlur = 0;
    }

    drawParticles() {
        particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }

    drawBullets() {
        this.ctx.strokeStyle = state.furyMode ? '#ff0000' : '#ffeb3b';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        
        bullets.forEach(b => {
            this.ctx.beginPath();
            this.ctx.moveTo(b.x - b.vx*0.5, b.y - b.vy*0.5);
            this.ctx.lineTo(b.x + b.vx*0.5, b.y + b.vy*0.5);
            this.ctx.stroke();
        });
        
        enemyBullets.forEach(b => {
            this.ctx.fillStyle = b.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = b.color;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.size, 0, Math.PI*2);
            this.ctx.fill();
        });
        this.ctx.shadowBlur = 0;
    }

    drawEnemies() {
        enemies.forEach(e => {
            const hpPct = e.health / e.maxHealth;
            const barW = e.isBoss ? 100 : 25;
            
            if(e.isBoss) {
                this.ctx.fillStyle = 'rgba(0,0,0,0.9)';
                this.ctx.fillRect(e.x - barW/2, e.y - e.size - 25, barW, 10);
                
                let hpColor = '#0f0';
                if(hpPct < 0.5) hpColor = '#ff0';
                if(hpPct < 0.25) hpColor = '#f00';
                
                this.ctx.fillStyle = hpColor;
                this.ctx.fillRect(e.x - barW/2, e.y - e.size - 25, barW * hpPct, 10);
                
                if(e.furyMode) {
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.font = 'bold 12px monospace';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('FURY!', e.x, e.y - e.size - 30);
                }
                
                if(e.stunned > 0) {
                    this.ctx.fillStyle = '#ffd700';
                    this.ctx.font = 'bold 14px monospace';
                    this.ctx.fillText('STUNNED!', e.x, e.y - e.size - 45);
                }
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '10px monospace';
                this.ctx.fillText(e.type.toUpperCase(), e.x, e.y - e.size - 35);
            } else {
                this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
                this.ctx.fillRect(e.x - barW/2, e.y - e.size - 12, barW, 5);
                this.ctx.fillStyle = hpPct > 0.5 ? '#0f0' : '#f00';
                this.ctx.fillRect(e.x - barW/2, e.y - e.size - 12, barW * hpPct, 5);
            }

            if(e.isBoss) {
                this.drawBoss(e);
            } else {
                this.drawRegularEnemy(e);
            }
        });
    }

    drawBoss(e) {
        this.ctx.save();
        this.ctx.translate(e.x, e.y);
        
        if(e.stunned > 0 && e.isStunnedVisual) {
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, e.size + 10, 0, Math.PI*2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
        
        if(e.bossType === BOSS_TYPES.SENTINEL) {
            this.ctx.rotate(e.rotation || 0);
            this.ctx.strokeStyle = e.furyMode ? '#ff0000' : e.color;
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = e.furyMode ? '#ff0000' : e.color;
            
            this.ctx.beginPath();
            for(let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                const x = Math.cos(angle) * e.size;
                const y = Math.sin(angle) * e.size;
                if(i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            
            this.ctx.fillStyle = e.furyMode ? 'rgba(255,0,0,0.3)' : 'rgba(255,215,0,0.2)';
            this.ctx.fill();
            
            if(e.shields) {
                e.shields.forEach(s => {
                    const sx = Math.cos(s.angle) * (e.size + 20);
                    const sy = Math.sin(s.angle) * (e.size + 20);
                    this.ctx.fillStyle = '#ffd700';
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = '#ffd700';
                    this.ctx.beginPath();
                    this.ctx.arc(sx, sy, 10, 0, Math.PI*2);
                    this.ctx.fill();
                });
            }
            
        } else if(e.bossType === BOSS_TYPES.HIVE) {
            this.ctx.rotate(e.rotation || 0);
            this.ctx.strokeStyle = e.furyMode ? '#ff0000' : e.color;
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = e.furyMode ? '#ff0000' : e.color;
            
            this.ctx.beginPath();
            for(let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i;
                const x = Math.cos(angle) * e.size;
                const y = Math.sin(angle) * e.size;
                if(i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
            
            const corePulse = 1 + Math.sin(Date.now() * 0.01) * 0.3;
            this.ctx.fillStyle = e.furyMode ? '#ff0000' : '#ff00ff';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, e.size * 0.4 * corePulse, 0, Math.PI*2);
            this.ctx.fill();
            
            if(e.isChargingBeam) {
                this.ctx.strokeStyle = '#ff0000';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, e.size + 10, 0, Math.PI*2);
                this.ctx.stroke();
            }
            
        } else if(e.bossType === BOSS_TYPES.CHAOS) {
            const sizePulse = e.pulseSize ? (1 + Math.sin(e.pulseSize) * 0.2) : 1;
            this.ctx.rotate((e.rotation || 0) + Math.PI);
            this.ctx.strokeStyle = e.furyMode ? '#ffff00' : e.color;
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = e.furyMode ? '#ffff00' : e.color;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -e.size * sizePulse);
            this.ctx.lineTo(e.size * sizePulse, e.size * sizePulse);
            this.ctx.lineTo(-e.size * sizePulse, e.size * sizePulse);
            this.ctx.closePath();
            this.ctx.stroke();
            
            this.ctx.fillStyle = e.furyMode ? 'rgba(255,255,0,0.3)' : 'rgba(255,0,85,0.2)';
            this.ctx.fill();
        }
        
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
    }

    drawRegularEnemy(e) {
        if(e.stunned > 0 && e.isStunnedVisual) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, e.size + 5, 0, Math.PI*2);
            this.ctx.fill();
        }
        
        const pulse = Math.sin(e.pulse || 0) * 2;
        this.ctx.fillStyle = e.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = e.color;
        
        this.ctx.beginPath();
        this.ctx.arc(e.x, e.y, e.size + (pulse > 0 ? pulse : 0), 0, Math.PI*2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(e.x, e.y, e.size*0.4, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawPlayer() {
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        
        if(state.darkness) {
            this.ctx.restore();
            this.ctx.save();
            const grad = this.ctx.createRadialGradient(
                player.x, player.y, 50,
                player.x, player.y, 250
            );
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.95)');
            
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(
                state.camera.x, state.camera.y,
                state.width, state.height
            );
            this.ctx.restore();
            this.ctx.save();
            this.ctx.translate(player.x, player.y);
        }
        
        if(state.overcharge) {
            const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
            
            this.ctx.strokeStyle = state.overchargeActive ? '#ffd700' : '#ff5555';
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = state.overchargeActive ? '#ffd700' : '#ff5555';
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, player.size + 20 * pulse, 0, Math.PI*2);
            this.ctx.stroke();
            
            if(!state.overchargeActive && state.overchargeCooldown > 0) {
                const cooldownPct = 1 - (state.overchargeCooldown / state.overchargeMaxCooldown);
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.lineWidth = 5;
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#00ff00';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, player.size + 28, -Math.PI/2, -Math.PI/2 + (Math.PI*2 * cooldownPct));
                this.ctx.stroke();
                
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = 'bold 10px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('READY', 0, -player.size - 35);
            }
            
            if(state.overchargeActive) {
                for(let i = 0; i < 4; i++) {
                    const angle = (Date.now() * 0.008) + (i * Math.PI / 2);
                    const px = Math.cos(angle) * (player.size + 25);
                    const py = Math.sin(angle) * (player.size + 25);
                    this.ctx.fillStyle = '#ffd700';
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = '#ffd700';
                    this.ctx.beginPath();
                    this.ctx.arc(px, py, 4, 0, Math.PI*2);
                    this.ctx.fill();
                }
            }
            
            if(state.overchargeActive && Math.floor(Date.now() / 200) % 2 === 0) {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.globalAlpha = 0.5;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, player.size + 30, 0, Math.PI*2);
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            }
        }
        
        if(state.speedBoost || state.furyMode) {
            this.ctx.strokeStyle = state.furyMode ? '#ff0000' : 'rgba(0, 243, 255, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = state.furyMode ? '#ff0000' : '#00f3ff';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, player.size + 12, 0, Math.PI*2);
            this.ctx.stroke();
        }
        
        if(state.invertedControls) {
            this.ctx.strokeStyle = '#ff00ff';
            this.ctx.setLineDash([5, 5]);
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, player.size + 20, 0, Math.PI*2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
        
        this.ctx.rotate(player.angle);

        if(input.move.active) {
            this.ctx.fillStyle = state.furyMode ? 'rgba(255,0,0,0.6)' : 'rgba(0, 243, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.moveTo(-player.size-5, 0);
            this.ctx.lineTo(-player.size-12, -4);
            this.ctx.lineTo(-player.size-12, 4);
            this.ctx.fill();
        }

        this.ctx.fillStyle = '#000';
        this.ctx.strokeStyle = state.overcharge ? '#ffd700' : (state.furyMode ? '#ff0000' : '#00f3ff');
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = state.overcharge ? '#ffd700' : (state.furyMode ? '#ff0000' : '#00f3ff');
        
        this.ctx.beginPath();
        this.ctx.moveTo(player.size, 0);
        this.ctx.lineTo(-player.size*0.6, player.size*0.7);
        this.ctx.lineTo(-player.size*0.6, -player.size*0.7);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = state.overcharge ? '#ffd700' : (state.furyMode ? '#ff0000' : '#00f3ff');
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI*2);
        this.ctx.fill();
        
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
    }

    drawTexts() {
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 12px monospace';
        
        texts.forEach(t => {
            this.ctx.globalAlpha = Math.max(0, t.life);
            this.ctx.fillStyle = t.color;
            this.ctx.fillText(t.text, t.x, t.y);
        });
        this.ctx.globalAlpha = 1;
    }

    render() {
        if(!this.ctx) {
            console.error('No hay contexto de canvas');
            return;
        }
        
        this.clear();
        this.applyCamera();
        this.drawWorld();
        this.drawPowerUps();
        this.drawParticles();
        this.drawBullets();
        this.drawEnemies();
        this.drawPlayer();
        this.drawTexts();
        this.restoreCamera();
    }
}

console.log('Renderer.js cargado correctamente');