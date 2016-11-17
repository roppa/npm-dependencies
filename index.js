'use strict';

const fs = require('fs');

function listify(collection) {

  if (!(Array.isArray(collection))) {
    throw new Error('You must pass an array');
  }

  let keys = {};

  collection.forEach(element => {
    if (element.resolved) {
      keys[element.resolved] = null;
    } else if (element.name) {
      let name = element.name;
      if (element.version) {
        name += '@' + element.version;
      }

      keys[name] = null;
    } else {
      return;
    }

    if (element.dependencies) {
      Object.keys(element.dependencies).forEach(key => {

        if (element.dependencies[key].version) {
          keys[key + '@' + element.dependencies[key].version] = key;
        } else {
          keys[key] = key;
        }

        if (element.dependencies[key].dependencies) {
          let dependents = [];
          for (let item in element.dependencies[key].dependencies) {
            dependents.push(Object.assign({ name: item },
              element.dependencies[key].dependencies[item]));
          }

          listify(dependents)
            .forEach(item => {
              keys[item] = item;
            });
        }

      });
    }

  });

  return Object.keys(keys);

}

module.exports = (directory) => {

  let modules = [];

  fs.readdir(directory, (error, files) => {
    files.forEach(file => {
      if (~file.indexOf('.json')) {
        modules.push(new Promise((resolve, reject) => {

          let pkg = '';
          let reader = fs.createReadStream(`${directory}/${file}`);

          reader.on('data', chunk => pkg += chunk);
          reader.on('end', () => {
            resolve(JSON.parse(pkg.toString()));
          });

        }));
      }
    });

    Promise
      .all(modules)
      .then(values => {
        fs.writeFile('export.json', JSON.stringify(listify(values)), error => {
          if (error) {
            return console.log(error);
          }

          console.log('Done');
        });
      })
      .catch(error => {
        console.log('Error!!!!', error);
      });

  });

};
