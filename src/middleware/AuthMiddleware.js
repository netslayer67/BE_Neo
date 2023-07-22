const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants')

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const [bearer, token] = authHeader.split(' ');

        if (!token || bearer !== 'Bearer' || token == 'null') {
            return res.status(400).json({ message: 'Unauthorized' });
        }

        const decoded = await jwt.verify(token, JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = { ...decoded };
        // console.log(req.user);

        return next();
    } catch (error) {
        console.error('Failed to authenticate token:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
