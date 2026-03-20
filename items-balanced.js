// Balanced Items System organized by Rarity
// This code defines items categorized by their rarity and includes improved pricing.

const items = {
    common: [
        { name: 'Wooden Sword', price: 10 },
        { name: 'Rusty Shield', price: 15 }
    ],
    rare: [
        { name: 'Silver Sword', price: 50 },
        { name: 'Golden Shield', price: 75 }
    ],
    epic: [
        { name: 'Dragon Slayer', price: 250 },
        { name: 'Phoenix Shield', price: 300 }
    ],
    legendary: [
        { name: 'Excalibur', price: 1000 },
        { name: 'Aegis Shield', price: 1200 }
    ]
};

// Function to retrieve item information based on rarity
function getItemsByRarity(rarity) {
    return items[rarity] || [];
}

// Example usage
console.log(getItemsByRarity('epic')); // Fetches epic items

export default items;