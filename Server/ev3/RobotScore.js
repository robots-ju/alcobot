const events = require('events');

class RobotScore extends events.EventEmitter {
    constructor() {
        super();

        this.score = 0;
        this.lastScoreOnBrick = 0;
    }

    seenBrickScore(scoreOnBrick) {
        let diff = scoreOnBrick;

        if (scoreOnBrick >= this.lastScoreOnBrick) {
            diff = scoreOnBrick - this.lastScoreOnBrick;
        }

        if (diff > 0) {
            this.score += diff;

            this.emit('scoreChanged', this.score);
        }

        this.lastScoreOnBrick = scoreOnBrick;
    }

    resetScore() {
        this.score = 0;

        this.emit('scoreChanged', this.score);
    }
}

module.exports = RobotScore;
