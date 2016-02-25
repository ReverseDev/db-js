var _client;

/**
 * Function to set the current client of the database.
 * The client need to have a connect method.
 * @public
 * @param {Object} client new Client object
 */
function setClient(client) {
  'use strict';

  _client = client;
}

/**
 * Function that realize the connection into database.
 * @private
 * @return {Promise} Unresolved promise until the connection was realized.
 */
function _connect() {
  'use strict';

  return new Promise(function(resolve, reject) {
    _client.connect(function(error, client, done) {
      if (error) {
        reject(error);
        console.error('Connection error!', error);
        return;
      }

      resolve({
        client: client,
        done: done
      });
    });
  });
}

/**
 * Function that make a SELECT query into database.
 * @param  {Object} queryObj Object used to create the SELECT query:
 *                              {Array} columns      Array of columns to select or the '*' string
 *                              {Array|String} from  Array or string of tables to select
 *                              {Array|String} where Array or string of all the where conditions.
 * @return {Promise} Promise unresolved until the request finish
 */
function select(queryObj) {
  'use strict';
  return _connect().then(function(data) {
    return _makeQuery(data, createQuery(queryObj));
  });
}

/**
 * Function that make a INSERT query into database.
 * @param  {Object} queryObj Object used to create the INSERT query:
 *                              {String} into      String of the table to insert
 *                              {Array}  columns   Array of columns to insert
 *                              {Array}  values    Array of all the values to insert.
 * @return {Promise} Promise unresolved until the request finish
 */
function insert(queryObj) {
  'use strict';

  return _connect().then(function(data) {
    return _makeQuery(data, createInsertQuery(queryObj), queryObj.values);
  });
}

/**
 * Function that make the query into the client
 * @private
 * @param  {Object} data   Object with the client object and the done function
 * @param  {String} query  Query to execute
 * @param  {Object} values Values to be inserted
 * @return {Promise} Promise unresolved until the request finish.
 */
function _makeQuery(data, query, values) {
  'use strict';

  return new Promise(function(resolve, reject) {
    data.client.query(query, values, function(error, query) {
      data.done();

      if (error) {
        reject({
          data: 'Error executin ' + query + ' query!'
        });
      } else {
        resolve(query && query.rows);
      }
    });
  });
}

/**
 * Function that create the SELECT query string.
 * @param  {Object} queryObj Object used to create the SELECT query:
 *                              {Array} columns      Array of columns to select or the '*' string
 *                              {Array|String} from  Array or string of tables to select
 *                              {Array|String} where Array or string of all the where conditions.
 * @return {String} Return the SELECT query string.
 */
function createQuery(queryObj) {
  'use strict';

  var query = 'SELECT ';
  query += _createColumnsQuery(queryObj.columns);

  query += ' FROM ';
  query += _createTablesQuery(queryObj.from);

  query += _createWhereQuery(queryObj.where);

  return query + ';';
}

/**
 * Function that create the INSERT query string.
 * @param  {Object} queryObj Object used to create the INSERT query:
 *                              {String} into      String of the table to insert
 *                              {Array}  columns   Array of columns to insert
 *                              {Array}  values    Array of all the values to insert.
 * @return {String} Return the INSERT query string.
 */
function createInsertQuery(queryObj) {
  'use strict';

  var query = 'INSERT INTO ' + queryObj.into + ' (';
  query += _createColumnsQuery(queryObj.columns) + ')';

  query += _createValuesQuery(queryObj.values);

  return query + ';';
}

/**
 * Function that join the array of columns into a string.
 * @private
 * @param  {Array} columns Array of columns to be joined
 * @return {String}        String with the joined columns
 */
function _createColumnsQuery(columns) {
  'use strict';

  if (!columns || columns === '*') {
    return '*';
  }

  return columns.join(',');
}

/**
 * Function that join the array of tables into a string.
 * @private
 * @param  {Array|String} tables Array of tables to be joined
 * @return {String}              String with the joined tables
 */
function _createTablesQuery(tables) {
  'use strict';

  if (!(tables instanceof Array)) {
    tables = [tables];
  }

  return tables.join(',');
}

/**
 * Function that join the array of where into a string.
 * @private
 * @param  {Array} where Array of where to be joined
 * @return {String}        String with the joined where
 */
function _createWhereQuery(where) {
  'use strict';

  var query = ' WHERE ';
  var isString = typeof where === 'string';
  var isArray = where instanceof Array;

  if (!(isArray || isString)) {
    return '';
  }

  if (isString) {
    query += where;
  } else {
    query += where.join(' ');
  }

  return query;
}

/**
 * Function that join the array of values into a string.
 * @private
 * @param  {Array} values Array of values to be joined
 * @return {String}        String with the joined values
 */
function _createValuesQuery(values) {
  'use strict';

  var query = ' VALUES (';

  query = values.reduce(function(query, value, key) {
    if (query[query.length - 1] !== '(') {
      query += ',';
    }

    return query + '$' + (key + 1);
  }, query);

  return query + ')';
}

module.exports = {
  select: select,
  insert: insert,
  setClient: setClient,
  createQuery: createQuery
};
