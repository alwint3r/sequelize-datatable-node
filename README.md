Sequelize Datatables
====================

Server-side processing datatables with sequelize.

#### API

```
datatable(model: SequelizeModel required, config: Object required, params: Object) -> Object
```

This function takes three arguments to produce output for datatables.

* `model` - `required` - is the sequelize model.
* `config` - `required` - is config sent by jQuery datatables to our server.
* `params` - options for sequelize query.


```js
const datatable = require(`sequelize-datatables`);
const model = require(`./path/to/sequelize-model`); // Sequelize model

// assuming you are using express

route.get(`/datasource`, (req, res) => {
  datatable(model, req.query, {})
    .then((result) => {
      // result is response for datatables
      res.json(result);
    });
});
```

#### Todo

 - [X] Test with postgresql database
 - [X] Support global search
 - [ ] Test with another database server (mysql, mssql, sqlite)
 - [ ] Support individual column search

#### Testing

You must have docker installed on your system if you want to test this module on your machine.

```shell
git clone https://github.com/alwint3r/sequelize-datatable-node.git
cd sequelize-datatable-node
npm install

# clone the current terminal and move to the `sequelize-datatable-node` directory
npm run run-docker
# wait for the build process and database server initialization finished

# on another terminal, enter command
npm test
```

## License

The MIT License (MIT)
Copyright (c) 2016

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
