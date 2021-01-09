const { execSync } = require('child_process')

execSync('npm run devBuild --prefix ' + __dirname + '/../../goroxels-client')

require('../utils/copyConfig');
console.log('config copied');
require('../utils/copyPublic');
console.log('public copied');
require('./index');