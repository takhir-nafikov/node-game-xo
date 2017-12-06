const randomstring = require('randomstring');
const Game = require('../models/Game');

const EMPTY_SIGN = 'E';
const FIRST_PLAYER_SIGN = 'X';
const SECOND_PLAYER_SIGN = 'O';

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
        res.json({
            status: 'ok',
            turn: req.username === game.turn ? true : false,
            duration: Date.now() - game.created,
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

        if (checkDiagonal(game.field, game.size, FIRST_PLAYER_SIGN) || checkLanes(game.field, game.size, FIRST_PLAYER_SIGN)) {
            game.winner = game.firstPlayer;
        } else if (checkDiagonal(game.field, game.size, SECOND_PLAYER_SIGN) || checkLanes(game.field, game.size, SECOND_PLAYER_SIGN)) {
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
            message: 'cannot make move',
        });
    }
};

/**
 * @param {*} matrix
 * @param {*} size
 * @param {*} symb
 * @return {*}
 */
function checkDiagonal(matrix, size, symb) { 
    let toright = true;
    let toleft = true;
    for (let i = 0; i < size; i++) {
        toright &= (matrix[i][i] == symb);
        toleft &= (matrix[size-i-1][i] == symb);
    }

    if (toright || toleft) return true;

    return false;
};

/**
 * @param {*} matrix
 * @param {*} size
 * @param {*} symb
 * @return {*}
 */
function checkLanes(matrix, size, symb) { 
    let cols;
    let rows;
    for (let col = 0; col < size; col++) {
        cols = true;
        rows = true;
        for (let row = 0; row < size; row++) {
            cols &= (matrix[col][row] == symb);
            rows &= (matrix[row][col] == symb);
        }
        if (cols || rows) return true; 
    }

    return false;
};
