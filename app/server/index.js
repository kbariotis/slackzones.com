const express = require('express');
const http = require('http');
const path = require('path');

const asyncMiddleware = require('./utils/asyncMiddleware');
const WebSocket = require('ws');

const __DEVELOPMENT__ = process.env.NODE_ENV === 'development';
const __PRODUCTION__ = process.env.NODE_ENV === 'production';

const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const webpackConfig = require('./../webpack.config');
const compiler = webpack(webpackConfig);

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

app.use(express.static(path.join(__dirname, '../public')));

if (__PRODUCTION__) {
  const stats = require(path.join(__dirname, '../stats.json'));
  const mainFileName = `dist/${stats.assetsByChunkName.main[0]}`;
  const mainCSSName = `dist/${stats.assetsByChunkName.main[1]}`;
  app.locals = {
    mainFileName,
    mainCSSName
  };
}

if (__DEVELOPMENT__) {
  app.use(
    middleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      serverSideRender: true
    })
  );
  app.use((req, res, next) => {
    const mainFileName = `dist/${res.locals.webpackStats.toJson().assetsByChunkName.main}`;
    res.locals = {
      mainFileName
    };

    next();
  });
}

app.get('/slack_redirect', asyncMiddleware(require('./controllers/http/slack_redirect')));
app.get('/', asyncMiddleware(require('./controllers/http/index')));
app.get('/map', asyncMiddleware(require('./controllers/http/map')));

app.use((err, req, res, next) => { /* eslint-disable-line */
  console.log(err)
  res.send('<h1>Error</h1>');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', require('./controllers/socket/connection'));

server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});
