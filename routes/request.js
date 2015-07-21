var express = require('express');
var request = require('request');
var mysql   = require('mysql');
var bodyParser = require('body-parser');
var async      = require('async');

var router = express.Router();
var defaults = require('./../config/default.json');
var serverPORT = defaults.serverPort;

var URL  = defaults.url;
var apiURL = defaults.api_url; // + ':' + serverPORT ;


// apiURL = "http://limsdemo.bcgsc.ca/pram_api";
// apiURL = "http://limsdemo.bcgsc.ca:3030";

var user = 'Admin';
var userid = 1;


var jsonParser = bodyParser.json();
var urlEncodedParser = bodyParser.urlencoded( { extended: false });
/*
router.use(bodyParser.urlencoded({ extended: true }));  // simple mod required to parse request body ... 
router.use(bodyParser.json());  // simple mod required to parse request body ... 
*/

router.post('/create', jsonParser, function (req, res) {
    console.log('Posting Request');
    if (! req.body) { 
        console.log('Error parsing body');
        return res.sendStatus(400);
    }
    
    var obj = req.body;
    console.log(obj);

    var db = require('../shared/js/dbc');
    var dbc = db.establishConnection();
    var requestId = 0;

    dbc.beginTransaction(function(err) {
      if (err) { throw err; }
        var insertR = {};
        var map = obj['map'] || {};
        console.log('map: ' + map);
        for (k in obj) {
            if (k.match('items')) { continue }
            else if (k.match('map')) { continue }
            else if (map[k]) { insertR[map[k]] = obj[k] } // use mapped field name
            else { insertR[k] = obj[k] }                  // use key if no mapping supplied
        }
        
        dbc.query('INSERT INTO Request SET ?', insertR, function(err, result) {
            if (err || ! result.insertId) { 
                console.log('Insert Request Error: ' + err);
                throw err;
            }

            console.log(result);
            console.log("Created Request: " + result.insertId);
            obj.requestID = result.insertId;
            obj.description = "Requested " + obj.items.length + " Items [" + obj['Request_Date'] + ']';
            
            var insertI = [];
            var items = obj.items;
            for (i in items) {    
                var item = items[i];
                var insert = {};
                for (k in item) {
                    if (item[k] === undefined) { continue }
                    else if (map[k]) { insert[map[k]] = item[k] || '' }
                    else if (map) { continue }                    // ignore unmapped fields if mapping supplied
                    else { insert[k] = item[k] || '' }
                }
                
                insert['FK_Request__ID'] = result.insertId;

                console.log(insert);
                insertI.push(insert);
                dbc.query('INSERT INTO Item_Request SET ?', insert, function(err, result) {
                    if (err) { 
                        console.log('Insert Item ' + i + ' Error: ' + err);
                        throw err;
                    }
                });
            }
            dbc.commit(function(err) {
                if (err) { 
                    dbc.rollback(function() {
                        throw err;
                    });
                }
                console.log('successful commit of request ' + obj.requestID );
                var returnval = { 'Record_ID' : obj.requestID, 'Description' : obj.description };
                res.send( returnval );
            });
        });
        console.log('transaction complete');
    });

});

router.get('/', function (req,res) {
    console.log('std Request page');
	var db = require('../shared/js/dbc');

    var Config = { user : user, userid : userid, url: URL, apiURL: apiURL};

    console.log('Config:' + JSON.stringify(Config));

    res.render('Request', {
        item_Class : 'Item',
        search_title : "Search for Catalog Items using any of fields below",
        add_to_scope : 1, 
        Config : Config, 
    });

});

router.get('/:id', function (req, res) {
    var requestId = req.params.id;
    console.log("Existing Request # " + requestId);

    var title = 'Request #' + requestId;
    var Config = { user : user, userid : userid, apiURL: apiURL, recordId : requestId, itemClass : 'Item_Request'};

    res.render('Request', {
        recordId : requestId,
        item_Class : 'Item',
        add_to_scope : 1,
        search_title : "Search for Existing Requests using any of fields below",
        Config : Config, 
        Fields : ['Request_ID', 'Request_Date']
    });
});

router.get('/old', function (req, res) {
	var db = require('../shared/js/dbc');


	async.series([
		function(cb){
		        // do some stuff ...
			var db = require('../shared/js/dbc');
			dbc = db.establishConnection();
		        
			console.log('Connected to Database');
		        cb(null, dbc);
		},
		 function (cb) {
		    var q = "SELECT * FROM Cost_Centre";
		    var id = '%';

		    dbc.query(q, id, function(err, rows, fields) {
			if (err) { cb(err) }
			else {
				var lookup = [];
				console.log('retrieved ' + rows.length + ' cost centres');

				for (var i=0; i<rows.length; i++) {
				      var id = rows[i]['Cost_Centre_ID'];
				      var code = rows[i]['Cost_Centre_Code'];
				      var desc = rows[i]['Cost_Centre_Description'];
				      var label = code + ' : ' + desc;
				      lookup.push({ label : label, value : id }); 
				}
				var Cost_Centres = JSON.stringify(lookup);
				cb(null, Cost_Centres);		
			}
		    });
		},
		 function (cb) {
		    var q = "SELECT * FROM Item_Category";
		    var id = '%';

		    dbc.query(q, id, function(err, rows, fields) {
			if (err) { cb(err) }
			else {
				var lookup = [];
				console.log('retrieved ' + rows.length + ' categories');

				for (var i=0; i<rows.length; i++) {
				      var id = rows[i]['Item_Category_ID'];
				      var code = rows[i]['Item_Category_Code'];
				      var desc = rows[i]['Item_Category_Description'];
				      var label = code + ' : ' + desc;
				      lookup.push({ label : label, value : id }); 
				}
				var Item_Categories = JSON.stringify(lookup);
				cb(null, Item_Categories);		
			}
		    });
		},

	],
    	function (err, results) {
		if (err) { 
			console.log("ASYNC Error in client request query: " + err);
			res.send("Error generating Request Page");
		}

		var Cost_Centres = results[1];
		var Item_Categories = results[2];

        console.log('got results' + Item_Categories); 

        /** Initialize smartSearch options **/
        var Columns = [
	        { field : 'Item_Name', label : 'Name', mandatory : 1, model : 'itemName'},
	        { field : 'Item_ID', label : 'Id', mandatory : 1, model : 'itemId', hidden:1, type:'number'},
	        { label : 'Vendor', field : 'Vendor_Name', mandatory : 1, model : 'itemVendor'},
	        { field : 'Vendor_ID',label : 'Vendor_ID',  mandatory : 1, model : 'itemVendorId', hidden:1},
	        { field : 'Unit_Cost',label : 'Cost',  mandatory : 1, model : 'itemCost'},
	        { field : 'Item_Catalog', label : 'Catalog',  model : 'itemCatalog'}
	      ];
	      
    	var Config = { user : user, userid : userid, url: URL };
		var showFields = "Item_ID,Category,Item_Name,Item_Description,Item_Catalog,Vendor_Name,Unit_Cost";
    	var queryCall = "SELECT DISTINCT Item_ID,Item_Category_Description as Category,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name,Item_Cost as Unit_Cost FROM Item JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON FK_Vendor__ID=Vendor_ID";
    	var setFields =  "Unit_Cost,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name,Item_ID";

	   	var acURL = apiURL + "/api/q";
    	var acCondition = "FK_Item_Category__ID IN (<Item_Category>)";
	    var launchModal = "No Items found.<P><div class='alert alert-warning'>Please try different spellings or different field to search.<P>Please only add a new item if this item has never been received before.  <button class='btn btn-primary' type='button' data-toggle='modal' data-target='#newItemModal'> Add New Item </button></div>\n";

	    var default_ac_options = {
	        type : 'hidden',
	        url : acURL,
	        target : 'Item_Name',
	        displayBlock : 'message',
	        dataKey : 'data',
	        show : showFields,
	        query : queryCall,
	        set : setFields,
	        condition : acCondition,
	        onEmpty : launchModal
	    };
 
    	res.render('addRequest', {
    		query_url : acURL,
    		search_title : "Search for Items using any of fields below",
    		add_to_scope : 1, 
    		Columns : Columns, 
    		Config : Config, 
    		ac_option_string: JSON.stringify(default_ac_options),
    		cost_centres: Cost_Centres, 
    		categories: Item_Categories
    	});
    });
});

router.post('/', jsonParser, function (req, res) {
    console.log('Posted Request');
    if (! req.body) { 
        console.log('Error parsing body');
        return res.sendStatus(400);
    }
    
    var obj = req.body;
    console.log(obj);

    var db = require('../shared/js/dbc');
    var dbc = db.establishConnection();
    var requestId = 0;

    dbc.beginTransaction(function(err) {
      if (err) { throw err; }
        var insertR = {};
        var map = obj['map'] || {};
        console.log('map: ' + map);
        for (k in obj) {
            if (k.match('items')) { continue }
            else if (k.match('map')) { continue }
            else if (map[k]) { insertR[map[k]] = obj[k] } // use mapped field name
            else { insertR[k] = obj[k] }                  // use key if no mapping supplied
        }
        
        dbc.query('INSERT INTO Request SET ?', insertR, function(err, result) {
            if (err || ! result.insertId) { 
                console.log('Insert Request Error: ' + err);
                throw err;
            }

            console.log(result);
            console.log("Created Request: " + result.insertId);
            obj.requestID = result.insertId;
	    obj.description = "Requested " + obj.items.length + " Items [" + obj['Request_Date'] + ']';
            
            var insertI = [];
            var items = obj.items;
            for (i in items) {    
                var item = items[i];
                var insert = {};
                for (k in item) {
                    if (item[k] === undefined) { continue }
                    else if (map[k]) { insert[map[k]] = item[k] || '' }
                    else if (map) { continue }                    // ignore unmapped fields if mapping supplied
                    else { insert[k] = item[k] || '' }
                }
                
                insert[map['requestId']] = result.insertId;

                console.log(insert);
                insertI.push(insert);
                dbc.query('INSERT INTO Item_Request SET ?', insert, function(err, result) {
                    if (err) { 
                        console.log('Insert Item ' + i + ' Error: ' + err);
                        throw err;
                    }
                });
            }
            dbc.commit(function(err) {
                if (err) { 
                    dbc.rollback(function() {
                        throw err;
                    });
                }
                console.log('successful commit of request ' + obj.requestID );
		var returnval = { 'Request_ID' : obj.requestID, 'Description' : obj.description };
     		res.send( returnval );
            });
        });
	console.log('transaction complete');
    });

});

router.get('/submit', function (req, res) {
    console.log("Submit Request Page...");
    res.render('Request', {  url: URL });
});


router.get('/search', function(req, res){
	console.log('get request search');
	// input value from search
	var val = req.query.search;

	console.log('search for ' + val);
	var url = "http://localhost:" + serverPORT + "/items/search/" + val;
	
	console.log('search URL: ' + url);

	// request module is used to process the yql url and return the results in JSON format
	request.get({ url: url}, function(err, resp, body) {
		var dump = "No results found... .try again";
		// logic used to compare search results with the input from user
		if (err) {
		  console.log("error in url generation");
		  res.send("error generating url");
		}
		else {
		  console.log('body: ' + body);
		  body = JSON.parse(body);
		  if (body.data && body.data.length) {
			dump = body.data;
		  }
		  console.log("Dumped:" + dump);
		  res.send(dump);
		}
	});

});

module.exports = router;
