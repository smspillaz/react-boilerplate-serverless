const fs = require('fs');

const React = require('react');
const ReactDOMServer = require('react-dom/server');

// Memory history
const createMemoryHistory = require('history/createMemoryHistory').default;

// Import root containers
const Root = require('../app/app').default;
const messages = require('../app/i18n').translationMessages;
const configureStore = require('../app/configureStore').default;

module.exports = (app) => {
  app.use((req, res) => {
    const memoryHistory = createMemoryHistory(req.url);
    memoryHistory.push(req.originalUrl);
    const store = configureStore({}, memoryHistory);
    const html = ReactDOMServer.renderToString(
      <Root messages={messages} history={memoryHistory} store={store} />
    );

    // This should read the compiled index.html file when running from the
    // webpack bundle and the non-compiled index.html file when running
    // from babel-node
    fs.readFile('./build/index.html', 'utf8', (err, data) => {
      // Set a dummy user agent based on the request user agent.
      global.navigator = { userAgent: req.headers['user-agent'] };
      res.send(data.replace(/<div id="app">\s*<\/div>/,
                            `<div id="app">${html}</div>`));
    });
  });
};