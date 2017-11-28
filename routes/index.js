const express = require('express');
const router = express.Router();

router.post('/new_game');
router.post('/join_game');
router.post('/make_move');
router.get('/state');

module.exports = router;
