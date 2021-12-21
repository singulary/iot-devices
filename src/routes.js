const { json: BodyParser } = require('body-parser');
const CookieParser = require('cookie-parser');
const Helmet = require('helmet');
const AuthMiddleware = require("./middlewares/authMiddleware");

const app = require('express')();

const DeviceController = require('./controllers/deviceController');
const AuthController = require('./controllers/authController');
const UserController = require('./controllers/userController');

app.use(CookieParser());
app.use(BodyParser());
app.use(Helmet());

app.post('/auth/register', AuthController.register);
app.post('/auth/login', AuthController.login);
app.get('/auth/logout', AuthController.logout);

app.use('/user', AuthMiddleware);
app.get('/user/me', UserController.getMe);
app.get('/user/devices', UserController.getDevices);
app.post('/user/device', UserController.addDevice);
app.delete('/user/device', UserController.deleteDevice);
app.get('/user/token/:deviceId', UserController.createToken);
app.delete('/user/token', UserController.deleteToken);

app.get('/device/verify/:token', DeviceController.verify);

app.use((req, res, next) => res.json({ error: true }));
app.use((err, req, res, next) => res.json({ error: true }));

module.exports = app;