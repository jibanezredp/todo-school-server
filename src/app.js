import path from 'path';
import http from 'http';
import async from 'async';
import { default as bodyParser } from 'body-parser';
import express from 'express';
import { init as initPing } from './ping';
import { init as initVersion } from './version';
import { init as initTodo } from './todo';

const url = (host, server) => 'http://' + host + ':' + server.address().port;

export function start(config, resources, cb) {
  const app = express();
  const httpServer = http.createServer(app);

  function stop(cb) {
    httpServer.close(() => {
      console.log('HTTP server stopped.');
      httpServer.unref();
      cb();
    });
  }

  async.parallel({
    // init http depending on param.js
    http(cb) {
      const { port, host } = config;
      httpServer.listen(port, host, () => {
        console.log(`HTTP server listening on: ${url(host, httpServer)}`);
        cb();
      });
    },
  }, function(err) {
    if (err) return cb(err);

    // register middleware, order matters

    // remove for security reason
    app.disable('x-powered-by');

    // usually node is behind a proxy, will keep original IP
    app.enable('trust proxy');

    // register bodyParser to automatically parse json in req.body and parse url
    app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    app.use(bodyParser.json({limit: '10mb', extended: true}));

    // CORS
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      if (req.method === 'OPTIONS') {
        res.send(200);
      } else {
        next();
      }
    });

    initPing(app, resources);
    initVersion(app, resources);
    initTodo(app, resources);

    // register custom logger middleware
    app.use((req, res, next) => {
      console.log(`${Date.now()}::${req.method}::${req.originalUrl}`);
      next();
    });

    // Generate a 500 error
    // app.use((req, res, next) => {
    //   next({ message: '500', stack: 'Fake error 500' });
    // });

    // handle 404
    app.use((req, res, next) => {
      res.status(404).json({ error: 'not found' });
      next();
    });

    // register custom error handler middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: err.message })
    });

    cb(null, { stop, url: url(config.host, httpServer) });
  });
}
