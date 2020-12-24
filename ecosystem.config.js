module.exports = {
  apps : [{
    name: "goroxels",
    script: './src/devStart.js',
    env: {
      DB_ISLOCAL: 1,
      DB_LOG: 0,

      SESSION_SECRET: 'trapsaregays'
    }
  }]
};
