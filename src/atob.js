const atob = (s) => global.atob ? global.atob(s) : Buffer.from(s, 'base64').toString('binary');

module.exports = atob;
