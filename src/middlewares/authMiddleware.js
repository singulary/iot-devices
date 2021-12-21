const UserTokens = require('../models/userTokens');

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization)
        return res.json({ error: true, logged: false, log: "Disconnected" });

    const user = await UserTokens.findOne({ token: authorization }).exec();

    if (!user)
        return res.json({ error: true, logged: false, log: "Invalid Auth" });

    req.user = user;

    return next();
};