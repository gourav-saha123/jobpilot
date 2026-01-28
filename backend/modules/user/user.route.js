const express = require('express');

const {registerUser} = require('./user.controller');

const router = express.Router();

router.post('/register', registerUser);

module.exports = router;