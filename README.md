# Dependencies

Generate a list of your apps' dependecies.

First things first, to get a list of modules used in your app run:

```
npm ls --json > packages.json
```

Run like:

```
> node
> fs.readFile('./packages.json', (error, data) => { data = JSON.parse(data); require('.')('./downloads', data)  });
```
