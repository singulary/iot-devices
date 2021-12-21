const Users = require('../models/users');
const UserTokens = require('../models/userTokens');

const { verify } = require('argon2');

module.exports = {
    register: async (req, res) => {
        const { name, username, email, password } = req.body;

        if (!(name && username && email && password))
            return res.json({ error: true });

        if (await Users.findOne({ $or: [{ username }, { email }] }).exec())
            return res.json({ error: true, log: "Username or email already exists" });

        const newUser = await Users.create({ name, username, email, password });
        if (!newUser)
            return res.json({ error: true, log: "Database Error" });

        const Token = await UserTokens.create({ userId: newUser._id });
        if (!Token)
            return res.json({ error: true, log: "Database Error" });

        return res.json({ error: false, token: Token.token });
    },
    login: async (req, res) => {
        const { username, password } = req.body;

        if (!(username && password))
            return res.json({ error: true });

        const user = await Users.findOne({ username }).select("+password").exec();
        if (!user)
            return res.json({ error: true, log: "user not found" });

        if (!await verify(user.password, password))
            return res.json({ error: true, log: "wrong password" });

        const Token = await UserTokens.create({ userId: user._id });
        if (!Token)
            return res.json({ error: true, log: "Database Error" });

        return res.json({ error: false, token: Token.token });
    },
    logout: async (req, res) => {
        const { authorization } = req.headers;

        if (!authorization)
            return res.json({ error: true });

        const result = await UserTokens.deleteOne({ token: authorization }).exec();
        if (!(result && result.deletedCount && result.deletedCount > 0))
            return res.json({ error: true });

        return res.json({ error: false });
    },
};