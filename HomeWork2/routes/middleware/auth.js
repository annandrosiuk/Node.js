const jwt = require('jsonwebtoken');
const secret = require('../../config/auth.json').secret;

module.exports = (req, res, next) => {
    if (req.cookies.token) {
        
        const jwt_token = req.cookies.token;

        let user = jwt.verify(jwt_token, secret);

        req.user = user;

    }

    next();
}