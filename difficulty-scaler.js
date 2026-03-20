class DifficultyScaler {
    constructor(baseDifficulty = 1, scalingFactor = 1.1) {
        this.baseDifficulty = baseDifficulty;
        this.scalingFactor = scalingFactor;
        this.currentDifficulty = baseDifficulty;
    }

    scaleDifficulty(level) {
        this.currentDifficulty = this.baseDifficulty * Math.pow(this.scalingFactor, level);
        return this.currentDifficulty;
    }

    reset() {
        this.currentDifficulty = this.baseDifficulty;
    }
}

// Export the class for use in other modules
module.exports = DifficultyScaler;