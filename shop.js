console.log('Shop.js cargando...');

class ShopSystem {
    constructor() {
        this.currentItems = [];
        this.overlay = document.getElementById('shopOverlay');
        this.createUI();
    }
    
    createUI() {
        // Estructura interna de la tienda
        this.overlay.innerHTML = `
            <div class="shop-container">
                <div class="shop-header">
                    <div class="shop-title-group">
                        <h1>MEJORAS DISPONIBLES</h1>
                        <p id="shopWaveText">Oleada completada</p>
                    </div>
                    <div id="shopMoney" class="shop-money-badge">$0</div>
                </div>
                
                <div id="itemsContainer" class="shop-items-row"></div>
                
                <button id="skipBtn" class="shop-close-btn">CONTINUAR BATALLA</button>
            </div>
        `;
        
        this.itemsContainer = this.overlay.querySelector('#itemsContainer');
        this.moneyDisplay = this.overlay.querySelector('#shopMoney');
        this.waveText = this.overlay.querySelector('#shopWaveText');
        
        this.overlay.querySelector('#skipBtn').onclick = () => this.close();
    }
    
    generateItems() {
        this.currentItems = [];
        // Generar 3 opciones aleatorias
        for(let i = 0; i < 3; i++) {
            this.currentItems.push(this.rollItem());
        }
        this.renderItems();
    }
    
    rollItem() {
        const roll = Math.random() * 100;
        let rarity = roll < 1 ? 'legendary' : roll < 10 ? 'epic' : roll < 40 ? 'rare' : 'common';
        const pool = ITEMS_POOL.filter(item => item.rarity === rarity);
        return pool[Math.floor(Math.random() * pool.length)];
    }
    
    renderItems() {
        this.itemsContainer.innerHTML = '';
        this.moneyDisplay.textContent = `$${ECONOMY.money}`;
        if(window.waveManager) this.waveText.textContent = `Oleada ${window.waveManager.wave} completada`;
        
        this.currentItems.forEach((item, index) => {
            const price = getItemPrice(item.price);
            const canAfford = ECONOMY.money >= price;
            
            const card = document.createElement('div');
            card.className = `shop-card ${canAfford ? '' : 'cant-afford'}`;
            card.style.setProperty('--item-color', item.color);
            
            card.innerHTML = `
                <div class="card-tag">${item.rarity.toUpperCase()}</div>
                <div class="card-icon">${this.getIcon(item.id)}</div>
                <div class="card-info">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                </div>
                <div class="card-price">$${price}</div>
            `;
            
            if(canAfford) {
                card.onclick = () => this.buyItem(index);
            }
            this.itemsContainer.appendChild(card);
        });
    }
    
    getIcon(id) {
        const icons = {
            'dmg_up':'⚔️', 'speed_up':'💨', 'max_hp':'❤️', 'ammo_up':'📦', 
            'fire_rate':'⚡', 'vampirism':'🧛', 'piercing':'🎯', 'ricochet':'↩️', 
            'crit_chance':'💎', 'berserk':'😤', 'shield_gen':'🛡️', 'explosive':'💣'
        };
        return icons[id] || '✨';
    }

    buyItem(index) {
        const item = this.currentItems[index];
        const price = getItemPrice(item.price);
        if(ECONOMY.money >= price) {
            ECONOMY.money -= price;
            item.apply();
            
            // Efecto visual al comprar
            if(window.FXSystem) FXSystem.createExplosion(player.x, player.y, item.color, 15, 2);
            
            this.close();
            if(window.updateUI) updateUI();
        }
    }
    
    open() {
        ECONOMY.isShopOpen = true;
        document.getElementById('hud').style.opacity = '0.2';
        document.getElementById('controls').style.display = 'none';
        this.generateItems();
        this.overlay.style.display = 'flex';
        if(window.game) window.game.paused = true;
    }
    
    close() {
        ECONOMY.isShopOpen = false;
        document.getElementById('hud').style.opacity = '1';
        document.getElementById('controls').style.display = 'flex';
        this.overlay.style.display = 'none';
        if(window.game) window.game.paused = false;
        
        if(window.waveManager && !state.gameOver) {
            window.waveManager.startWave(window.waveManager.wave + 1);
        }
    }
}

// Inicializar
window.shopSystem = new ShopSystem();

console.log('Shop.js cargado correctamente');