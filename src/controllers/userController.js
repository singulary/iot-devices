const { Types } = require('../database');

const Devices = require('../models/devices');
const Tokens = require('../models/tokens');
const Users = require('../models/users');

module.exports = {
    getMe: async (req, res) => {
        const { userId } = req.user;

        const user = await Users.aggregate([
            {
                $match: { _id: Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "devices",
                    localField: "_id",
                    foreignField: "owner",
                    as: "devicesCollection"
                }
            },
            {
                $set: {
                    devices: {
                        $map: {
                            input: "$devicesCollection",
                            as: 'device',
                            in: {
                                id: '$$device._id',
                                name: '$$device.name',
                                createdAt: '$$device.createdAt',
                            },
                        },
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    email: 0,
                    password: 0,
                    __v: 0,
                    devicesCollection: 0,
                }
            },
        ]).exec();

        if (!(user && user.length > 0))
            return res.json({ error: true, log: "Database Error" });

        return res.json({ error: false, data: user[0] });
    },
    getDevices: async (req, res) => {
        const { userId: owner } = req.user;

        const devices = await Devices.find({ owner }).select('name createdAt history').exec();
        if (!(devices && devices.length > 0))
            return res.json({ error: true, log: "No Devices" });

        return res.json({ error: false, data: devices });
    },
    addDevice: async (req, res) => {
        const { userId: owner } = req.user;
        const { name } = req.body;

        const device = await Devices.create({ owner, name: name || 'No Name' });

        if (!device)
            return res.json({ error: true });

        return res.json({ error: false, device: device._id });
    },
    deleteDevice: async (req, res) => {
        const { userId: owner } = req.user;
        const { device } = req.body;

        if (!device)
            return res.json({ error: true });

        const result = await Devices.deleteOne({ _id: device, owner }).exec();
        if (!(result && result.deletedCount && result.deletedCount > 0))
            return res.json({ error: true });

        return res.json({ error: false });
    },
    createToken: async (req, res) => {
        const { userId } = req.user;
        const { deviceId } = req.params;

        if (!(Types.ObjectId.isValid(deviceId)))
            return res.json({ error: true, log: "Invalid Device" });

        const Device = await Devices.findOne({
            $and: [
                { _id: deviceId },
                {
                    $or: [
                        { owner: userId },
                        { users: userId }
                    ]
                }
            ]
        }).exec();
        if (!Device)
            return res.json({ error: true, log: "Invalid Device or No Permissions" });

        const count = await Tokens.countDocuments({ deviceId: deviceId, userId }).exec();
        if (count > 5)
            return res.json({ error: true, log: "Max Tokens for this device" });

        const token = await Tokens.create({ userId, deviceId });
        if (!token)
            return res.json({ error: true, log: "Unknown error" });

        return res.json({ error: false, token: token.token });
    },
    deleteToken: async (req, res) => { },
    addPerm: {},
    removePerm: {},
};