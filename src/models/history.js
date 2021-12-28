const { Schema, Types, model, models } = require('../database');

const SCHEMA = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            required: true,
            ref: 'users'
        },
        deviceId: {
            type: Types.ObjectId,
            required: true,
            ref: 'devices'
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    }
);

const History = models.device_history || model("device_history", SCHEMA);

module.exports = History;