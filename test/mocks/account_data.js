const crypto = require(`crypto`);

module.exports = [
  {
    email: `alwin.ridd@gmail.com`,
    password: crypto.createHash(`sha1`).update(`winter`).digest(`hex`),
  },
  {
    email: `jane@janedoe.com`,
    password: crypto.createHash(`sha`).update(`janedoe`).digest(`hex`),
  },
];
