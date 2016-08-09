import * as server from './server';
import config from './config';

server.create(config.dev)
  .then(() => console.log('ready...'))
  .catch(err => { throw err });
