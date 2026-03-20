console.log('WaveSystem.js cargando...');

class WaveManager {
    constructor() {
        this.wave = 1;
        this.total = 5;
        this.killed = 0;
        this.spawned = 0;
        this.isBossWave = false;
        this.lastSpawnTime = 0;
        this.bossSpawned = false;
        this.currentModifier = null;
        this.triadSpawned = 0;
        this.waveJustCompleted = false;
    }

    startWave(n) {
        console.log('startWave llamado con n =', n, ' | wave anterior:', this.wave);
        this.wave = n;
        this.killed = 0;
        this.spawned = 0;
        this.bossSpawned = false;
        this.triadSpawned = 0;
        this.waveJustCompleted = false;
        this.isBossWave = (n % 5 === 0);
        
        this.clearModifiers();
        
        if(!this.isBossWave && n > 5 && n % 5 === 0) {
            this.applyRandomModifier();
        }
        
        if(n % 10 === 0 && WORLD.shrinkLevel < 5) {
            WORLD.shrinkLevel++;
            FXSystem.createText(player.x, player.y - 80, 'MAP SHRINKING!', '#ff0055');
        }
        
        const base = 4 + n;
        const enemyMult = 1 + Math.floor(n / 10) * 0.5;
        this.total = this.isBossWave ? (state.doubleBoss ? 2 : 1) : Math.floor(base * enemyMult);

        this.showNotification();
        
        if(n > 1 && state.health > 0) {
            const heal = 10;
            state.health = Math.min(state.maxHealth, state.health + heal);
            FXSystem.createText(player.x, player.y - 40, `+${heal} HP`, '#0f0');
        }

        updateUI();
    }

    clearModifiers() {
        state.darkness = false;
        state.gravity = false;
        state.speedModifier = 1;
        state.noShieldDrops = false;
        state.doubleBoss = false;
        this.currentModifier = null;
        if(ui.modifierText) ui.modifierText.textContent = '';
    }

    applyRandomModifier() {
        const mod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
        this.currentModifier = mod;
        mod.apply();
        
        if(ui.modifierText) {
            ui.modifierText.textContent = `${mod.name}: ${mod.desc}`;
            ui.modifierText.parentElement.classList.add('active');
            setTimeout(() => {
                if(ui.modifierText.parentElement) {
                    ui.modifierText.parentElement.classList.remove('active');
                }
            }, 3000);
        }
        
        FXSystem.createText(player.x, player.y - 100, `MODIFIER: ${mod.name}`, '#ff00ff');
    }

    showNotification() {
        if(this.isBossWave) {
            ui.bossWarning.classList.add('show');
            setTimeout(() => ui.bossWarning.classList.remove('show'), 3000);
            
            const bossCycle = Math.floor((this.wave - 1) / 5);
            const names = ['CENTINELA', 'CENTINELA+', 'COLMENA', 'COLMENA+', 'CAOS', 'CAOS+', 'CENTINELA++', 'COLMENA++', 'CAOS++', 'TRÍADA'];
            const name = bossCycle < 10 ? names[bossCycle] : 'TRÍADA';
            
            ui.notifTitle.textContent = `JEFE ${this.wave}`;
            ui.notifSub.textContent = name;
        } else {
            ui.notifTitle.textContent = `OLEADA ${this.wave}`;
            ui.notifSub.textContent = `${this.total} enemigos`;
        }

        ui.notification.classList.add('active');
        setTimeout(() => ui.notification.classList.remove('active'), 2000);
    }

    checkComplete() {
        if(state.gameOver) return;
        if(this.waveJustCompleted) return;
        
        const requiredKills = this.wave >= 50 ? 3 : this.total;
        
        if(this.killed >= requiredKills && enemies.filter(e => e.isBoss).length === 0) {
            console.log(`Wave ${this.wave} completada! killed=${this.killed}, total=${this.total}`);
            this.waveJustCompleted = true;
            
            if(this.wave % 4 === 0) {
                ECONOMY.priceMultiplier += ECONOMY.inflationRate;
                FXSystem.createText(player.x, player.y - 100, 'PRECIOS SUBEN!', '#ff0000');
            }
            
            if(this.wave % ECONOMY.shopEvery === 0) {
                console.log('Abriendo tienda después de wave', this.wave);
                setTimeout(() => {
                    if(window.shopSystem && !state.gameOver) {
                        window.shopSystem.open();
                    }
                }, 1000);
            } else {
                setTimeout(() => {
                    if(!state.gameOver && !ECONOMY.isShopOpen) this.startWave(this.wave + 1);
                }, 2000);
            }
        }
    }

    updateSpawning() {
        if(state.gameOver) return;
        
        if(this.wave >= 50 && this.isBossWave) {
            const bossesAlive = enemies.filter(e => e.isBoss).length;
            const now = Date.now();
            
            if(bossesAlive < 3 && this.triadSpawned < 3 && now - this.lastSpawnTime > 3000) {
                this.lastSpawnTime = now;
                const currentRadius = WORLD.radius * (1 - WORLD.shrinkLevel * 0.1);
                const angle = (Math.PI * 2 / 3) * this.triadSpawned;
                const dist = currentRadius * 0.6;
                const x = WORLD.centerX + Math.cos(angle) * dist;
                const y = WORLD.centerY + Math.sin(angle) * dist;
                
                let enemy;
                if(this.triadSpawned === 0) enemy = EnemyFactory.createChaos(x, y, 1 + (this.wave * 0.15), this.wave);
                else if(this.triadSpawned === 1) enemy = EnemyFactory.createSentinel(x, y, 1 + (this.wave * 0.15), this.wave);
                else enemy = EnemyFactory.createHive(x, y, 1 + (this.wave * 0.15), this.wave);
                
                enemies.push(enemy);
                this.triadSpawned++;
                this.spawned++;
                updateUI();
            }
            return;
        }
        
        if(this.spawned >= this.total) return;

        const now = Date.now();
        const spawnDelay = Math.max(400, CONSTANTS.SPAWN_DELAY_BASE - (this.wave * 20)) / state.speedModifier;
        
        if(now - this.lastSpawnTime < spawnDelay) return;
        this.lastSpawnTime = now;

        const currentRadius = WORLD.radius * (1 - WORLD.shrinkLevel * 0.1);
        const angle = Math.random() * Math.PI * 2;
        const distFromCenter = currentRadius * (0.6 + Math.random() * 0.3);
        
        const x = WORLD.centerX + Math.cos(angle) * distFromCenter;
        const y = WORLD.centerY + Math.sin(angle) * distFromCenter;

        const dx = x - player.x;
        const dy = y - player.y;
        const distToPlayer = Math.sqrt(dx*dx + dy*dy);
        
        if(distToPlayer < 200) {
            const oppositeAngle = angle + Math.PI;
            const newX = WORLD.centerX + Math.cos(oppositeAngle) * distFromCenter;
            const newY = WORLD.centerY + Math.sin(oppositeAngle) * distFromCenter;
            this.spawnEnemyAt(newX, newY);
        } else {
            this.spawnEnemyAt(x, y);
        }
    }

    spawnEnemyAt(x, y) {
        const isBoss = this.isBossWave && !this.bossSpawned;
        const enemy = EnemyFactory.spawnEnemy(x, y, this.wave, isBoss);
        
        enemies.push(enemy);
        if(isBoss) this.bossSpawned = true;
        this.spawned++;
        
        updateUI();
    }

    onEnemyKilled(enemy) {
        this.killed++;
        
        // Aumento de dinero: valores más generosos
        const baseMoney = enemy.isBoss ? 200 : (enemy.type === 'tank' ? 20 : (enemy.type === 'fast' ? 15 : 10));
        const waveBonus = Math.floor(this.wave * 2); // antes era this.wave * 0.8
        const moneyGain = baseMoney + waveBonus;
        
        addMoney(moneyGain);
        FXSystem.createText(enemy.x, enemy.y - 35, `+$${moneyGain}`, '#ffd700');
        
        const scoreGain = Math.floor(enemy.score * 0.05);
        state.score += scoreGain;
        
        state.shake = enemy.isBoss ? 20 : 4;
        FXSystem.createExplosion(enemy.x, enemy.y, enemy.color, 
            enemy.isBoss ? 30 : 6, enemy.isBoss ? 3 : 1);
        
        if(state.lifeSteal > 0 && !enemy.isBoss) {
            const heal = enemy.damage * state.lifeSteal;
            state.health = Math.min(state.maxHealth, state.health + heal);
            if(Math.random() < 0.5) FXSystem.createText(player.x, player.y - 50, `+${Math.floor(heal)}`, '#ff0000');
        }
        
        updateUI();
        this.checkComplete();
    }

    getProgress() {
        if(this.wave >= 50) return (this.killed / 3) * 100;
        return this.total > 0 ? (this.killed / this.total) * 100 : 0;
    }

    getRemaining() {
        if(this.wave >= 50) return 3 - this.killed;
        return this.total - this.killed;
    }
}

window.waveManager = new WaveManager();
console.log('WaveSystem.js cargado correctamente');