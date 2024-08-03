const path = require('path');

try { // optional
    // this code is used for overriding
    // ecosystem variables
    // (and system too, so be very careful)
    const fs = require('fs')
    const dotenv = require('dotenv')
    const envConfig = dotenv.parse(fs.readFileSync(path.join(__dirname, '../.env')));
    for (var k in envConfig) {
        process.env[k] = envConfig[k]
    }
} catch {}