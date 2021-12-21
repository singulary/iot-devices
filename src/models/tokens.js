const { Schema, model, models, Types } = require('../database');
const { v4: uuid } = require('uuid');

const SCHEMA = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            required: true,
            ref: 'users',
        },
        deviceId: {
            type: Types.ObjectId,
            required: true,
            ref: 'devices',
        },
        token: {
            type: String,
            unique: true,
            default: uuid,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 60,
        },
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                delete ret._id;
            }
        }
    }
);

const DeviceTokens = models.device_tokens || model("device_tokens", SCHEMA);

module.exports = DeviceTokens;