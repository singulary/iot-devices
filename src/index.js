// To local development

require('dotenv').config({ path: '.env.local' });
require('./routes').listen(3000);