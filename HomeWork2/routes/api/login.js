const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const secret = require('../../config/auth.json').secret;
const users = require('../../data/users.json');

router.post('/login', (req, res, next) => {
    let { username, password } = req.body;

    let [user] = users.filter(user => (user.username === username && user.password === password));

    if (!user) {
        res.status(401).json({ status: 'User not found' });
    }
    let jwt_token = jwt.sign(user, secret);

    res.cookie('token', jwt_token);
    
    res.redirect("/");
});

module.exports = router;