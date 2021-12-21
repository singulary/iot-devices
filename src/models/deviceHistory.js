const { Schema, model, models } = require('../database');

const SCHEMA = new Schema(
    {
        userId: {
            type: String,
            required: true,
            ref: 'users',
        },
        deviceId: {
            type: String,
            required: true,
            ref: 'devices',
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: '180d',
        }
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                delete ret._id;
            }
        }
    }
);

const DeviceHistory = models.device_history || model("device_history", SCHEMA);

module.exports = DeviceHistory;