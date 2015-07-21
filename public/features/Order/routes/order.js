var express = require('express');
var request = require('request');
var mysql   = require('mysql');
var bodyParser = require('body-parser');
var async      = require('async');

var router = express.Router();
var defaults = require('./../../config/default.json');
var serverPORT = defaults.serverPort;
var URL  = defaults.url;

var jsonParser = bodyParser.json();
var urlEncodedParser = bodyParser.urlencoded( { extended: false });

var user = 'Admin';
var userid = 1;

var apiURL = URL + ':' + serverPORT;
 

/*
router.use(bodyParser.urlencoded({ extended: true }));  // simple mod required to parse request body ... 
router.use(bodyParser.json());  // simple mod required to parse request body ... 
*/

router.get('/login', function (req, res) {
	console.log('gohome');
	res.send('relogin');
});

router.get('/requisition', function (req, res) {
	var db = require('../lib/dbc');
    console.log('std req page');

    var Config = { user : user, userid : userid, url: apiURL};

    res.render('Requisition', {
        item_Class : 'Item_Request',
        search_title : "Search for Pending Requests using any of fields below",
        add_to_scope : 1, 
        Config : Config, 
    });


});
router.get('/:id', function (req, res) {
    var orderId = req.params.id;
    console.log("Existing Order: " + orderId);

    var title = 'Order #' + orderId;
    var Config = { user : user, userid : userid, url: apiURL, recordId : orderId, itemClass : 'Item_Request'};

    var qfields = "DISTINCT Requisition_ID, Requisition_Date, User_Name,Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, CASE WHEN Unit_Cost IS NULL THEN Item_Cost ELSE Unit_Cost END as Unit_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes";
    var qtables = "(Item, Item_Request, Request, User, Requisition) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=Item.FK_Vendor__ID"; 
    var qcondition = "FK_Request__ID=Request_ID AND FKRequester_User__ID=User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID AND FK_Item_Request__ID=Item_Request_ID AND FK_Requisition__ID=Requisition_ID";
    
    var query = "SELECT " + qfields + " FROM " + qtables + " WHERE " + qcondition;

    res.render('Requisition', {
        recordId : orderId,
        item_Class : 'Item_Request',
        add_to_scope : 1,
        search_title : "Search for Existing Orders using any of fields below",
        Config : Config, 
        Fields : ['Requisition_ID', 'Requisition_Date']
    });
});

router.get('/order', function (req, res) {

	var user = 'Admin';
	var userid = 1;

	console.log('main order page');
	var db = require('../lib/dbc');

	async.series([
		function(cb){
		        // do some stuff ...
			var db = require('../lib/dbc');
			dbc = db.establishConnection();
		        
			console.log('Connected to Database');
		        cb(null, dbc);
		},
		 function (cb) {
		    var q = "SELECT * FROM Requisition WHERE Requisition_Status = 'Requisitioned'";
		    var id = '%';

		    dbc.query(q, id, function(err, rows, fields) {
			if (err) { cb(err) }
			else {
				var lookup = [];
				console.log('retrieved ' + rows.length + ' pending Orders');

				for (var i=0; i<rows.length; i++) {
				      var id = rows[i]['Order_ID'];
				}
				var Orders;
				cb(null, rows);		
			}
		    });
		}
	],
    	function (err, results) {
		if (err) { 
			console.log("ASYNC Error in client order request: " + err);
			res.send("Error generating Order Page");
		}

		var Orders = results[1];

       /** Initialize smartSearch options **/
        var Columns = [
	        { field : 'Request_Date', mandatory : 1, model : 'itemRequested', type:'date'},
	        { label : 'By', field : 'User_Name', mandatory : 1, model : 'itemRequester', hidden:1, type:'number'},
	        { label : 'Qty', field : 'Unit_Qty', mandatory : 1, model : 'itemQty', type:'number'},
	        { label : 'Cost', field : 'Unit_Cost', mandatory : 1, model : 'itemCost', type:'number'},
	        { label : 'Name', field : 'Item_Name', mandatory : 1, model : 'itemName'},
	        { label : 'Item_Request_ID', field : 'Item_Request_ID', mandatory : 1, model : 'itemRequestId', hidden:1},
	        { label : 'Vendor', field : 'Vendor_Name', mandatory : 1, model : 'itemVendor'},
	        { label : 'Vendor_ID', field : 'Vendor_ID', mandatory : 1, model : 'itemVendorId', type: 'number', hidden:1},
	        { label : 'Catalog', field : 'Item_Catalog', model : 'itemCatalog'},
	        { label : 'GL Code', field : 'GL_Code', model : 'itemGLCode'},
	        { label : 'DeliverTo', field : 'Deliver_To', model : 'itemDeliverTo'},
	        { label : 'Notes', field : 'Item_Request_Notes', model : 'itemRequestNotes'}
	      ];

    	var Config = { user : user, userid : userid, url: URL, port: PORT };
 
	    var default_ac_options = {
	        type : 'hidden',
	        url : URL + ':' + PORT + "/api/q/",
	        target : 'Item_Name',
	        displayBlock : 'message',
	        dataKey : 'data',
	        show : "Requisition_ID, Requisition_Date, User_Name,Request_Date,Item_Category_Description,Item_Name,Item_Description,Item_Catalog,Vendor_Name,Unit_Qty, Unit_Cost,Item_Request_Notes, Deliver_To",
	        query : "SELECT DISTINCT Requisition_ID, Requisition_Date,f User_Name,Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, CASE WHEN Unit_Cost IS NULL THEN Item_Cost ELSE Unit_Cost END as Unit_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes FROM (Item, Item_Request, Request, User, Requisition) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=FK_Vendor__ID WHERE FK_Request__ID=Request_ID AND FKRequester_User__ID=User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID AND FK_Item_Request__ID=Item_Request_ID AND FK_Requisition__ID=Requisition_ID",
	        set : "Item_Category_Description,Unit_Qty,Unit_Cost,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name,Item_Request_ID,User_Name,Request_Date,Item_Request_Notes, Deliver_To",
	        condition : "FK_Item_Category__ID IN (<Item_Category>)",
	        onEmpty : "No Requested Items found.<P><div class='alert alert-warning'>Please try different spellings or different field to search.</div>\n"
	    };
 
    	res.render('SearchOrders', {
    		found : 0,
    		status : 'Requisitioned',
    		item_Class : 'Order',
    		search_title : "Search for Existing Orders using any of fields below",
    		Columns : Columns, 
    		Config : Config, 
    		ac_option_string: JSON.stringify(default_ac_options),
    		Orders : Orders, 
    		Fields : ['Requisition_ID', 'Requisition_Date']
    		// cost_centres: Cost_Centres, 
    		// categories: Item_Categories
    	});
    });
});

router.get('/receive', function (req, res) {
	console.log('receive page');
	res.send('ok');
});

router.get('/reconcile', function (req, res) {
	console.log('reconcile page');
	res.send('ok');
});

router.post('/requisition', jsonParser, function (req, res) {
    console.log('Posted Requisition');
    if (! req.body) { 
        console.log('Error parsing body');
        return res.sendStatus(400);
    }
    
    var obj = req.body;
    console.log(obj);

    var db = require('../lib/dbc');
    var dbc = db.establishConnection();
    var orderId = 0;

    dbc.beginTransaction(function(err) {
      if (err) { throw err; }
        var insertR = {};
        var map = obj['map'] ;
        console.log('map: ' + map);
        for (k in obj) {
            if (k.match('items')) { continue }
            else if (k.match('map')) { continue }
            else if (map && map[k]) { insertR[map[k]] = obj[k] } // use mapped field name
            else { insertR[k] = obj[k] }                  // use key if no mapping supplied
        }
        
        dbc.query('INSERT INTO Requisition SET ?', insertR, function(err, result) {
            if (err || ! result.insertId) { 
                console.log('Insert Requisition Error: ' + err);
                throw err;
            }

            console.log(result);
            console.log("Created Requisition: " + result.insertId);
            obj.orderId = result.insertId;
	        obj.description = "Requisitioned " + obj.items.length + " Items [" + obj['Requisition_Date'] + ']';
            
            var items = obj.items;
            var orderItems = [];
            for (i in items) {    
                var id = items[i]['Item_Request_ID'];
                orderItems.push(id);
            }

            var itemList = orderItems.join(',');
            var condition = "Item_Request_ID IN (" + itemList + ')';
            var q = "UPDATE Item_Request SET FK_Requisition__ID = ? WHERE " + condition;
            console.log(q);

            dbc.query(q, result.insertId, function(err, result) {
                    if (err) { 
                        console.log('Insert Item ' + i + ' Error: ' + err);
                        console.log(insertId);
                        throw err;
                    }
                    console.log("updated Item_Request records with ref to Requisition");
            });
 
            dbc.commit(function(err) {
                if (err) { 
                    dbc.rollback(function() {
                        throw err;
                    });
                }
                console.log('successful commit of requisition ' + obj.orderId );
	           var returnval = { 'Requisition_ID' : obj.orderId, 'Description' : obj.description };
     	      res.send( returnval );
            });
        });
	   console.log('transaction complete');
    });

});

/* Standard Update */
router.post('/requisition/update', jsonParser, function (req, res) {
    console.log('Posted Requisition Update');
    if (! req.body) { 
        console.log('Error parsing body');
        return res.sendStatus(400);
    }
    
    var obj = req.body;
    console.log(obj);

    var db = require('../lib/dbc');
    var dbc = db.establishConnection();

    var orderId = obj['recordId'];

    dbc.beginTransaction(function(err) {
      if (err) { throw err; }
        var insertR = {};
        
        var recordId = obj['recordId'];
        var update = obj['update'];
        var condition = "Requisition_ID = '" + recordId + "'";

        console.log('update: ' + JSON.stringify(update));
        
        dbc.query('UPDATE Requisition SET ? WHERE ' + condition, update, function(err, result) {
            if (err) { 
                console.log('Update Requisition Error: ' + err);
                throw err;
            }

            console.log(JSONG>stringify(result));
            console.log("Updated Requisition: " + result.insertId);
 
            dbc.commit(function(err) {
                if (err) { 
                    dbc.rollback(function() {
                        throw err;
                    });
                }
                console.log('successful update of requisition ' + obj.orderId );
                var returnval = { 'updated' : 1 };
                res.send( returnval );
            });
        });
        console.log('transaction complete');
    });

});


router.get('/submit', function (req, res) {
    console.log("Submit order Page...");
    res.render('Requisition', {  port: PORT, url: URL });
});


router.get('/search', function(req, res){
	console.log('get order search');
	// input value from search
	var val = req.query.search;

	console.log('search for ' + val);
	var url = "http://localhost:" + PORT + "/items/search/" + val;
	
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
