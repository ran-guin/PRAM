var express = require('express');
var router = express('Router');
var async      = require('async');
var _ = require('underscore');
var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();
var urlEncodedParser = bodyParser.urlencoded( { extended: false });

var config = require('./../config/default.json');

var client;

/** Standard Query **/

router.post('/qt', jsonParser, function (req, res) {
    if (! req.body) { 
        console.log('Error parsing body');
        res.send('no request');
    }
    
    var sent = req.body;
    var q = sent['query'];

    console.log("Posted query: " + q);
    console.log('sent: ' + JSON.stringify(sent));
    res.send(q);
});

router.post('/q', jsonParser, function (req, res) {
    var q = req.query['query'];
    var ss = req.query['search'] || '';
    var field = req.query['field'];
    var condition = req.query['condition'];
    var format = req.query['format'] || 'data';
    var type   = req.query['type'] || 'text';
    var title  = req.query['title'] || 'Query Results';
    var group = req.query['group'];

    if (! req.body) { 
        console.log('Error parsing body for q');
        console.log(req);
        res.send('no request');
    }
    
    var body = req.body;
    if (body['query']) { q = body['query'] }

    console.log("Posted query: " + q);
    if (! q.match(/ WHERE /) ) { q += ' WHERE 1' }

    if (ss) { 
        var search_condition = '';
        console.log('ss: ' + ss + '; type = ' + type);
        if (type == 'number' && ss.match(/(\d+)\-(\d+)/) ) {
            var range = ss.split('-');
            search_condition = field + ' BETWEEN ' + range[0] + ' AND ' + range[1];
        }
        else if (type == 'number' && ss.match(/^\<(\d+)/) ) {
            var val = ss.replace(/^</,'');
            search_condition = field + ' < ' + val;
            console.log("find options less than " + val)
        }
        else if (type == 'number' && ss.match(/^\>(\d+)/) ) {
            var val = ss.replace(/^>/,'');
            search_condition =  field + ' > ' + val;
        }
        else {  search_condition = field + " like '%" + ss + "%'" }
        console.log('sc: ' + search_condition);
    }

    if (condition) { search_condition = ' AND ' + condition }
    if (search_condition) { q += " AND " + search_condition }

    if (group) { q += " GROUP BY " + group }

    console.log('added condition: ' + condition);
    console.log("QUERY: " + q);
    async.series([
        function(cb){
                // do some stuff ...
            var db = require('../shared/js/dbc');
            dbc = db.establishConnection();
                
            console.log('Connected to Database');
                cb(null, dbc);
        },
        function (cb) {
            console.log('q0: ' + q);
            dbc.query(q, '%', function(err, rows, fields) {
            if (err) { cb(err) }
            else {
                cb(null, rows);
            }
                    });
        }
    ],
    function (err, results) {
        if (err) { 
            dbc.end();
            console.log("ASYNC Error in q post request: " + err);
            console.log("Q: " + q);
            res.status(500).send("Error generating Request Page");
        }
        else {
            dbc.end();
                if (format == 'html') { 
            console.log(rows);
            res.render('Request', { title : title, data : results[1] } );
            }
            else {
                res.send( results[1] );
            }
        }
    }); 
});

router.get('/q', function (req, res) {;
    var q = req.query['query'];
    var ss = req.query['search'] || '';
    var field = req.query['field'] ;
    var condition = req.query['condition'];
    var format = req.query['format'] || 'data';
    var type   = req.query['type'] || 'text';
    var title  = req.query['title'] || 'Query Results';
    var group = req.query['group'];
 
    console.log('api using get / q');
    if (! q.match(/ WHERE /) ) { q += ' WHERE 1' }

    if (ss) { 
        var search_condition = '';
        console.log('ss: ' + ss + '; type = ' + type);
        if (type == 'number' && ss.match(/(\d+)\-(\d+)/) ) {
            var range = ss.split('-');
            search_condition = field + ' BETWEEN ' + range[0] + ' AND ' + range[1];
        }
        else if (type == 'number' && ss.match(/^\<(\d+)/) ) {
            var val = ss.replace(/^</,'');
            search_condition = field + ' < ' + val;
            console.log("find options less than " + val)
        }
        else if (type == 'number' && ss.match(/^\>(\d+)/) ) {
            var val = ss.replace(/^>/,'');
            search_condition =  field + ' > ' + val;
        }
        else {  search_condition = field + " like '%" + ss + "%'" }
        console.log('sc: ' + search_condition);
    }
    else {
        console.log("no search condition");
    }

    if (condition) { search_condition = ' AND ' + condition }
    if (search_condition) { q += " AND " + search_condition }

    if (group) { q += " GROUP BY " + group }

    console.log('added condition: ' + condition);
    console.log("QUERY: " + q);
    async.series([
        function(cb){
                // do some stuff ...
            var db = require('../shared/js/dbc');
            dbc = db.establishConnection();
                
            console.log('Connected to Database');
                cb(null, dbc);
        },
        function (cb) {
            console.log('q0: ' + q);
            dbc.query(q, '%', function(err, rows, fields) {
            if (err) { cb(err) }
            else {
                cb(null, rows);
            }
                    });
        }
    ],
    function (err, results) {
        if (err) { 
            dbc.end();
            console.log("ASYNC Error in q get: " + err);
            console.log("Q: " + q);
            res.status(500).send({error : "Error generating Request Page"});
        }
        else {
            dbc.end();
            if (format == 'html') { 
                console.log(rows);
                res.render('Request', { title : title, data : results[1] } );
            }
            else {
                res.send( results[1] );
            }
        }
    }); 
});

router.get('/query/:query', function (req, res) {
    var q = req.params.query;
    console.log('q1: ' + q);
    var query = decodeURIComponent(q);
    console.log('query: ' + query);
    
    async.series([
        function(cb){
                // do some stuff ...
            var db = require('../shared/js/dbc');
            dbc = db.establishConnection();
                
            console.log('Connected to Database');
            cb(null, dbc);
        },
        function (cb) {
            console.log('q0: ' + q);
            dbc.query(q, '%', function(err, rows, fields) {
            if (err) { cb(err) }
            else {
                cb(null, rows);
            }
                    });
                 }
    ],
    function (err, results) {
        if (err) {
            dbc.end();
            console.log("ASYNC Error in query request: " + err);
            res.send("Error generating Request Page");
        }
        dbc.end();
        res.send( results[1] );
    } 
    );
});

/** Table specific Requests **/
router.get('/record/:table/:id', function (req, res) {
    var table = req.params.table;
    var id = req.params.id
    var fields = req.query['fields'];
    var add_tables = req.query['add_tables'];
    var add_condition = req.query['condition'];
    var getFields = fields || "*";

    if (add_tables) { table += ',' + add_tables }
    var q = "SELECT " + getFields + " FROM " + table + " WHERE " + table + "_ID = '" + id + "'";
    if (add_condition) { q += ' AND ' + add_condition }
    
    console.log(q);

    async.series([
        function(cb){
                // do some stuff ...
            var db = require('../shared/js/dbc');
            dbc = db.establishConnection();
                
            console.log('Connected to Database');
            cb(null, dbc);
        },
        function (cb) {
            console.log('q0: ' + q);
            dbc.query(q, id, function(err, rows, fields) {
            if (err) { cb(err) }
            else {
                cb(null, rows);
            }
                    });
                 }
    ],
    function (err, results) {
        if (err) {
            dbc.end();

            res.statusCode = 500;

            console.log("ASYNC Error in generic record retrieval: " + err);
            res.send("Error generating Request Page");
        }
        dbc.end();
        res.send( results[1] );
    } 
    );
});


/* Standard Update */

/** Table specific Requests **/

/** New Records **/
router.post('/create/:table', jsonParser, function (req, res) {
    var table = req.params.table;

    console.log('Add ' + table + ' Record');
    if (! req.body) { 
        console.log('Error parsing body');
        return res.sendStatus(400);
    }
    
    var obj = req.body;
    console.log(obj);

    var db = require('../shared/js/dbc');
    var dbc = db.establishConnection();

    var id = '';
    var note = '';
    dbc.beginTransaction(function(err) {
      if (err) { throw err; }

        var q = 'INSERT INTO ' + table + ' SET ?';
        dbc.query(q, obj, function(err, result) {
            if (err || ! result.insertId) { 
                console.log('Insert Record Error: ' + err);
                throw err;
            }

            console.log(result);
            console.log("Created Record: " + result.insertId);
            
            id = result.insertId;

            dbc.commit(function(err) {
                if (err) { 
                    dbc.rollback(function() {
                        throw err;
                    });
                }
                console.log('successful commit of record append ' + id );

                var returnval = { 'Record_ID' : id, 'Description' : note };
                res.send( returnval );
            });
        });
       console.log('transaction complete');
    });
});

/** Record Updates **/
router.post('/update/:table/:id', jsonParser, function (req, res) {
    var table = req.params.table;
    var id = req.params.id;
    var fields = req.query['fields'];
    var add_tables = req.query['add_tables'];
    var add_condition = req.query['condition'];

    if (! req.body) { 
        console.log('Error parsing body of update');
        return res.sendStatus(400);
    }
    if (! table || !id) {
        console.log("Missing table or id");
        return res.sendStatus(400);
    }

    var obj = req.body;
    console.log(table + " # " + id);
    // var condition2 = table + '_ID' = "'" + id + "'";
    var condition = table + "_ID = '" + id + "'";

    if (add_condition) { condition += " AND " + add_condition }
    if (add_tables) { table += ',' + add_tables }
    
    var q = 'UPDATE ' + table + " SET ? WHERE " + condition;

    console.log(obj);

    console.log(q);

    var db = require('../shared/js/dbc');
    var dbc = db.establishConnection();

    dbc.beginTransaction(function(err) {
      if (err) { throw err; }        
        var update = obj;
        console.log('update: ' + JSON.stringify(update));
        
        dbc.query(q, update, function(err, result) {
            if (err) { 
                console.log('Update Record Error: ' + err);
                throw err;
            }
 
            dbc.commit(function(err) {
                if (err) { 
                    dbc.rollback(function() {
                        throw err;
                    });
                }
                console.log('successful update of ' + table + id );
                var returnval = { 'updated' : 1 };
                res.send( returnval );
            });
        });
        console.log('transaction complete');
    });
});


/** Retrieve Lookup Table Data **/
router.get('/lookup/:table', function (req, res) {
    var table = req.params.table;
    var condition = req.query['condition'];
    var fields    = req.query['fields'];
    var accessible = config.lookup;
    var lookups = [];
    if (accessible) { lookups = Object.keys(accessible) }
    
    console.log(JSON.stringify(accessible));

    console.log(JSON.stringify(lookups));
    /* specify accessible lookup tables in config file for added security */
    if ( _.contains(lookups,table) ) {
        
        var fields = table + "_ID AS id, " + accessible[table] + " AS label";

        var q = "SELECT " + fields + " FROM " + table;

        if (condition) { q += " WHERE " + condition }

        async.series([
        function (cb) {
            var dbc = require('./../shared/js/dbc');
            client = dbc.establishConnection();
            console.log('Connected to Database');
            if (client) {
                cb(null, 'connected');
            }
            else {
                cb("Error connecting to database");
            }
        },
        function (cb) {
            console.log('Load ' + table + ' Lookup...');
            console.log(q);
            client.query(q, '%', function (err, rows) {
                if (err) { cb(err) }
                else { cb(null, rows) }
            });
        }
        ],
        function (err, results) {
            if (err) { 
                client.end;
                console.log("ASYNC Error in API Lookup query: " + err);
                res.send("Error Generating Request");
            }
            client.end;
            res.send(results[1]);
        }
        );
    }
    else {
        alert(table + ' is inaccessible');
        console.log("Lookups: " + lookups)
        res.send(table + " is an Inaccessible Table " + accessible);
    }
});


/** Custom Accessors **/
router.get('/order/:id', function (req, res) {
    var id = req.params.id;

    var q = "SELECT * FROM (Requisition, Item_Request, Request, Item, User, Cost_Centre, Vendor)";
    q += " WHERE FK_Requisition__ID=Requisition_ID AND FK_Item__ID=Item_ID AND FK_Request__ID=Request_ID AND FKRequisitioner_User__ID = User_ID AND Item.FK_Vendor__ID=Vendor_ID AND Item_Request.FK_Cost_Centre__ID=Cost_Centre_ID AND Requisition_ID = '" + id + "'";
    var client;
    
    console.log(q);

        async.series([
        function (cb) {
            var dbc = require('./../shared/js/dbc');
            client = dbc.establishConnection();
            console.log('Connected to Database');
            if (client) {
                cb(null, 'connected');
            }
            else {
                cb("Error connecting to database");
            }
        },
        function (cb) {
            console.log(q);
            client.query(q, '%', function (err, rows) {
                if (err) { cb(err) }
                else { cb(null, rows) }
            });
        }
        ],
        function (err, results) {
            if (err) { 
                // client.end();
                console.log("ASYNC Error in api order retrieval: " + err);
                res.send("Error Generating Request");
            }
            // client.end();
            res.send(results[1]);
        }
        );
});

/**** API OUTPUT ****/

/*
router.get('/record/:table/:id', function (req, res) {
    var table = req.params.table;
    var id = req.params.id
    var fields = req.query['fields'];
    var add_tables = req.query['add_tables'];
    var add_condition = req.query['condition'] || '1';
    var getFields = fields || "*";

    if (add_tables) { table += ',' + add_tables }
    var q = "SELECT " + getFields + " FROM " + table + " WHERE " + table + "_ID = '" + id + "'";
    if (add_condition) { q += ' AND ' + add_condition }
	
    console.log(q);

    client.query(q, id, function(err, rows, fields) {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          
          client.end();

          res.status(err.code); 
          res.send([] )
        }
	    
        client.end();
        if (rows) { 
	        console.log('found record');
            res.send( rows );
        }
        else {
            console.log('No record found');
            res.send([]); 
        }
    });
});
*/

/*

router.post('/id/:table/:id', function (req, res) {
    console.log(req);
	var q = req.params.query;
	var id    = req.params.id;
    var table = req.params.table;
    var q = "SELECT * FROM " + table + " WHERE " + table + "_ID = '" + id + "'";
	console.log('QUERY: ' + q);
	var data = dbquery(q, id); 
	res.send(data.data);
	console.log(data);
});

function dbquery (q, id) {
        client.query(q, id, function(err, rows, fields) {
          if (err) {
            console.error(err);
            res.statusCode = 500;
        
            return { 
                'status' : 'err',
                'records' : 0,
                'data' : []
            };
          }
          else {
            console.log('retrieved ' + rows.length);
            return {
                'status' : 'success',
                'records' : rows.length,
                'data' : rows
            };
          }
        });
});
*/

module.exports = router;

