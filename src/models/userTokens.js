const { Schema, model, models } = require('../database');
const { v4: uuid } = require('uuid');

const SCHEMA = new Schema(
    {
        userId: {
            type: String,
            required: true,
            ref: 'users',
        },
        token: {
            type: String,
            unique: true,
            default: uuid,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: '180d',
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

const UserTokens = models.user_tokens || model("user_tokens", SCHEMA);

module.exports = UserTokens;