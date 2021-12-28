const { Types } = require('mongoose');
const { version, validate } = require('uuid');
const Devices = require('../models/devices');
const DeviceHistory = require('../models/history');
const Tokens = require('../models/tokens');

module.exports = {
    verify: async (req, res) => {
        const { token: queryToken } = req.params;
        const { authorization } = req.headers;

        if (!(queryToken && authorization && Types.ObjectId.isValid(authorization)))
            return res.json({ error: true, code: 1 });

        const device = await Devices.findOne({ _id: authorization }).exec();

        if (!device)
            return res.json({ error: true, code: 2 });

        const deleted = await Tokens.deleteOne({ userId: device.userId, deviceId: device._id, token: queryToken }).exec();
        if (!(deleted && deleted.deletedCount && deleted.deletedCount > 0))
            return res.json({ error: true, code: 3 });

        await DeviceHistory.create({ userId: device.userId, deviceId: device.id });

        return res.json({ error: false, code: 0 });
    }
};