const fs = require('fs');
const path = require('path');


fs.copyFileSync(
    path.resolve(process.cwd(), '../sharedConfig.json'),
    path.resolve(process.cwd(), './shared/config.json')
)