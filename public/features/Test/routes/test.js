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
var Config = { user : user, userid : userid, url: apiURL};
 

/*
router.use(bodyParser.urlencoded({ extended: true }));  // simple mod required to parse request body ... 
router.use(bodyParser.json());  // simple mod required to parse request body ... 
*/

router.get('/', function (req, res) {
	var db = require('../lib/dbc');
    console.log('std test page');
    /** Initialize smartSearch options **/

	res.render('Test', {
		item_Class : 'Item_Request',
		search_title : "Search for Pending Requests using any of fields below",
		add_to_scope : 1, 
		Config : Config, 
	});

});

module.exports = router;
