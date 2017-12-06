const jwt = require('jsonwebtoken');

exports.createToken = (req, res, next) => {
    const payload = {
        name: req.body.name,
    };
    let token = jwt.sign(payload, process.env.SECRET, {expiresIn: 3600}); // 1 hour
    req.accessToken = token;
    next();
};

exports.verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (!token) {
        return res.json({
            status: 'error',
            message: 'No token provided',
        });
    }
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
        if (err) {
            return res.json({
                success: 'error',
                message: 'Failed to authenticate token',
            });
        }
        req.username = decoded.name;
        next();
    });
};
