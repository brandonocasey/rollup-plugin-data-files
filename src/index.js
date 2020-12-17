const path = require('path');
const fs = require('fs');
const matched = require('matched');
const {createFilter} = require('@rollup/pluginutils');

const readFilePromise = function(f) {
  return new Promise(function(resolve, reject) {
    fs.readFile(f, function(err, buffer) {
      if (err) {
        return reject(err);
      }

      return resolve(buffer);
    });
  });
};

const defaultTransform = function(files, type) {
  let output = '' +
    'const atob = require("rollup-plugin-data-files/src/atob");\n' +
    'const strToUint8 = require("rollup-plugin-data-files/src/str-to-uint8");\n' +
    'module.exports = {\n';

  files.forEach(function({filepath, contents}) {
    output += `'${path.basename(filepath)}': () => `;
    const base64 = `atob('${Buffer.from(contents).toString('base64')}')`;

    if (type === 'string') {
      output += base64;
    } else if (type === 'binary' || !type) {
      output += `strToUint8(${base64})`;
    }

    output += ',\n';
  });

  output += '};\n';

  return output;
};

const getKey = (id) => id.split('!')[1].replace(/.js$/, '') + '.js';

module.exports = function(keys) {
  const keyConf = {};

  Object.keys(keys).forEach(function(key) {
    keyConf[key + '.js'] = Object.assign({}, keys[key]);
    keyConf[key + '.js'].originalKey = key;
  });
  return {
    name: 'dataFiles',
    resolveId(id, importee) {
      if (id.indexOf('data-files!') !== 0) {
        return;
      }

      const key = getKey(id);

      if (!keyConf[key]) {
        this.error(`found a data-files! import without a matching key of ${key}`);
        return;
      }

      return `data-files!${key}`;
    },
    load(id) {
      if (id.indexOf('data-files!') !== 0) {
        return;
      }

      const key = getKey(id);

      const {transform, include, exclude, originalKey} = keyConf[key];
      const filter = createFilter(include, exclude);
      const globs = Array.isArray(include) ? include : [include];

      return Promise.all(globs.map((glob) => {
        return matched(glob);
      })).then((allMatches) => {
        const promises = [];

        allMatches.forEach((matches) => {
          matches.forEach((filepath) => {
            // this file is excluded
            if (filter(filepath)) {
              return;
            }
            // add any file/directory to watch list
            this.addWatchFile(filepath);

            // do not add directories as files to be read.
            if (!fs.statSync(filepath).isFile()) {
              return;
            }
            const p = readFilePromise(filepath).then(function(contents) {
              return Promise.resolve({filepath, contents});
            });

            promises.push(p);
          });
        });

        return Promise.all(promises);
      }).then((files) => {
        if (typeof transform === 'function') {
          return Promise.resolve(transform(files));
        }

        return Promise.resolve(defaultTransform(files, transform));
      }).then((output) => {
        return Promise.resolve(`/* rollup-plugin-data-files start ${originalKey} */\n` +
          output + '\n' +
          `/* rollup-plugin-data-files end ${id} */\n`);
      });
    }
  };
};
