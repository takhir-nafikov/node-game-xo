const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
    firstPlayer: String,
    secondPlayer: String,
    field: [[String]],
    turn: String,
    token: String,
    winner: String,
    created: {
        type: Date,
        default: Date.now,
    },
    endGame: Date,
    size: Number,
}, {
    collection: 'games',
});

module.exports = mongoose.model('Game', gameSchema);
