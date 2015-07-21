var express = require('express');
var mysql   = require('mysql');


var establishConnection = function establishConnection () {

  var defaults = require('./../../config/default.json');
  var dbConfig = defaults.dbc;
  
  var login = require('./../../../login.json');
  
  /** create connection **/
  var client = mysql.createConnection({
    host: dbConfig.host,
    user: login.user,
    password: login.pwd,
    database: dbConfig.dbase
  });


  console.log('connecting to database: ' + dbConfig.dbase);

  client.connect(null, 
    function (err, result) {
                if (err) { 
                        console.log('ERROR CONNECTING: ' + err);
                	res.send("ERROR");
		}
		console.log('established database connection');
  });

  return client;
}

var query = function query (q) {
    console.log('Query: ' + q);
}

exports.query = query;
exports.establishConnection = establishConnection;

exports.waterfall = function waterfall (tasks, cb) {
  
	var defaults = require('./../config/default.json');
  	var dbConfig = defaults.dbc;

    var client = mysql.createConnection({
    	host: dbConfig.host,
    	user: 'root',
    	password: 'etnedla',
    	database: dbConfig.dbase
  	}, function (err, client, done) {
        if (err) {
            return cb(err);
        }
 
        client.query(begin_transaction, function (err) {
            if (err) {
                done();
                return cb(err);
            }
             
            var wrapIterator = function (iterator) {
                return function (err) {
                    if (err) {
                        client.query(rollback_transaction, function () {
                            done();
                            cb(err);
                        });
                    }
                    else {
                        var args = Array.prototype.slice.call(arguments, 1);
                        var next = iterator.next();
                        if (next) {
                            args.unshift(client);
                            args.push(wrapIterator(next));
                        }
                        else {
                            args.unshift(client);
                            args.push(function (err, results) {
                                var args = Array.prototype.slice.call(arguments, 0);
                                if (err) {
                                    client.query(rollback_transaction, function () {
                                        done();
                                        cb(err);
                                    });
                                }
                                else {
                                    client.query(commit_transaction, function () {
                                        done();
                                        cb.apply(null, args);
                                    })
                                }
                            })
                        }
                        async.setImmediate(function () {
                            iterator.apply(null, args);
                        });
                    }
                };
            };
            wrapIterator(async.iterator(tasks))();
        });
    });
}
