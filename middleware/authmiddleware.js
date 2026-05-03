const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

    // 1. token lena
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "No token, access denied" });
    }

    try {
        // 2. verify token
        const decoded = jwt.verify(token, "secretkey");

        // 3. user info request me attach karna
        req.user = decoded;

        // 4. next route pe jana
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;