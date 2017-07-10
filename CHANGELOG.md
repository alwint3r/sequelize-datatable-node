Project History
===============

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).

### [v1.2.1] - 2017-07-10

#### Added
* Test for mysql database.

#### Fixed
* Search error on mysql dialect. [#1](https://github.com/alwint3r/sequelize-datatable-node/issues/1)

### [v1.2.0] - 2016-12-09

#### Added
* Better support for searching & ordering on relational table.
* Case-insensitive search options for postgresql.

#### Changed
* Using side-effect instead of lodash's `cloneDeep` to avoid damaging model object.
* A lot of internal change that should not affect how user use this module.

### [v1.1.0] - 2016-12-02

#### Added
* Support for searching & ordering on relational table.

### v1.0.0 - 2016-12-01

Initial release.

#### Added
* Support for postgresql database engine.
* Test cases (using docker for database server).
* Support ordering & search on single table.

[v1.1.0]: https://github.com/alwint3r/sequelize-datatable-node/compare/v1.0.0...v1.1.0
[v1.2.0]: https://github.com/alwint3r/sequelize-datatable-node/compare/v1.1.0...v1.2.0
[v1.2.1]: https://github.com/alwint3r/sequelize-datatable-node/compare/v1.2.0...v1.2.1
