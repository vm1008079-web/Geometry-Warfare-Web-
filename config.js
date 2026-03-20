const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const damageOverlay = document.getElementById('damageOverlay');

const ui = {
    healthBar: document.getElementById('healthBar'),
    healthText: document.getElementById('healthText'),
    waveNumber: document.getElementById('waveNumber'),
    waveProgress: document.getElementById('waveProgress'),
    enemyCount: document.getElementById('enemyCount'),
    ammoText: document.getElementById('ammoText'),
    scoreText: document.getElementById('scoreText'),
    moneyText: document.getElementById('moneyText'),
    notification: document.getElementById('waveNotification'),
    notifTitle: document.getElementById('notifTitle'),
    notifSub: document.getElementById('notifSub'),
    bossWarning: document.getElementById('bossWarning'),
    reloadText: document.getElementById('reloadText'),
    gameOver: document.getElementById('gameOver'),
    finalWave: document.getElementById('finalWave'),
    finalScore: document.getElementById('finalScore'),
    restartBtn: document.getElementById('restartBtn'),
    shieldBars: document.getElementById('shieldBars'),
    speedBar: document.getElementById('speedBar'),
    speedContainer: document.getElementById('speedContainer'),
    modifierText: document.getElementById('modifierText')
};

const state = {
    score: 0,
    health: 60,
    maxHealth: 60,
    ammo: 30,
    maxAmmo: 30,
    isReloading: false,
    gameOver: false,
    paused: false,
    width: window.innerWidth,
    height: window.innerHeight,
    camera: { x: 0, y: 0 },
    shake: 0,
    shield: 0,
    maxShield: 5,
    overcharge: false,
    overchargeTime: 0,
    overchargeActive: false,
    overchargeCooldown: 0,
    overchargeMaxCooldown: 2000,
    speedBoost: false,
    speedBoostTime: 0,
    speedBoostDuration: 20000,
    furyMode: false,
    furyTime: 0,
    invertedControls: false,
    darkness: false,
    gravity: false,
    speedModifier: 1,
    noShieldDrops: false,
    doubleBoss: false,
    // Stats de items
    damageMult: 1.0,
    lifeSteal: 0,
    piercing: 0,
    ricochet: false,
    critChance: 0,
    shieldRegen: false,
    explosiveRounds: false,
    divineShield: false,
    infiniteAmmo: false,
    lastShieldRegen: 0
};

const WORLD = { radius: 1200, centerX: 0, centerY: 0, shrinkLevel: 0 };

const input = {
    move: { x: 0, y: 0, active: false },
    fire: { x: 0, y: 0, active: false, angle: 0 }
};

const CONSTANTS = {
    PLAYER_SPEED: 4,
    PLAYER_SPEED_BOOST: 6,
    PLAYER_SIZE: 15,
    FIRE_RATE: 150,
    FURY_FIRE_RATE: 80,
    RELOAD_TIME: 1200,
    SPAWN_DELAY_BASE: 1000,
    GRID_SIZE: 100,
    OVERCHARGE_BASIC_DAMAGE: 0.5,
    OVERCHARGE_BOSS_DAMAGE: 0.10,
    OVERCHARGE_KNOCKBACK_BASIC: 25,
    OVERCHARGE_KNOCKBACK_BOSS_PLAYER: 8,
    OVERCHARGE_KNOCKBACK_BOSS_SELF: 20,
    OVERCHARGE_STUN_DURATION: 30,
    OVERCHARGE_PLAYER_KNOCKBACK: 5,
    ENEMY_DAMAGE_CAP: 25
};

const BOSS_TYPES = { SENTINEL: 'sentinel', HIVE: 'hive', CHAOS: 'chaos' };

const MODIFIERS = [
    { name: 'OSCURIDAD', desc: 'Visión reducida', apply: () => { state.darkness = true; } },
    { name: 'GRAVEDAD', desc: 'Balas con arco', apply: () => { state.gravity = true; } },
    { name: 'VELOCIDAD x2', desc: 'Todo más rápido', apply: () => { state.speedModifier = 2; } },
    { name: 'SIN ESCUDO', desc: 'No hay drops de escudo', apply: () => { state.noShieldDrops = true; } },
    { name: 'DOBLE JEFE', desc: 'Dos jefes al mismo tiempo', apply: () => { state.doubleBoss = true; } }
];

// SISTEMA DE ECONOMÍA Y TIENDA
const ECONOMY = {
    money: 0,
    priceMultiplier: 1.0,
    shopEvery: 2,
    itemsPerShop: 3,
    inflationRate: 0.15,
    isShopOpen: false
};

const ITEMS_POOL = [
    // COMUNES (60% probabilidad)
    { 
        id: 'dmg_up', name: 'PÓLVORA', rarity: 'common', price: 100,
        desc: 'Daño +15%', 
        color: '#ffffff', 
        apply: () => { state.damageMult = (state.damageMult || 1) + 0.15; }
    },
    { 
        id: 'speed_up', name: 'TURBO', rarity: 'common', price: 120,
        desc: 'Velocidad +10%', 
        color: '#00f3ff',
        apply: () => { player.speed *= 1.1; }
    },
    { 
        id: 'max_hp', name: 'ARMADURA', rarity: 'common', price: 150,
        desc: 'Vida Máx +10', 
        color: '#ff0055',
        apply: () => { state.maxHealth += 10; state.health += 10; }
    },
    { 
        id: 'ammo_up', name: 'CARGADOR', rarity: 'common', price: 80,
        desc: 'Munición +5', 
        color: '#ffaa00',
        apply: () => { state.maxAmmo += 5; state.ammo += 5; }
    },
    { 
        id: 'fire_rate', name: 'GATILLO', rarity: 'common', price: 130,
        desc: 'Cadencia +10%', 
        color: '#ffff00',
        apply: () => { player.fireRate *= 0.9; }
    },
    
    // RAROS (30% probabilidad)
    { 
        id: 'vampirism', name: 'VAMPIRO', rarity: 'rare', price: 250,
        desc: 'Robo de vida 10%', 
        color: '#ff0000',
        apply: () => { state.lifeSteal = (state.lifeSteal || 0) + 0.10; }
    },
    { 
        id: 'piercing', name: 'PERFORADOR', rarity: 'rare', price: 300,
        desc: 'Balas atraviesan +1 enemigo', 
        color: '#ff00ff',
        apply: () => { state.piercing = (state.piercing || 0) + 1; }
    },
    { 
        id: 'ricochet', name: 'REBOTE', rarity: 'rare', price: 280,
        desc: 'Balas rebotan 1 vez', 
        color: '#00ff00',
        apply: () => { state.ricochet = true; }
    },
    { 
        id: 'crit_chance', name: 'CRÍTICO', rarity: 'rare', price: 320,
        desc: '15% chance de daño x2', 
        color: '#ffd700',
        apply: () => { state.critChance = (state.critChance || 0) + 0.15; }
    },
    
    // ÉPICOS (9% probabilidad)
    { 
        id: 'berserk', name: 'BERSERK', rarity: 'epic', price: 500,
        desc: 'Daño +50% pero Vida -20%', 
        color: '#ff4400',
        apply: () => { state.damageMult = (state.damageMult || 1) + 0.50; state.maxHealth *= 0.8; state.health = Math.min(state.health, state.maxHealth); }
    },
    { 
        id: 'shield_gen', name: 'REGENERA', rarity: 'epic', price: 450,
        desc: 'Recuperas 1 escudo cada 30s', 
        color: '#00f3ff',
        apply: () => { state.shieldRegen = true; }
    },
    { 
        id: 'explosive', name: 'EXPLOSIVO', rarity: 'epic', price: 480,
        desc: 'Balas explotan al impactar', 
        color: '#ff8800',
        apply: () => { state.explosiveRounds = true; }
    },
    
    // LEGENDARIOS (1% probabilidad)
    { 
        id: 'god_mode', name: 'DIVINIDAD', rarity: 'legendary', price: 1000,
        desc: 'Invencible 3s cada 20s', 
        color: '#ffffff',
        apply: () => { state.divineShield = true; }
    },
    { 
        id: 'infinity', name: 'INFINITO', rarity: 'legendary', price: 1200,
        desc: 'Munición infinita', 
        color: '#bc13fe',
        apply: () => { state.infiniteAmmo = true; }
    }
];

const player = {
    x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI/2,
    size: CONSTANTS.PLAYER_SIZE,
    speed: CONSTANTS.PLAYER_SPEED,
    lastShot: 0,
    fireRate: CONSTANTS.FIRE_RATE
};

let enemies = [];
let bullets = [];
let particles = [];
let texts = [];
let powerUps = [];
let enemyBullets = [];

window.updateUI = function() {
    const hpPct = Math.max(0, (state.health/state.maxHealth)*100);
    if(ui.healthBar) ui.healthBar.style.width = hpPct+'%';
    if(ui.healthText) ui.healthText.textContent = `${Math.ceil(state.health)}/${state.maxHealth}`;
    
    if(window.waveManager && ui.waveNumber) {
        ui.waveNumber.textContent = window.waveManager.wave;
        const progress = window.waveManager.getProgress();
        ui.waveProgress.style.width = progress+'%';
        ui.enemyCount.textContent = `${enemies.length}/${window.waveManager.getRemaining()}`;
    }
    
    if(ui.ammoText) ui.ammoText.textContent = `${state.ammo}/${state.maxAmmo}`;
    if(ui.scoreText) ui.scoreText.textContent = state.score;
    if(ui.moneyText) ui.moneyText.textContent = `$${ECONOMY.money}`;
    
    if(ui.shieldBars) {
        ui.shieldBars.innerHTML = '';
        for(let i = 0; i < state.shield; i++) {
            const bar = document.createElement('div');
            bar.className = 'shield-bar';
            ui.shieldBars.appendChild(bar);
        }
        if(state.overcharge) {
            const overchargeBar = document.createElement('div');
            overchargeBar.className = 'shield-bar overcharge';
            if(!state.overchargeActive) overchargeBar.style.opacity = '0.5';
            ui.shieldBars.appendChild(overchargeBar);
        }
    }
    
    if(ui.speedBar && ui.speedContainer) {
        if(state.speedBoost || state.furyMode) {
            ui.speedContainer.classList.add('active');
            let pct = 100;
            if(state.speedBoost) pct = (state.speedBoostTime / state.speedBoostDuration) * 100;
            if(state.furyMode) pct = (state.furyTime / 10000) * 100;
            ui.speedBar.style.width = pct + '%';
        } else {
            ui.speedContainer.classList.remove('active');
            ui.speedBar.style.width = '0%';
        }
    }
};

window.addMoney = function(amount) {
    ECONOMY.money += amount;
    updateUI();
};

window.getItemPrice = function(basePrice) {
    return Math.floor(basePrice * ECONOMY.priceMultiplier);
};

window.clampToWorld = function(entity, isPlayer = false) {
    const currentRadius = WORLD.radius * (1 - WORLD.shrinkLevel * 0.1);
    const dx = entity.x - WORLD.centerX;
    const dy = entity.y - WORLD.centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if(dist > currentRadius - entity.size) {
        const angle = Math.atan2(dy, dx);
        const limit = currentRadius - entity.size;
        
        entity.x = WORLD.centerX + Math.cos(angle) * limit;
        entity.y = WORLD.centerY + Math.sin(angle) * limit;
        
        if(isPlayer) {
            entity.vx *= -0.3;
            entity.vy *= -0.3;
            FXSystem.createExplosion(entity.x, entity.y, '#ff0055', 3, 0.5);
        }
        
        return true;
    }
    return false;
};

console.log('Config.js cargado');