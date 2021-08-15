module.exports = {
  extension: ['.ts'],
  recursive: true,
  exit: true,
  timeout: process.env.MOCHA_TIMEOUT || 300000,
};
