const { Schema, model, models } = require('../database');
const { hash } = require('argon2');

const SCHEMA = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        createdAt: {
            type: Date,
            default: Date.now
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

SCHEMA.pre("save", async function (next) {
    this.password = await hash(this.password);

    next();
});

const Users = models.users || model("users", SCHEMA);

module.exports = Users;