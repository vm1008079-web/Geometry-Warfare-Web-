// Expanded Enemy Types

// Sniper: A long-range enemy that can attack from a distance
const Sniper = {
    type: 'Sniper',
    health: 100,
    damage: 20,
    range: 300,
    speed: 1,
    attack: function(target) {
        // Attack logic for Sniper
    }
};

// Armored: A heavily armored enemy with high health
const Armored = {
    type: 'Armored',
    health: 300,
    damage: 10,
    armor: 150,
    speed: 0.5,
    attack: function(target) {
        // Attack logic for Armored
    }
};

// Spawner: An enemy that can spawn other enemies
const Spawner = {
    type: 'Spawner',
    health: 150,
    damage: 5,
    spawnRate: 3,
    speed: 1,
    spawnEnemies: function() {
        // Logic to spawn other enemies
    }
};

// Agile: A fast-moving enemy that is difficult to hit
const Agile = {
    type: 'Agile',
    health: 80,
    damage: 15,
    speed: 3,
    dodge: function() {
        // Logic for dodging attacks
    }
};