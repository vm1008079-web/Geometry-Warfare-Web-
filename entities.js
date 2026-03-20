console.log('Entities.js cargando...');

class EnemyFactory {
    static createBasic(x, y, waveMult, wave) {
        const speedMult = 1 + (wave * 0.08);
        return {
            x, y,
            vx: 0, vy: 0,
            type: 'basic',
            size: 12,
            speed: 2 * speedMult,
            health: 30 * waveMult,
            maxHealth: 30 * waveMult,
            damage: 10,
            color: '#ff0055',
            score: 100 * wave,
            pulse: 0,
            isBoss: false,
            stunned: 0
        };
    }

    static createTank(x, y, waveMult, wave) {
        const speedMult = 1 + (wave * 0.08);
        return {
            x, y,
            vx: 0, vy: 0,
            type: 'tank',
            size: 20,
            speed: 0.5 * speedMult,
            health: 80 * waveMult,
            maxHealth: 80 * waveMult,
            damage: 15,
            color: '#ff8800',
            score: 200 * wave,
            pulse: 0,
            isBoss: false,
            stunned: 0
        };
    }

    static createFast(x, y, waveMult, wave) {
        const speedMult = 1 + (wave * 0.08);
        return {
            x, y,
            vx: 0, vy: 0,
            type: 'fast',
            size: 9,
            speed: 3.5 * speedMult,
            health: 8 * waveMult,
            maxHealth: 8 * waveMult,
            damage: 8,
            color: '#ff00ff',
            score: 150 * wave,
            pulse: 0,
            isBoss: false,
            stunned: 0
        };
    }

    static createSentinel(x, y, waveMult, wave) {
        const isPlus = wave >= 10 && wave < 35;
        const isPlusPlus = wave >= 35;
        
        return {
            x, y,
            vx: 0, vy: 0,
            type: 'sentinel',
            size: 45,
            speed: 1.2,
            health: 3600 * waveMult * (isPlusPlus ? 1.5 : 1),
            maxHealth: 3600 * waveMult * (isPlusPlus ? 1.5 : 1),
            damage: 25,
            color: '#ffd700',
            score: 5000 * wave,
            rotation: 0,
            isBoss: true,
            bossType: BOSS_TYPES.SENTINEL,
            lastNova: 0,
            novaInterval: isPlusPlus ? 2500 : (isPlus ? 3000 : 4000),
            lastChase: 0,
            chaseInterval: 1500,
            shields: [],
            shieldCount: isPlusPlus ? 6 : (isPlus ? 5 : 4),
            furyMode: false,
            isPlus: isPlus,
            isPlusPlus: isPlusPlus,
            stunned: 0
        };
    }

    static createHive(x, y, waveMult, wave) {
        const isPlus = wave >= 20 && wave < 40;
        const isPlusPlus = wave >= 40;
        
        return {
            x, y,
            vx: 0, vy: 0,
            type: 'hive',
            size: 50,
            speed: 0.8,
            health: 3000 * waveMult * (isPlusPlus ? 1.5 : 1),
            maxHealth: 3000 * waveMult * (isPlusPlus ? 1.5 : 1),
            damage: 25,
            color: '#bc13fe',
            score: 4500 * wave,
            rotation: 0,
            isBoss: true,
            bossType: BOSS_TYPES.HIVE,
            lastSwarm: 0,
            swarmInterval: isPlusPlus ? 3000 : (isPlus ? 4000 : 5000),
            lastSpawn: 0,
            spawnInterval: 8000,
            spawnCount: isPlusPlus ? 4 : (isPlus ? 3 : 2),
            spiralAngle: 0,
            furyMode: false,
            isPlus: isPlus,
            isPlusPlus: isPlusPlus,
            lastBeam: 0,
            beamInterval: 6000,
            isChargingBeam: false,
            beamChargeStart: 0,
            stunned: 0
        };
    }

    static createChaos(x, y, waveMult, wave) {
        const isPlus = wave >= 30 && wave < 50;
        const isPlusPlus = wave >= 50;
        
        return {
            x, y,
            vx: 0, vy: 0,
            type: 'chaos',
            size: 40,
            speed: 2.5,
            health: 2400 * waveMult * (isPlusPlus ? 2 : 1),
            maxHealth: 2400 * waveMult * (isPlusPlus ? 2 : 1),
            damage: 25,
            color: '#ff0055',
            score: 6000 * wave,
            rotation: 0,
            isBoss: true,
            bossType: BOSS_TYPES.CHAOS,
            lastChaos: 0,
            chaosInterval: isPlusPlus ? 1500 : (isPlus ? 2000 : 3000),
            lastTeleport: 0,
            teleportInterval: isPlusPlus ? 1500 : (isPlus ? 2000 : 3000),
            furyMode: false,
            isPlus: isPlus,
            isPlusPlus: isPlusPlus,
            lastInvert: 0,
            invertInterval: 8000,
            isInverting: false,
            stunned: 0
        };
    }

    static spawnEnemy(x, y, wave, isBoss = false) {
        const waveMult = 1 + (wave * 0.15);
        
        if(isBoss) {
            const bossCycle = Math.floor((wave - 1) / 5);
            
            if(bossCycle === 0 || bossCycle === 1) return this.createSentinel(x, y, waveMult, wave);
            if(bossCycle === 2 || bossCycle === 3) return this.createHive(x, y, waveMult, wave);
            if(bossCycle === 4 || bossCycle === 5) return this.createChaos(x, y, waveMult, wave);
            if(bossCycle === 6) return this.createSentinel(x, y, waveMult, wave);
            if(bossCycle === 7) return this.createHive(x, y, waveMult, wave);
            if(bossCycle === 8) return this.createChaos(x, y, waveMult, wave);
            if(bossCycle >= 9) return this.createChaos(x, y, waveMult, wave);
        }
        
        const roll = Math.random();
        if(wave >= 15 && roll < 0.2) return this.createFast(x, y, waveMult, wave);
        if(wave >= 8 && roll < 0.3) return this.createTank(x, y, waveMult, wave);
        return this.createBasic(x, y, waveMult, wave);
    }
}

class BossAttackSystem {
    static update(boss, player) {
        const now = Date.now();
        
        if(boss.stunned > 0) return;
        
        if(!boss.furyMode && boss.health < boss.maxHealth * 0.25) {
            boss.furyMode = true;
            boss.speed *= 1.5;
            FXSystem.createText(boss.x, boss.y - 60, '¡FURIA!', '#ff0000');
            FXSystem.createExplosion(boss.x, boss.y, '#ff0000', 15, 2);
        }
        
        const intervalMult = boss.furyMode ? 0.5 : 1;
        
        if(boss.bossType === BOSS_TYPES.SENTINEL) {
            this.updateSentinel(boss, player, now, intervalMult);
        } else if(boss.bossType === BOSS_TYPES.HIVE) {
            this.updateHive(boss, player, now, intervalMult);
        } else if(boss.bossType === BOSS_TYPES.CHAOS) {
            this.updateChaos(boss, player, now, intervalMult);
        }
    }
    
    static updateSentinel(boss, player, now, intervalMult) {
        boss.rotation += 0.02 * (boss.furyMode ? 2 : 1);
        
        if(now - boss.lastNova > boss.novaInterval * intervalMult) {
            boss.lastNova = now;
            
            if(boss.isPlus) {
                this.fireNova(boss, 8, 0);
                setTimeout(() => this.fireNova(boss, 8, Math.PI/8), 200);
            } else {
                this.fireNova(boss, 16, 0);
            }
            
            FXSystem.createText(boss.x, boss.y - 80, boss.isPlusPlus ? 'NOVA MAX' : 'NOVA', '#ffd700');
        }
        
        if(now - boss.lastChase > boss.chaseInterval * intervalMult) {
            boss.lastChase = now;
            this.fireChase(boss, player, boss.isPlusPlus ? 5 : 3);
        }
        
        this.updateShields(boss);
    }
    
    static updateHive(boss, player, now, intervalMult) {
        boss.rotation += 0.01;
        boss.spiralAngle += 0.15;
        
        if(now - boss.lastSwarm > boss.swarmInterval * intervalMult) {
            boss.lastSwarm = now;
            
            if(boss.isPlus) {
                for(let i = 0; i < 12; i++) {
                    const angle1 = boss.spiralAngle + (Math.PI * 2 / 12) * i;
                    const angle2 = -boss.spiralAngle + (Math.PI * 2 / 12) * i;
                    this.createEnemyBullet(boss.x, boss.y, angle1, 4 + i * 0.4, '#bc13fe');
                    this.createEnemyBullet(boss.x, boss.y, angle2, 4 + i * 0.4, '#ff00ff');
                }
            } else {
                this.fireSwarm(boss, 12);
            }
            
            FXSystem.createText(boss.x, boss.y - 80, boss.isPlusPlus ? 'ENJAMBRE TOTAL' : 'ENJAMBRE', '#bc13fe');
        }
        
        if(now - boss.lastSpawn > boss.spawnInterval * intervalMult) {
            boss.lastSpawn = now;
            this.spawnMinions(boss, boss.spawnCount);
            FXSystem.createText(boss.x, boss.y - 60, `SPAWN x${boss.spawnCount}`, '#ff00ff');
        }
        
        if(boss.isPlus && now - boss.lastBeam > boss.beamInterval * intervalMult) {
            if(!boss.isChargingBeam) {
                boss.isChargingBeam = true;
                boss.beamChargeStart = now;
                FXSystem.createText(boss.x, boss.y - 100, 'RAYO CARGANDO...', '#ff0000');
            } else if(now - boss.beamChargeStart > 1500) {
                this.fireBeam(boss, player);
                boss.isChargingBeam = false;
                boss.lastBeam = now;
            }
        }
    }
    
    static updateChaos(boss, player, now, intervalMult) {
        boss.pulseSize = (boss.pulseSize || 0) + 0.2;
        
        if(now - boss.lastChaos > boss.chaosInterval * intervalMult) {
            boss.lastChaos = now;
            this.fireChaos(boss, boss.isPlusPlus ? 40 : (boss.isPlus ? 30 : 20));
            FXSystem.createText(boss.x, boss.y - 80, boss.isPlusPlus ? 'CAOS ABSOLUTO' : 'CAOS', '#ff0055');
        }
        
        if(now - boss.lastTeleport > boss.teleportInterval * intervalMult) {
            boss.lastTeleport = now;
            this.teleportChaos(boss, player);
            
            for(let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                this.createEnemyBullet(boss.x, boss.y, angle, 6, '#ff0055');
            }
        }
        
        if(boss.isPlus && now - boss.lastInvert > boss.invertInterval) {
            boss.lastInvert = now;
            state.invertedControls = true;
            FXSystem.createText(player.x, player.y - 60, '¡CONTROLES INVERTIDOS!', '#ff00ff');
            
            setTimeout(() => {
                state.invertedControls = false;
                FXSystem.createText(player.x, player.y - 60, 'CONTROLES NORMALES', '#00ff00');
            }, 2000);
        }
    }
    
    static fireNova(boss, count, offsetAngle) {
        for(let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + offsetAngle;
            this.createEnemyBullet(boss.x, boss.y, angle, 7, '#ffd700');
        }
    }
    
    static fireChase(boss, player, count) {
        const baseAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        for(let i = 0; i < count; i++) {
            const spread = (i - Math.floor(count/2)) * 0.1;
            this.createEnemyBullet(boss.x, boss.y, baseAngle + spread, 8, '#ffaa00');
        }
    }
    
    static fireSwarm(boss, count) {
        for(let i = 0; i < count; i++) {
            const angle = boss.spiralAngle + (Math.PI * 2 / count) * i;
            const speed = 4 + i * 0.5;
            this.createEnemyBullet(boss.x, boss.y, angle, speed, '#bc13fe');
        }
    }
    
    static fireChaos(boss, count) {
        for(let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 4;
            this.createEnemyBullet(boss.x, boss.y, angle, speed, '#ff0055');
        }
    }
    
    static fireBeam(boss, player) {
        const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
        
        for(let i = 0; i < 30; i++) {
            const dist = i * 30;
            const x = boss.x + Math.cos(angle) * dist;
            const y = boss.y + Math.sin(angle) * dist;
            
            const dx = x - player.x;
            const dy = y - player.y;
            if(Math.sqrt(dx*dx + dy*dy) < 25) {
                if(window.game) window.game.handlePlayerHitByBullet(25);
            }
        }
        
        FXSystem.createExplosion(boss.x, boss.y, '#ff0000', 10, 2);
        FXSystem.createText(boss.x, boss.y - 80, 'RAYO!', '#ff0000');
    }
    
    static createEnemyBullet(x, y, angle, speed, color) {
        enemyBullets.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 120,
            color: color,
            size: 6,
            damage: 25
        });
    }
    
    static spawnMinions(boss, count) {
        for(let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const dist = 60;
            const x = boss.x + Math.cos(angle) * dist;
            const y = boss.y + Math.sin(angle) * dist;
            
            enemies.push({
                x, y,
                vx: 0, vy: 0,
                type: 'minion',
                size: 7,
                speed: 3,
                health: 20,
                maxHealth: 20,
                damage: 8,
                color: '#ff00ff',
                score: 50,
                pulse: 0,
                isBoss: false,
                stunned: 0
            });
        }
    }
    
    static teleportChaos(boss, player) {
        FXSystem.createExplosion(boss.x, boss.y, '#ff0055', 10, 1);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 150 + Math.random() * 100;
        boss.x = player.x + Math.cos(angle) * dist;
        boss.y = player.y + Math.sin(angle) * dist;
        
        FXSystem.createExplosion(boss.x, boss.y, '#ff0055', 10, 1);
        FXSystem.createText(boss.x, boss.y - 60, 'TELEPORT', '#ff0055');
    }
    
    static updateShields(boss) {
        if(boss.shields.length === 0) {
            for(let i = 0; i < boss.shieldCount; i++) {
                boss.shields.push({ angle: (Math.PI * 2 / boss.shieldCount) * i });
            }
        }
        
        boss.shields.forEach((shield) => {
            shield.angle += 0.03;
        });
    }
}

class PowerUpSystem {
    static createShield(x, y) {
        return {
            x, y,
            type: 'shield',
            size: 12,
            color: '#00f3ff',
            pulse: 0,
            life: 600
        };
    }

    static createSpeed(x, y) {
        return {
            x, y,
            type: 'speed',
            size: 12,
            color: '#ffeb3b',
            pulse: 0,
            life: 600
        };
    }

    static spawnDrop(x, y) {
        if(state.noShieldDrops) return;
        
        const roll = Math.random();
        
        if(roll < 0.15) {
            powerUps.push(this.createShield(x, y));
            FXSystem.createText(x, y - 20, 'SHIELD DROP!', '#00f3ff');
        } else if(roll < 0.25 && !state.speedBoost) {
            powerUps.push(this.createSpeed(x, y));
            FXSystem.createText(x, y - 20, 'SPEED DROP!', '#ffeb3b');
        }
    }

    static update() {
        for(let i = powerUps.length - 1; i >= 0; i--) {
            const p = powerUps[i];
            p.pulse += 0.1;
            p.life--;
            
            const dx = player.x - p.x;
            const dy = player.y - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < p.size + player.size + 10) {
                this.collect(p);
                powerUps.splice(i, 1);
                continue;
            }
            
            if(p.life <= 0) {
                powerUps.splice(i, 1);
            }
        }
    }

    static collect(p) {
        if(p.type === 'shield') {
            if(state.shield >= state.maxShield) {
                state.overcharge = true;
                state.overchargeTime = 600;
                state.overchargeActive = true;
                state.overchargeCooldown = 0;
                
                FXSystem.createExplosion(player.x, player.y, '#ffd700', 12, 1.8);
                FXSystem.createText(player.x, player.y - 50, 'REPULSION SHIELD!', '#ffd700');
            } else {
                state.shield = Math.min(state.maxShield, state.shield + 1);
                FXSystem.createText(player.x, player.y - 40, `SHIELD +1`, '#00f3ff');
            }
        } else if(p.type === 'speed') {
            state.speedBoost = true;
            state.speedBoostTime = state.speedBoostDuration;
            player.speed = CONSTANTS.PLAYER_SPEED_BOOST;
            FXSystem.createText(player.x, player.y - 40, 'SPEED BOOST!', '#ffeb3b');
        }
        updateUI();
    }

    static updateEffects() {
        if(state.overcharge) {
            state.overchargeTime--;
            
            if(state.overchargeCooldown > 0) {
                state.overchargeCooldown -= 16;
                if(state.overchargeCooldown <= 0) {
                    state.overchargeActive = true;
                    state.overchargeCooldown = 0;
                    FXSystem.createText(player.x, player.y - 40, 'REPULSION READY!', '#00ff00');
                }
            }
            
            if(state.overchargeTime <= 0) {
                state.overcharge = false;
                state.overchargeActive = false;
                state.overchargeCooldown = 0;
                FXSystem.createText(player.x, player.y - 40, 'SHIELD EXPIRED!', '#ff5555');
            }
        }
        
        if(state.speedBoost) {
            state.speedBoostTime -= 16;
            
            if(Math.random() < 0.3) {
                particles.push({
                    x: player.x - Math.cos(player.angle) * 15,
                    y: player.y - Math.sin(player.angle) * 15,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 0.5,
                    color: '#00f3ff',
                    size: 2
                });
            }
            
            if(state.speedBoostTime <= 0) {
                state.speedBoost = false;
                player.speed = CONSTANTS.PLAYER_SPEED;
                FXSystem.createText(player.x, player.y - 40, 'SPEED END', '#ffaa00');
            }
        }
    }
}

class FXSystem {
    static createExplosion(x, y, color, count, scale = 1) {
        for(let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const vel = (Math.random() * 3 + 1) * scale;
            particles.push({
                x, y,
                vx: Math.cos(ang) * vel,
                vy: Math.sin(ang) * vel,
                life: 0.5 + Math.random() * 0.3,
                color,
                size: (Math.random() * 3 + 1) * scale
            });
        }
    }

    static createMuzzleFlash(x, y, angle) {
        for(let i = 0; i < 3; i++) {
            particles.push({
                x: x + Math.cos(angle) * 20,
                y: y + Math.sin(angle) * 20,
                vx: -Math.cos(angle) * 2 + (Math.random() - 0.5),
                vy: -Math.sin(angle) * 2 + (Math.random() - 0.5),
                life: 0.4,
                color: '#ffeb3b',
                size: 2
            });
        }
    }

    static createText(x, y, text, color) {
        texts.push({ x, y, text, color, life: 1, vy: -1 });
    }
}

console.log('Entities.js cargado correctamente');