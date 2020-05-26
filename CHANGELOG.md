Change log
===============

### v3.0.0-0 - 2020-05-25

* Add column search, regex search
* Support for sequelize v5
* Test with sqlite, added more tests

### v2.0.0-0 - 2018-05-29

* Rewrite all codes in ES6
* Add full support for Sequelize v4

### v1.2.1 - 2017-07-10

* Add test for mysql database.
* Fix search error on mysql dialect. [#1](https://github.com/alwint3r/sequelize-datatable-node/issues/1)

### v1.2.0 - 2016-12-09

* Add better support for searching & ordering on relational table.
* Add case-insensitive search options for postgresql.
* Using side-effect instead of lodash's `cloneDeep` to avoid damaging model object.
* Change a lot of internal change that should not affect how user use this module.

### v1.1.0 - 2016-12-02

* Support for searching & ordering on relational table.

### v1.0.0 - 2016-12-01

Initial release.

* Support for postgresql database engine.
* Test cases (using docker for database server).
* Support ordering & search on single table.
