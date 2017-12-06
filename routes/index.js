const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authController = require('../controllers/authController');

router.post('/new_game', authController.createToken, gameController.createGame);
router.post('/join_game', authController.createToken, gameController.joinGame);
router.post('/make_move', authController.verifyToken, gameController.makeMove);
router.get('/state/:gameToken', authController.verifyToken, gameController.getState);

module.exports = router;
