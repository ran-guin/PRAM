var express = require('express');
var router = express.Router();
var async      = require('async');

var _ = require('underscore');

var config = require('./../config/default.json');

var client;

/** Retrieve Lookup Table Data **/
router.get('/requests', function (req, res) {
    var condition = req.param('condition') || 1;
    var fields    = req.param('fields');

    var table = "Request, Item_Request, User as Requester, Item, Vendor";
    condition += " AND FK_Request__ID=Request_ID AND FKRequester_User__ID=Requester.User_ID AND Item_Request.FK_Item__ID=Item_ID AND Item.FK_Vendor__ID=Vendor_ID";
    
    if (!fields) { fields = "Request_ID as ID, Request_Date, Requester.User_Name as Requested_By, Item_Name as Item, Item_Catalog as Catalog, Vendor_Name as Vendor, Item_Cost, Unit_Qty as Requested, Received_Qty as Rcvd" }

    console.log('request report');
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
            var q = "SELECT " + fields + " FROM " + table + " WHERE " + condition + ' GROUP BY Request_ID';
            console.log("Query: " + q);
            client.query(q, '%', function (err, rows) {
                if (err) { cb(err) }
                else { cb(null, rows) }
            });
        }
        ],
        function (err, results) {
            if (err) { 
                console.log("ASYNC Error generating request report: " + err);
                res.send("Error Generating Request")                
            }
            res.render('Report', {data: results[1], title: 'Pending Requests', type: 'request'});
        }
        );
        // res.send('error');
});

/** Retrieve Lookup Table Data **/
router.get('/orders', function (req, res) {
    var condition = req.param('condition') || 1;
    var status    = req.param('status') || '';
    var group     = req.param('group') || 'Item_Request_ID';

    var table = "Requisition, Request, Item_Request, User as Requester, Item, Vendor";
    condition += " AND Requisition_ID=FK_Requisition__ID AND FK_Request__ID=Request_ID AND FKRequester_User__ID=Requester.User_ID AND Item_Request.FK_Item__ID=Item_ID AND Item.FK_Vendor__ID=Vendor_ID";

    var fields = "Requisition_ID as ID, Request_ID, Request_Date, Requester.User_Name as Requested_By, Vendor_Name as Vendor";
    
    if (group == 'Item_Request_ID') {
        fields += ", Item_Name, Item_Cost, Unit_Qty as Requested, Received_Qty as Rcvd";
    }
    else {
        fields += ", GROUP_CONCAT(DISTINCT Item_Name SEPARATOR '<BR>') as Items, Count(Distinct Item_Request_ID) as Requests";
    }
    

    console.log('request report');
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
            var q = "SELECT " + fields + " FROM " + table + " WHERE " + condition + ' GROUP BY ' + group;
            console.log("Query: " + q);
            client.query(q, '%', function (err, rows) {
                if (err) { cb(err) }
                else { cb(null, rows) }
            });
        }
        ],
        function (err, results) {
            if (err) { 
                console.log("ASYNC Error generating request report: " + err);
                res.send("Error Generating Request")                
            }
            res.render('Report', {data: results[1], title: 'Pending ' + status + ' Orders', type: 'order'});
        }
        );
        // res.send('error');
});

module.exports = router;

