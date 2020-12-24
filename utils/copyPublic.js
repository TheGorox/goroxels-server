const fs = require('fs-extra');
const path = require('path');

const publicPath = path.resolve(__dirname, '../public')

if(fs.existsSync(publicPath)){
    fs.rmdirSync(publicPath, {
        recursive: true,
        force: true
    })
}

fs.copySync(
    path.resolve(__dirname, '../../goroxels-client/dist'),
    path.resolve(__dirname, '../public')
)