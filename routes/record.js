var express = require('express');
var request = require('request');
var mysql   = require('mysql');
var bodyParser = require('body-parser');
var async      = require('async');

var router = express.Router();
var defaults = require('./../config/default.json');
var PORT = defaults.port;
var URL = defaults.url;

var jsonParser = bodyParser.json();
var urlEncodedParser = bodyParser.urlencoded( { extended: false });
/*
router.use(bodyParser.urlencoded({ extended: true }));  // simple mod required to parse request body ... 
router.use(bodyParser.json());  // simple mod required to parse request body ... 
*/

router.post('/insert/:table', jsonParser, function (req, res) {
    var table = req.params.table;

    console.log('Posted Insert into ' + table);
    if (! req.body) { 
        console.log('Error parsing body');
        return res.sendStatus(400);
    }
    
    var obj = req.body;
    console.log(obj);

    var recordId = 0;
    var map = {};

    async.series([
		function(cb){
		        // do some stuff ...
			var db = require('../shared/js/dbc');
			dbc = db.establishConnection();
		        
			console.log('Connected to Database');
		        cb(null, dbc);

		}, 
		function(cb){
			var insert = {};			
			for (field in obj) {
				var v = obj[field];
				console.log(field + ' = ' + v);
                                insert[field] = obj[field];
			}
			var query = 'INSERT INTO ' + table + ' SET ?';
			console.log(query);
			console.log(insert);
                	dbc.query(query, insert, function(err, result) {
                    		if (err) { 
                        		console.log('Insert Error: ' + err);
                        		cb(err);
                    		}
				console.log("Added " + result.insertId);
				cb(null, result.insertId);
                	});
 
		}
	],
    	function (err, results) {
		if (err) { 
			console.log("ASYNC Error: " + err);
			res.send("Error generating Record");
		}

        	console.log('Add Record: ' + results[1]);        
		var returnval = { 'record_ID' : results[1], 'Description' : obj.description };
     		res.send( returnval );
    	});	

});

router.post('/update/:table/:id', jsonParser, function (req, res) {
	var table = req.params.table;
    var id = req.params.id;
    var add_tables = req.param('add_tables');
    var add_condition = req.param('condition');

    if (! req.body) { 
        console.log('Error parsing body');
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

router.get('/:table/', function(req, res) {
	var table = req.params.table;
	var id    = req.params.id;
	
	console.log('load ' + table + id);
	var Lookups = [];
	async.series([
		function(cb){
		        // do some stuff ...
			var db = require('../shared/js/dbc');
			dbc = db.establishConnection();
		        
			console.log('Connected to Database in record route');
		        cb(null, dbc);
		},
		function (cb) {
		    var q = "DESCRIBE " + table;
		    var id = '%';
			
  		    console.log('describe in record route : ' + q);

		    dbc.query(q, id, function(err, rows, fields) {
			if (err) { cb(err) }
			else {
				var lookup = [];
				console.log('retrieved ' + rows.length );

				var Fields = [];
				var Types = [];
				var Defaults = [];
				for (var i=0; i<rows.length; i++) {
						Fields.push(rows[i]['Field']);
						Types.push(rows[i]['Type']);
						Defaults.push(rows[i]['Default']);
						if ( rows[i]['Field'].match(/^FK(.*)\_\_ID/) ) { Lookups.push(rows[i]['Field']) }
				}
				cb(null, {Fields: Fields, Types: Types, Defaults: Defaults});		
			}
		    });
		}
	],
    	function (err, results) {
		if (err) { 
			console.log("ASYNC Error: " + err);
			res.send("Error generating Request Page \n" + err);
		}
		console.log('Fields: ' + results[1]['Fields']);
		console.log('Lookups: ' + Lookups);
        	console.log('record route ok');        
		res.render('Record', results[1]);
    	});
});

router.get('/:table/:id', function(req, res) {
	var table = req.params.table;
	var id    = req.params.id;
	var format = req.param('format');
		    
	var q = "SELECT * FROM " + table + " WHERE " + table + "_ID = '" + id + "'";
 	console.log('get record: ' + q);

	var Lookups = [];
	async.series([
		function(cb){
		        // do some stuff ...
			var db = require('../shared/js/dbc');
			dbc = db.establishConnection();
		        
			console.log('Connected to Database in record route');
		        cb(null, dbc);
		},
		function (cb) {
		    console.log('q: ' + q);
		    dbc.query(q, '%', function(err, rows, fields) {
			if (err) { cb(err) }
			else {
				console.log('F: ' + fields);
				cb(null, rows);
			}	
		    });
		}
	],
    	function (err, results) {
		if (err) { 
			console.log("ASYNC Error: " + err);
			res.send("Error generating Request Page \n" + err);
		}
				
		if (format == 'html') { 
			console.log(results[1]);
			var fields = []; // ['Item_Name'];			
			var data = results[1];
			if (data && data[0]) {
				for (key in results[1][0]) {
					fields.push(key);
                        	}
			}
			else { console.log('No data found'); }
       			var title =  table + ' ' + id ;
			res.render('Record', {Fields : fields, data: results[1], title: title });
		}
		else {		
			console.log('Data: ' + results[1]);
			res.send(results[1]);
		}
    	});
});

module.exports = router;
