const randomstring = require('randomstring');
const Game = require('../models/Game');

exports.createGame = async (req, res) => {
    try {
        if (req.sizeField > 9) {
            return res.json({
                status: 'error',
                message: 'size must be less 10',
            });
        }
        let arr = [];
        let gameToken = randomstring.generate();

        for (let i = 0; i < req.sizeField * req.sizeField; i++) {
            arr.push('E');
        }

        const game = new Game({
            firstPlayer: req.name,
            secondPlayer: undefined,
            field: arr,
            turn: req.name,
            token: gameToken,
        });

        await game.save();

        res.json({
            status: 'ok',
            accessToken: req.accessToken,
            gameToken: gameToken,
        });
    } catch (err) {
        res.json({
            status: 'error',
            message: 'cannot create game',
        });
    }
};

exports.joinGame = async (req, res) => {
    try {
        const game = await Game.findOne({token: req.gameToken}); 
        if (!game) {
            res.json({
                status: 'error',
                message: 'not find game',
            });
        }
        game.secondPlayer = req.name;

        await game.save();

        res.json({
            status: 'ok',
            accessToken: req.accessToken,
        });
    } catch (err) {
        res.json({
            status: 'error',
            message: 'cannot join in game',
        });
    }
};

exports.getState = async (req, res) => {
    try {
        const game = await Game.findOne({token: req.gameToken}); 
        if (!game) {
            res.json({
                status: 'error',
                message: 'not find game',
            });
        }
        res.json({
            status: 'ok',
            turn: req.username === game.turn ? true : false,
            duration: game.created - Date.now(),
            field: game.field,
            winner: game.winner,
        });
    } catch (err) {
        res.json({
            status: 'error',
            message: 'not find game',
        });
    }
};

exports.makeMove = async (req, res) => {
    try {
        const game = await Game.findOne({token: req.gameToken});
        if (req.row > game.size || req.col > game.size) {
            return res.json({
                status: 'error',
                message: `incorrect row or col. field size = ${game.size}`,
            });
        }

        const sign = game.firstPlayer === req.username ? 'X' : 'O';
        const index = req.col * size + (req.row - 1);
        if (game.field[index] !== 'E') {
            return res.json({
                status: 'error',
                message: 'cell not empty',
            });
        }
        game.field.splice(index, 1, sign);

        await game.save();

        res.json({
            status: 'ok',
        });
    } catch (err) {
        res.json({
            status: 'error',
            message: 'cannot make move',
        });
    }
};
