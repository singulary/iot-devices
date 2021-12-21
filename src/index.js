if (process.env.PORT) {
    require('./routes').listen(process.env.PORT);
} else {
    require('dotenv').config({ path: '.env.local' });
    require('./routes').listen(process.env.PORT);
}