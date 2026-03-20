console.log('Game.js cargando...');

class Game {
    constructor() {
        this.inputManager = new InputManager();
        this.renderer = new Renderer();
        this.setupEvents();
        this.paused = false;
    }

    setupEvents() {
        window.addEventListener('resize', () => this.resize());
        this.inputManager.setupRestart(() => this.reset());
    }

    resize() {
        state.width = window.innerWidth;
        state.height = window.innerHeight;
        canvas.width = state.width;
        canvas.height = state.height;
    }

    reset() {
        state.score = 0;
        state.health = 60;
        state.maxHealth = 60;
        state.ammo = 30;
        state.maxAmmo = 30;
        state.isReloading = false;
        state.gameOver = false;
        state.shake = 0;
        state.paused = false;
        
        state.shield = 0;
        state.maxShield = 5;
        state.overcharge = false;
        state.overchargeTime = 0;
        state.overchargeActive = false;
        state.overchargeCooldown = 0;
        state.speedBoost = false;
        state.speedBoostTime = 0;
        state.furyMode = false;
        state.furyTime = 0;
        state.invertedControls = false;
        state.darkness = false;
        state.gravity = false;
        state.speedModifier = 1;
        state.noShieldDrops = false;
        state.doubleBoss = false;
        
        // Reset economía
        ECONOMY.money = 0;
        ECONOMY.priceMultiplier = 1.0;
        ECONOMY.isShopOpen = false;
        
        // Reset stats de items
        state.damageMult = 1.0;
        state.lifeSteal = 0;
        state.piercing = 0;
        state.ricochet = false;
        state.critChance = 0;
        state.shieldRegen = false;
        state.explosiveRounds = false;
        state.divineShield = false;
        state.infiniteAmmo = false;
        state.lastShieldRegen = 0;
        
        WORLD.centerX = 0;
        WORLD.centerY = 0;
        WORLD.shrinkLevel = 0;
        
        player.x = 0;
        player.y = 0;
        player.vx = 0;
        player.vy = 0;
        player.angle = -Math.PI/2;
        player.lastShot = 0;
        player.fireRate = CONSTANTS.FIRE_RATE;
        player.speed = CONSTANTS.PLAYER_SPEED;

        enemies.length = 0;
        bullets.length = 0;
        particles.length = 0;
        texts.length = 0;
        powerUps.length = 0;
        enemyBullets.length = 0;

        state.camera.x = player.x - state.width/2;
        state.camera.y = player.y - state.height/2;

        ui.gameOver.classList.remove('active');
        if(ui.reloadText) ui.reloadText.classList.remove('show');
        if(ui.modifierText) ui.modifierText.textContent = '';

        if(window.waveManager) {
            window.waveManager.startWave(1);
        }
        
        updateUI();
    }

    shoot(angle) {
        if(state.infiniteAmmo && state.ammo <= 0) {
            state.ammo = 1;
        }
        
        const now = Date.now();
        if(now - player.lastShot < player.fireRate) return;
        if(state.isReloading) return;
        if(state.ammo <= 0) {
            this.reload();
            return;
        }

        player.lastShot = now;
        state.ammo--;
        updateUI();

        this.createBullet(player.x, player.y, angle);
        FXSystem.createMuzzleFlash(player.x, player.y, angle);

        if(state.ammo === 0 && !state.infiniteAmmo) this.reload();
    }
    
    createBullet(x, y, angle) {
        const bullet = {
            x: x + Math.cos(angle) * 20,
            y: y + Math.sin(angle) * 20,
            vx: Math.cos(angle) * 12,
            vy: Math.sin(angle) * 12,
            life: 50,
            pierced: 0
        };
        bullets.push(bullet);
        
        if(state.furyMode) {
            bullets.push({
                x: x + Math.cos(angle + 0.15) * 20,
                y: y + Math.sin(angle + 0.15) * 20,
                vx: Math.cos(angle) * 12,
                vy: Math.sin(angle) * 12,
                life: 50,
                pierced: 0
            });
            bullets.push({
                x: x + Math.cos(angle - 0.15) * 20,
                y: y + Math.sin(angle - 0.15) * 20,
                vx: Math.cos(angle) * 12,
                vy: Math.sin(angle) * 12,
                life: 50,
                pierced: 0
            });
        }
    }

    reload() {
        if(state.isReloading || state.infiniteAmmo) return;
        if(state.ammo >= state.maxAmmo) return;

        state.isReloading = true;
        if(ui.reloadText) ui.reloadText.classList.add('show');

        setTimeout(() => {
            state.ammo = state.maxAmmo;
            state.isReloading = false;
            if(ui.reloadText) ui.reloadText.classList.remove('show');
            updateUI();
        }, CONSTANTS.RELOAD_TIME);
    }

    // Reemplazar el método updatePlayer completo en game.js

updatePlayer() {
    if(state.shieldRegen && Date.now() - state.lastShieldRegen > 30000) {
        if(state.shield < state.maxShield) {
            state.shield++;
            state.lastShieldRegen = Date.now();
            FXSystem.createText(player.x, player.y - 40, 'SHIELD REGEN', '#00f3ff');
            updateUI();
        }
    }
    
    let moveX = 0;
    let moveY = 0;
    let moveActive = false;
    
    // Detectar si estamos en modo desktop
    if (this.inputManager.isDesktop) {
        // Usar teclado
        const keyboardMove = this.inputManager.getKeyboardMovement();
        moveX = keyboardMove.x;
        moveY = keyboardMove.y;
        moveActive = keyboardMove.active;
        
        // Actualizar ángulo del jugador según el mouse
        if (this.inputManager.mousePosition.x !== 0 || this.inputManager.mousePosition.y !== 0) {
            player.angle = this.inputManager.getMouseAngle();
        }
        
        // Disparar con click izquierdo
        if (this.inputManager.mouseButton) {
            this.shoot(player.angle);
        }
        
        // Mover con click derecho
        if (this.inputManager.rightButtonPressed) {
            // Si no hay teclas presionadas, moverse hacia el mouse
            if (!moveActive) {
                const dx = this.inputManager.mousePosition.x - player.x;
                const dy = this.inputManager.mousePosition.y - player.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist > 10) { // Evitar moverse si está muy cerca
                    moveX = dx / dist;
                    moveY = dy / dist;
                    moveActive = true;
                }
            }
        }
    } else {
        // Modo móvil: usar joysticks
        moveX = input.move.x;
        moveY = input.move.y;
        moveActive = input.move.active;
        
        // Ángulo de disparo desde joystick de fuego
        if (input.fire.active) {
            player.angle = input.fire.angle;
        }
    }
    
    // Aplicar inversión de controles si está activa
    if(state.invertedControls) {
        moveX = -moveX;
        moveY = -moveY;
    }
    
    const speedMult = state.speedModifier * (state.furyMode ? 1.3 : 1);
    
    if(moveActive) {
        player.vx = moveX * player.speed * speedMult;
        player.vy = moveY * player.speed * speedMult;
    } else {
        player.vx *= 0.9;
        player.vy *= 0.9;
    }

    player.x += player.vx;
    player.y += player.vy;
    
    clampToWorld(player, true);
    
    state.camera.x = player.x - state.width/2;
    state.camera.y = player.y - state.height/2;

    // Disparo automático en móvil si el joystick de fuego está activo
    if (!this.inputManager.isDesktop && input.fire.active && (Math.abs(input.fire.x) > 0.1 || Math.abs(input.fire.y) > 0.1)) {
        this.shoot(input.fire.angle);
    }
}

    updateBullets() {
        for(let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            
            if(state.gravity) {
                b.vy += 0.2;
            }
            
            b.x += b.vx;
            b.y += b.vy;
            b.life--;

            const distFromCenter = Math.sqrt(
                (b.x - WORLD.centerX)**2 + (b.y - WORLD.centerY)**2
            );
            const currentRadius = WORLD.radius * (1 - WORLD.shrinkLevel * 0.1);
            
            if(b.life <= 0 || distFromCenter > currentRadius) {
                bullets.splice(i, 1);
                continue;
            }

            let hitSomething = false;
            
            for(let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                
                if(e.stunned > 0) continue;
                
                const dx = b.x - e.x;
                const dy = b.y - e.y;
                const dist = Math.sqrt(dx*dx + dy*dy);

                if(dist < e.size + 5) {
                    if(e.bossType === BOSS_TYPES.SENTINEL && e.shields) {
                        let hitShield = false;
                        for(let s of e.shields) {
                            const sx = e.x + Math.cos(s.angle) * (e.size + 20);
                            const sy = e.y + Math.sin(s.angle) * (e.size + 20);
                            const sdx = b.x - sx;
                            const sdy = b.y - sy;
                            if(Math.sqrt(sdx*sdx + sdy*sdy) < 15) {
                                hitShield = true;
                                FXSystem.createExplosion(sx, sy, '#ffd700', 3, 0.5);
                                break;
                            }
                        }
                        if(hitShield) {
                            if(!state.ricochet || b.ricocheted) {
                                bullets.splice(i, 1);
                            } else {
                                b.vx = -b.vx;
                                b.vy = -b.vy;
                                b.ricocheted = true;
                            }
                            continue;
                        }
                    }
                    
                    let damage = 25 * state.damageMult;
                    let isCrit = false;
                    
                    if(Math.random() < state.critChance) {
                        damage *= 2;
                        isCrit = true;
                    }
                    
                    e.health -= damage;
                    
                    if(isCrit) {
                        FXSystem.createText(e.x, e.y - e.size - 15, 'CRÍTICO!', '#ffd700');
                        FXSystem.createExplosion(b.x, b.y, '#ffd700', 5, 1);
                    }
                    
                    if(state.explosiveRounds) {
                        FXSystem.createExplosion(e.x, e.y, '#ff8800', 5, 0.8);
                        enemies.forEach(nearby => {
                            if(nearby !== e) {
                                const ndx = nearby.x - e.x;
                                const ndy = nearby.y - e.y;
                                const ndist = Math.sqrt(ndx*ndx + ndy*ndy);
                                if(ndist < 60) {
                                    nearby.health -= damage * 0.5;
                                }
                            }
                        });
                    }
                    
                    FXSystem.createExplosion(b.x, b.y, '#ffeb3b', 2, 0.5);

                    if(e.health <= 0) {
                        PowerUpSystem.spawnDrop(e.x, e.y);
                        enemies.splice(j, 1);
                        if(window.waveManager) {
                            window.waveManager.onEnemyKilled(e);
                        }
                    } else {
                        FXSystem.createText(e.x, e.y - e.size - 10, `-${Math.floor(damage)}`, '#fff');
                    }

                    if(state.piercing > b.pierced) {
                        b.pierced++;
                        hitSomething = true;
                    } else {
                        if(!state.ricochet || b.ricocheted) {
                            bullets.splice(i, 1);
                        } else {
                            b.vx = -b.vx;
                            b.vy = -b.vy;
                            b.ricocheted = true;
                        }
                        hitSomething = true;
                        break;
                    }
                }
            }
            
            if(!hitSomething && state.ricochet && !b.ricocheted) {
                const distFromCenter = Math.sqrt((b.x - WORLD.centerX)**2 + (b.y - WORLD.centerY)**2);
                const currentRadius = WORLD.radius * (1 - WORLD.shrinkLevel * 0.1);
                if(distFromCenter >= currentRadius - 10) {
                    const angle = Math.atan2(b.y - WORLD.centerY, b.x - WORLD.centerX);
                    b.vx = -Math.cos(angle) * 12;
                    b.vy = -Math.sin(angle) * 12;
                    b.ricocheted = true;
                }
            }
        }
        
        for(let i = enemyBullets.length - 1; i >= 0; i--) {
            const b = enemyBullets[i];
            b.x += b.vx;
            b.y += b.vy;
            b.life--;
            
            const distFromCenter = Math.sqrt(
                (b.x - WORLD.centerX)**2 + (b.y - WORLD.centerY)**2
            );
            const currentRadius = WORLD.radius * (1 - WORLD.shrinkLevel * 0.1);
            
            if(b.life <= 0 || distFromCenter > currentRadius) {
                enemyBullets.splice(i, 1);
                continue;
            }
            
            const dx = b.x - player.x;
            const dy = b.y - player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < player.size + b.size) {
                this.handlePlayerHitByBullet(b.damage || 25);
                enemyBullets.splice(i, 1);
            }
        }
    }

    updateEnemies() {
        for(let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            
            if(e.stunned > 0) {
                e.stunned--;
                e.x += e.vx || 0;
                e.y += e.vy || 0;
                e.vx = (e.vx || 0) * 0.90;
                e.vy = (e.vy || 0) * 0.90;
                
                clampToWorld(e, false);
                
                if(Math.floor(Date.now() / 100) % 2 === 0) {
                    e.isStunnedVisual = true;
                } else {
                    e.isStunnedVisual = false;
                }
                
                continue;
            }
            e.isStunnedVisual = false;
            
            if(e.isBoss) {
                BossAttackSystem.update(e, player);
            }
            
            const dx = player.x - e.x;
            const dy = player.y - e.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if(dist < 1) continue;

            const speedMult = e.furyMode ? 1.5 : 1;
            
            if(e.isBoss) {
                if(e.rotation !== undefined) e.rotation += 0.02;
                e.x += (dx/dist) * e.speed * speedMult;
                e.y += (dy/dist) * e.speed * speedMult;
            } else {
                e.pulse = (e.pulse || 0) + 0.1;
                e.x += (dx/dist) * e.speed * speedMult;
                e.y += (dy/dist) * e.speed * speedMult;
            }

            clampToWorld(e, false);

            if(dist < e.size + player.size) {
                this.handlePlayerHit(e, i, dx, dy, dist);
            }
        }
    }

    handlePlayerHit(enemy, index, dx, dy, dist) {
        const actualDamage = Math.min(enemy.damage, CONSTANTS.ENEMY_DAMAGE_CAP);
        
        if(state.overcharge && state.overchargeActive && state.overchargeCooldown <= 0) {
            
            if(enemy.isBoss) {
                const damage = enemy.maxHealth * CONSTANTS.OVERCHARGE_BOSS_DAMAGE;
                enemy.health -= damage;
                
                const pushAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                player.vx += Math.cos(pushAngle) * CONSTANTS.OVERCHARGE_KNOCKBACK_BOSS_PLAYER;
                player.vy += Math.sin(pushAngle) * CONSTANTS.OVERCHARGE_KNOCKBACK_BOSS_PLAYER;
                
                enemy.x += (dx/dist) * CONSTANTS.OVERCHARGE_KNOCKBACK_BOSS_SELF;
                enemy.y += (dy/dist) * CONSTANTS.OVERCHARGE_KNOCKBACK_BOSS_SELF;
                
                FXSystem.createExplosion(enemy.x, enemy.y, '#ffd700', 20, 2.5);
                FXSystem.createExplosion(player.x, player.y, '#ffd700', 10, 1.5);
                FXSystem.createText(enemy.x, enemy.y - 70, `-${Math.floor(damage)}`, '#ffd700');
                FXSystem.createText(player.x, player.y - 50, 'REPULSED!', '#ffaa00');
                
                state.shake = 10;
                
            } else {
                const damage = enemy.maxHealth * CONSTANTS.OVERCHARGE_BASIC_DAMAGE;
                enemy.health -= damage;
                
                enemy.vx = (dx/dist) * CONSTANTS.OVERCHARGE_KNOCKBACK_BASIC;
                enemy.vy = (dy/dist) * CONSTANTS.OVERCHARGE_KNOCKBACK_BASIC;
                
                enemy.stunned = CONSTANTS.OVERCHARGE_STUN_DURATION;
                
                player.vx -= (dx/dist) * CONSTANTS.OVERCHARGE_PLAYER_KNOCKBACK;
                player.vy -= (dy/dist) * CONSTANTS.OVERCHARGE_PLAYER_KNOCKBACK;
                
                FXSystem.createExplosion(enemy.x, enemy.y, '#ffd700', 15, 2);
                FXSystem.createExplosion(player.x, player.y, '#ffd700', 8, 1.2);
                
                if(enemy.health <= 0) {
                    enemies.splice(index, 1);
                    if(window.waveManager) window.waveManager.onEnemyKilled(enemy);
                    FXSystem.createText(enemy.x, enemy.y - 40, 'REPULSED!', '#ffd700');
                } else {
                    FXSystem.createText(enemy.x, enemy.y - 50, `-${Math.floor(damage)}`, '#ffd700');
                    FXSystem.createText(enemy.x, enemy.y - 30, 'STUNNED!', '#ffaa00');
                }
            }
            
            state.overchargeActive = false;
            state.overchargeCooldown = state.overchargeMaxCooldown;
            
            updateUI();
            return;
        }
        
        if(state.overcharge && !state.overchargeActive && state.overchargeCooldown > 0) {
            state.overcharge = false;
            state.overchargeActive = false;
            state.overchargeCooldown = 0;
            
            FXSystem.createExplosion(player.x, player.y, '#00f3ff', 8, 1);
            FXSystem.createText(player.x, player.y - 40, 'SHIELD BROKEN!', '#00f3ff');
            
            const pushAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            player.vx += Math.cos(pushAngle) * 6;
            player.vy += Math.sin(pushAngle) * 6;
            
            updateUI();
            return;
        }
        
        if(state.shield > 0) {
            state.shield--;
            FXSystem.createExplosion(player.x, player.y, '#00f3ff', 5, 0.8);
            
            if(!enemy.isBoss) {
                enemies.splice(index, 1);
                if(window.waveManager) {
                    window.waveManager.killed++;
                    window.waveManager.checkComplete();
                }
            } else {
                enemy.x -= (dx/dist) * 15;
                enemy.y -= (dy/dist) * 15;
            }
            
            FXSystem.createText(player.x, player.y - 40, `SHIELD ${state.shield}`, '#00f3ff');
            updateUI();
            return;
        }

        state.health -= actualDamage;
        state.shake = 8;
        damageOverlay.classList.add('active');
        setTimeout(() => damageOverlay.classList.remove('active'), 100);

        FXSystem.createExplosion(player.x, player.y, enemy.color, 5);

        const pushAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        player.vx += Math.cos(pushAngle) * 5;
        player.vy += Math.sin(pushAngle) * 5;

        if(!enemy.isBoss) {
            enemies.splice(index, 1);
            if(window.waveManager) {
                window.waveManager.killed++;
                window.waveManager.checkComplete();
            }
        } else {
            enemy.x -= (dx/dist) * 10;
            enemy.y -= (dy/dist) * 10;
        }

        if(state.health <= 0) {
            state.health = 0;
            this.gameOver();
        }
        updateUI();
    }

    handlePlayerHitByBullet(damage) {
        const actualDamage = Math.min(damage, CONSTANTS.ENEMY_DAMAGE_CAP);
        
        if(state.shield > 0) {
            state.shield--;
            FXSystem.createExplosion(player.x, player.y, '#00f3ff', 5, 0.8);
            FXSystem.createText(player.x, player.y - 40, `SHIELD ${state.shield}`, '#00f3ff');
            updateUI();
            return;
        }
        
        if(state.overcharge) {
            state.overcharge = false;
            state.overchargeActive = false;
            state.overchargeCooldown = 0;
            FXSystem.createExplosion(player.x, player.y, '#ffd700', 5, 0.8);
            FXSystem.createText(player.x, player.y - 40, 'SHIELD PIERCED!', '#ff5555');
        }
        
        state.health -= actualDamage;
        state.shake = 5;
        damageOverlay.classList.add('active');
        setTimeout(() => damageOverlay.classList.remove('active'), 100);
        
        if(state.health <= 0) {
            state.health = 0;
            this.gameOver();
        }
        updateUI();
    }

    updateFX() {
        for(let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vx *= 0.95;
            p.vy *= 0.95;
            if(p.life <= 0) particles.splice(i, 1);
        }

        for(let i = texts.length - 1; i >= 0; i--) {
            const t = texts[i];
            t.y += t.vy;
            t.life -= 0.02;
            if(t.life <= 0) texts.splice(i, 1);
        }

        if(state.shake > 0) {
            state.shake *= 0.9;
            if(state.shake < 0.5) state.shake = 0;
        }
        
        if(state.furyMode) {
            state.furyTime -= 16;
            player.fireRate = CONSTANTS.FURY_FIRE_RATE;
            
            if(Math.random() < 0.5) {
                particles.push({
                    x: player.x + (Math.random() - 0.5) * 30,
                    y: player.y + (Math.random() - 0.5) * 30,
                    vx: 0, vy: 0,
                    life: 0.3,
                    color: '#ff0000',
                    size: 3
                });
            }
            
            if(state.furyTime <= 0) {
                state.furyMode = false;
                player.fireRate = CONSTANTS.FIRE_RATE;
                FXSystem.createText(player.x, player.y - 40, 'FURY END', '#ff0000');
                updateUI();
            }
        }
    }

    gameOver() {
        state.gameOver = true;
        ui.finalWave.textContent = window.waveManager ? window.waveManager.wave : 1;
        ui.finalScore.textContent = state.score;
        ui.gameOver.classList.add('active');
    }

    update() {
        if(state.gameOver || this.paused) return;

        this.updatePlayer();
        PowerUpSystem.update();
        PowerUpSystem.updateEffects();
        
        if(window.waveManager) {
            window.waveManager.updateSpawning();
        }
        
        this.updateBullets();
        this.updateEnemies();
        this.updateFX();
    }

    loop() {
        this.update();
        this.renderer.render();
        requestAnimationFrame(() => this.loop());
    }

    init() {
        this.resize();
        this.reset();
        this.loop();
        console.log('Juego iniciado correctamente');
    }
}

console.log('Game.js cargado correctamente');