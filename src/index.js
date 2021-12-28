if (process.env.PORT) {
    console.log("prod port");
    
    require('./routes').listen(process.env.PORT);
} else {
    console.log("dev port");

    require('dotenv').config({ path: '.env.local' });
    require('./routes').listen(3000);
}