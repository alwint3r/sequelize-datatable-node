'use strict';

const db = require(`./helpers/db`)();

require(`./models`)(db);

before(() => db.sync());
