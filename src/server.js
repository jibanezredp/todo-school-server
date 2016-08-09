import * as app  from './app';

const version = require('../package.json').version;
const resources = { version };

export function create(config) {
  let promise = new Promise((resolve, reject) => {
    app.start(config.server, resources, (err, server) => {
      if (err) reject(err);
      resolve({ server, resources });
    });
  });

  return promise;
}
