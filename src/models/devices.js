const { Schema, model, models, Types } = require('../database');

const SCHEMA = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            required: true,
            ref: 'users'
        },
        name: {
            type: String,
            default: 'Not nammed',
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

const Devices = models.devices || model("devices", SCHEMA);

module.exports = Devices;