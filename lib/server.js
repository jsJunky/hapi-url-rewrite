import path from 'path';
import React from 'react';
import {Server} from 'hapi';
import ShortHash from 'shorthash';
import { RoutingContext, match } from 'react-router';
import loadPlugins from './loadPlugins';
import routes from './app/routes';

const server = new Server();
server.connection({ port: 8000 });

/**
 * Sets up a sample route.
 */
function code() {
  server.route([
    {
      method: 'GET',
      path: '/{p*}',
      handler: {
        directory: {
          path: path.resolve(__dirname, 'public')
        }
      }
    },
    {
      method: 'GET',
      path: '/bundle.js',
      handler: {
        file: {
          path: path.resolve(__dirname, 'public/js/dist/bundle.js')
        }
      }
    },
    {
      method: 'POST',
      path: '/url-shortener/{url}',
      handler: (request, reply) => {
        const db = request.server.plugins['hapi-mongodb'].db;
        const url = ShortHash.unique(request.params.url);
        db.collection('urls').insert({url: url, originalUrl: request.params.url}, (err, result) => {
          if (err) {
            console.log('error: ',err);
            return reply(err);
          }
          return reply({url: url});
        });
      }
    },
    {
      method: 'GET',
      path: '/url-shortener/{url}',
      handler: (request, reply) => {
        const db = request.server.plugins['hapi-mongodb'].db;
        db.collection('urls').findOne({url: request.params.url}, (err, result) => {
          if (err) {
            console.log('error: ',err);
            return reply(err);
          }
          return reply(result);
        });
      }
    }
  ]);

  server.ext('onPreResponse', (request, reply) => {
    if (typeof request.response.statusCode !== 'undefined') {
      return reply.continue();
    }

    const location = request.url;

    match({ routes, location }, (err, redirectLocation, renderProps) => {
      if (redirectLocation) {
        return reply.redirect(
          `${redirectLocation.pathname}${redirectLocation.search}`
        );
      }

      if (err || !renderProps) {
        return reply.continue();
      }

      const InitialComponent = <RoutingContext {...renderProps} />;
      const componentHTML = React.renderToString(InitialComponent);

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>hapi-url-rewrite</title>
        </head>
        <body>
          <div id="react-view">${componentHTML}</div>
          <script type="application/javascript" src="/bundle.js"></script>
        </body>
        </html>`;

      reply(html);
    });
  });
}

function startServer() {
  server.start(() => {
    server.log(
      ['hapi-url-rewrite', 'info'],
      `Server running at: ${server.info.uri}`
    );
  });
}

function logErrors(err) {
  server.log(['hapi-url-rewrite', 'error'], err);
}

// Loading Production plugins.
// devMode plugins are conditionally loaded.
loadPlugins(server, process.env.NODE_ENV === 'development')
  .then(code)
  .then(startServer)
  .catch(logErrors);
