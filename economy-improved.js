// economy-improved.js

/**
 * Economy Balancing System
 * 
 * This script aims to improve money scaling and item pricing in the game.
 * The main objectives are to prevent inflation, ensure fair pricing of items,
 * and create a balanced economy that enhances player experience.
 */

class Economy {
    constructor(baseCurrency = 1000) {
        this.baseCurrency = baseCurrency;
        this.items = {};
        this.playerMoney = this.baseCurrency;
    }

    /**
     * Adds an item to the economy.
     * @param {string} itemName - The name of the item.
     * @param {number} basePrice - The initial price of the item.
     */
    addItem(itemName, basePrice) {
        this.items[itemName] = {
            basePrice: basePrice,
            currentPrice: basePrice,
            demand: 0
        };
    }

    /**
     * Updates the price of an item based on demand.
     * @param {string} itemName - The name of the item.
     * @param {number} demandChange - Change in demand (positive or negative).
     */
    updateItemPrice(itemName, demandChange) {
        if (this.items[itemName]) {
            this.items[itemName].demand += demandChange;
            const priceAdjustment = Math.floor(this.items[itemName].demand / 10);
            this.items[itemName].currentPrice = Math.max(1, this.items[itemName].basePrice + priceAdjustment);
        }
    }

    /**
     * Handles a purchase by a player.
     * @param {string} itemName - The name of the item being purchased.
     */
    purchaseItem(itemName) {
        if (this.items[itemName] && this.playerMoney >= this.items[itemName].currentPrice) {
            this.playerMoney -= this.items[itemName].currentPrice;
            console.log(`Purchased ${itemName} for ${this.items[itemName].currentPrice} coins.`);
            this.updateItemPrice(itemName, 1); // Increase demand on purchase
        } else {
            console.log(`Not enough money or item does not exist.`);
        }
    }

    /**
     * Players can earn money in various ways, defined in subclasses.
     */
    earnMoney(amount) {
        this.playerMoney += amount;
        console.log(`Earned ${amount}. Total money: ${this.playerMoney}`);
    }
}

// Example usage:
const economy = new Economy();

economy.addItem('Sword', 50);

economy.addItem('Shield', 75);

economy.purchaseItem('Sword');

// Simulate earning money
 economy.earnMoney(100);


