var db = require('../db');
var ClientMock = require('./client.mock');
var assert = require('assert');
var expect = require('expect');

describe('DB', function() {
  'use strict';

  beforeEach(function() {
    var clientMock = new ClientMock();

    db.setClient(clientMock);
  });

  describe('createQuery():', function() {
    it('should create a SELECT query with columns and table.', function() {
      var query = db.createQuery({
        columns: ['column1', 'column2'],
        from: ['table']
      });

      assert.equal(query, 'SELECT column1,column2 FROM table;');
    });

    context('when passed an Array of tables', function() {
      it('should return a SELECT query with JOIN tables.', function() {
        var query = db.createQuery({
          columns: ['column1', 'column2'],
          from: ['table1', 'table2']
        });

        assert.equal(query, 'SELECT column1,column2 FROM table1,table2;');
      });
    });

    context('when passed an Array of where', function() {
      it('should return a SELECT query with the WHEREs conditions', function() {
        var query = db.createQuery({
          columns: ['column1', 'column2'],
          from: ['table1', 'table2'],
          where: [
            'table1.column1 = table2.column1 and',
            'table1.column1 = table2.column2'
          ]
        });

        var queryExpected = 'SELECT column1,column2 ';
        queryExpected += 'FROM table1,table2 ';
        queryExpected += 'WHERE table1.column1 = table2.column1 ';
        queryExpected += 'and table1.column1 = table2.column2;';

        assert.equal(query, queryExpected);
      });
    });

    context('when passed a String of where', function() {
      it('should return a SELECT query with the WHERE condition.', function() {
        var query = db.createQuery({
          columns: ['column1', 'column2'],
          from: ['table1', 'table2'],
          where: 'table1.column1 = table2.column1'
        });

        var queryExpected = 'SELECT column1,column2 ';
        queryExpected += 'FROM table1,table2 ';
        queryExpected += 'WHERE table1.column1 = table2.column1;';

        assert.equal(query, queryExpected);
      });
    });
  });

  describe('select():', function() {
    beforeEach(function() {
      db.setClient(new ClientMock());
    });

    it('should resolve a promise with the query rows.', function(done) {
      db.select({
        columns: ['column1', 'column2'],
        from: ['table1', 'table2'],
        where: 'table1.column1 = table2.column1'
      }).then(function(rows) {
        assert.equal(rows instanceof Array, true);
        done();
      });
    });
  });

  describe('insert():', function() {
    var client;

    beforeEach(function() {
      client = new ClientMock();

      expect.spyOn(client, 'query').andCall(function(query, values, callback) {
        callback();
      });

      db.setClient(client);
    });

    it('should call the query method with the INSERT query.', function(done) {
      db.insert({
        into: 'table1',
        columns: ['column1', 'column2'],
        values: ['value1', 'value2']
      }).then(function() {
        expect(client.query.calls[0].arguments[0])
          .toEqual('INSERT INTO table1 (column1,column2) VALUES ($1,$2);');
        expect(client.query.calls[0].arguments[1])
          .toEqual(['value1', 'value2']);

        client.query.restore();
        expect.restoreSpies();

        done();
      });
    });
  });
});
