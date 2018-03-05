const randomstring = require('randomstring');
const Game = require('../models/Game');
const handler = require('../handlers/checkHandler');

const EMPTY_SIGN = 'E';
const FIRST_PLAYER_SIGN = 'X';
const SECOND_PLAYER_SIGN = 'O';
const FIVE_MINUTE = 300000;

exports.createGame = async (req, res) => {
    try {
        if (req.body.size > 9) {
            return res.json({
                status: 'error',
                message: 'size must be less 10',
            });
        }
        let arr = [];
        let matrix = [];
        let gameToken = randomstring.generate();

        for (let i = 0; i < req.body.size; i++) {
            arr.push(EMPTY_SIGN);
        }

        for (let i = 0; i < req.body.size; i++) {
            matrix.push(arr);
        }
        const game = new Game({
            firstPlayer: req.body.name,
            secondPlayer: undefined,
            field: matrix,
            turn: req.body.name,
            token: gameToken,
            size: req.body.size,
            winner: undefined,
            endGame: Date.now() + FIVE_MINUTE, // 5 minute
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
        const game = await Game.findOne({token: req.body.gameToken});
        if (!game) {
            return res.json({
                status: 'error',
                message: 'not find game',
            });
        }
        if (game.secondPlayer === undefined) {
            game.endGame = Date.now() + FIVE_MINUTE;
            game.secondPlayer = req.body.name;
            await game.save();
        }

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
        const game = await Game.findOne({token: req.params.gameToken});
        if (!game) {
            return res.json({
                status: 'error',
                message: 'not find game',
            });
        }

        if (Date.now() > game.endGame) {
            await game.save(); // ?
            await Game.remove({token: req.params.gameToken});
            res.json({
                status: 'error',
                message: 'game deleted',
            });
        } else {
            res.json({
                status: 'ok',
                turn: req.username === game.turn ? true : false,
                duration: Date.now() - game.created,
                field: game.field,
                winner: game.winner,
            });
        }
    } catch (err) {
        res.json({
            status: 'error',
            message: 'not find game',
        });
    }
};

exports.makeMove = async (req, res, next) => {
    try {
        const game = await Game.findOne({token: req.body.gameToken});
        if (game.winner !== undefined) {
            return res.json({
                status: 'error',
                message: `we have winner ${game.winner}`,
            });
        }

        if (req.body.row > game.size || req.body.col > game.size) {
            return res.json({
                status: 'error',
                message: `incorrect row or col. field size = ${game.size}`,
            });
        }

        if (req.username !== game.turn) {
            return res.json({
                status: 'error',
                message: `you cant move, turn: ${game.turn}`,
            });
        }

        const sign = game.firstPlayer === req.username ? FIRST_PLAYER_SIGN : SECOND_PLAYER_SIGN;

        if (game.field[req.body.row - 1][req.body.col - 1] !== EMPTY_SIGN) {
            return res.json({
                status: 'error',
                message: 'cell not empty',
            });
        }

        game.field[req.body.row - 1].splice(req.body.col - 1, 1, sign);

        game.turn = game.turn === game.firstPlayer ? game.secondPlayer : game.firstPlayer;
        game.endGame = Date.now() + FIVE_MINUTE;

        await game.save();

        next();
    } catch (err) {
        res.json({
            status: 'error',
            message: 'cannot make move',
        });
    }
};

exports.checkWinner = async (req, res) => {
    try {
        const game = await Game.findOne({token: req.body.gameToken});

        if (handler.checkDiagonal(game.field, game.size, FIRST_PLAYER_SIGN)
            || handler.checkLanes(game.field, game.size, FIRST_PLAYER_SIGN)) {
            game.winner = game.firstPlayer;
        } else if (handler.checkDiagonal(game.field, game.size, SECOND_PLAYER_SIGN)
            || handler.checkLanes(game.field, game.size, SECOND_PLAYER_SIGN)) {
            game.winner = game.secondPlayer;
        }

        await game.save();

        res.json({
            status: 'ok',
            winner: game.winner === undefined ? 'none' : game.winner,
        });
    } catch (err) {
        res.json({
            status: 'error',
            message: 'cannot find winner',
        });
    }
};
