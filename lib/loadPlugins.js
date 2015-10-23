import good from 'good';
import goodConsole from 'good-console';
import hapiPkg from 'hapi-pkg';
import hapiMongo from 'hapi-mongodb';
import inert from 'inert';
import vision from 'vision';
import {version} from '../package.json';

const goodPlugin = {
  register: good,
  options: {
    reporters: [
      {
        reporter: goodConsole,
        events: { response: '*', log: '*', error: '*' }
      }
    ],
    responsePayload: true
  }
};

const pkgPlugin = {
  register: hapiPkg,
  options: {
    pkg: { status: 'ok', version },
    endpoint: 'healthcheck',
    config: { auth: false, description: 'Health status and version' }
  }
};

const hapiMongPlugin = {
  register: hapiMongo,
  options: {
    url: 'mongodb://localhost:27017/urlshortener',
    settings: {
      db: {
        native_parser: false
      }
    }
  }
};

/**
 * Loads plugins and returns a promise is resolved when all of the plugins
 * are finished loading. The promise is rejected if any errors occur.
 *
 * - good / goodConsole app logging.
 * - The healthcheck plugin
 *
 * @param server
 * @param devMode
 * @returns {Promise}
 */
function loadPlugins(server, devMode = false) {
  return new Promise((resolve, reject) => {
    // Put production necessary plugins here.
    let plugins = [
      inert,
      vision,
      goodPlugin,
      pkgPlugin,
      hapiMongo
    ];

    if (devMode) {
      // Add your dev plugins here.
      plugins = [ ...plugins ];
    }

    server.register(plugins, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export default loadPlugins;
