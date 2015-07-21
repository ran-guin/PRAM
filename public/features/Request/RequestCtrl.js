'use strict';
var app = angular.module('myApp');

app.controller('RequestCtrl', 
    ['$scope', '$log', '$q', '$rootScope', '$http', '$location', '$injector', 'Nto1Factory', 'AuthenticationService', 
    function ($scope, $log, $q, $rootScope, $http, $location, $injector, Nto1Factory, AuthenticationService) {

	console.log('loaded Request Controller');

    /** timer with date + hours + minutes - automatically updates  **/
    // var update_seconds = 1;    
    // setInterval (function() {

    //     if ($scope.recordStatus == 'Draft') { 
    //       $scope.$parent.created = $scope.timestamp; 
    //       $scope.$parent.Request_Date =  $scope.timestamp;
    //     }

    //     $scope.$apply();
    // }, update_seconds*1000);


    /** run PRIOR to standard initialization  */
    $scope.setup = function (config) {
        $scope.$parent.itemClass = 'Item';
        $scope.$parent.mainClass = 'Request';
        
        $scope.$parent.statusField = 'recordStatus';
        $scope.$parent.statusDefault = 'Draft';

        /* Customize as Required */
        $scope.$parent.statusOptions = ['Draft','Requested','Ordered','Partially Received','Received','Reconciled','Cancelled'];

        $scope.$parent.Columns = [
            { field : 'Request_ID' },
            { field : 'Request_Date', mandatory : 1, set: 1 },
            { field : 'FKRequester_User__ID', label : 'requesterId',  mandatory : 1, hidden:1},
            { field : 'Requester.User_Name', label : 'requester', set: 1},
            { field : 'Request_Status', label : 'recordStatus', mandatory : 1, set: 1 },
            { field : 'Request.FK_Cost_Centre__ID', label : 'CostCentreID', set: 1,  hidden:1, set: 1},            
            { field : 'Cost_Centre_Code', label : 'CostCentreCode', set: 1, hidden:1, set: 1},            
            { field : 'Cost_Centre_Description', label : 'CostCentre', },            
            { field : 'Request_Notes', set: 1 },

        ];

        $scope.$parent.itemColumns = [
            { field : 'Item_Name', label : 'Name', mandatory : 1, model : 'itemName'},
            { field : 'Item_ID', set: 1, target: 'FK_Item__ID', mandatory : 1, type:'number', hidden: 1},
            { label : 'Vendor', field : 'Vendor_Name', model : 'itemVendor'},
            { field : 'Vendor_ID',label : 'Vendor_ID', model : 'itemVendorId', hidden:1},
            { field : 'Item_Cost',label : 'Cost', model : 'itemCost', type:'number'},
            { field : 'Item_Catalog', label : 'Catalog',  model : 'itemCatalog'},
            { field : 'Deliver_To', set: 1, hidden: 1},
            { field : 'Item_Request_Notes', hidden: 1, set: 1},
            { field : 'Unit_Cost', set: 1, hidden: 1},
            // { field : 'Cost_Centre_ID', target: 'FK_Cost_Centre__ID', set: 1, hidden : 1},
            { field : 'Unit_Qty', label: 'Qty', set: 1, hidden : 1},

        ];
        $scope.Cost_Centre = {};
    
        /* Load Fields based on fields above using tables / condition below */
        $scope.queryTables = "(Request, Item_Request, Item, User as Requester) LEFT JOIN Cost_Centre ON Request.FK_Cost_Centre__ID=Cost_Centre_ID LEFT JOIN Vendor ON Item.FK_Vendor__ID=Vendor_ID";
        $scope.queryCondition = "FK_Request__ID=Request_ID AND Item_Request.FK_Item__ID=Item_ID AND Requester.User_Id=FKRequester_User__ID";
   
         $scope.Autocomplete = {
            url : '/pram/api/q',
            target : 'Item_Name',
            show : "Item_ID,Category,Item_Name,Item_Description,Item_Catalog,Vendor_Name,Item_Cost",
            search : 'Item_Name, Vendor, Item_Cost, Item_Catalog',
            hide : 'Item_ID,Vendor_ID',
            query_table : "Item JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON FK_Vendor__ID=Vendor_ID",
            query_field : "Item_ID,Item_Category_Description as Category,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name,Item_Cost",
            query_condition : "1",
            // query : "SELECT DISTINCT User_Name,Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, CASE WHEN Unit_Cost IS NULL THEN Item_Cost ELSE Unit_Cost END as Unit_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes FROM (Item, Item_Request, Request, User) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=FK_Vendor__ID WHERE FK_Request__ID=Request_ID AND FKRequester_User__ID=User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID",
            set : "Item_Cost,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name,Item_ID",
            condition : "FK_Item_Category__ID IN (<Item_Category>)",
            onEmpty : "No Items found.<P><div class='alert alert-warning'>Please try different spellings or different field to search.<P>Please only add a new item if this item has never been received before.  <button class='btn btn-primary' type='button' data-toggle='modal' data-target='#newItemModal'> Add New Item </button></div>\n"
        };

        console.log($scope.Autocomplete['url']);
         
        Nto1Factory.extend_Parameters($scope.Columns, $scope.itemColumns, $scope.Autocomplete);

        $scope.$parent.setup(config);
    }

$scope.$parent.CostCentres = [];
$scope.$parent.ItemCategories = [];

$scope.$parent.MenuSettings = {
    closeOnSelect: true,
    selectionLimit: 1,
    enableSearch: true,
    showCheckAll: false,
    showUncheckAll: false,
    externalIdProp: '',
    smartButtonMaxItems: 3,
    smartButtonTextConverter: function(itemText, originalItem) {
        return itemText;
    }
};


    $scope.initialize = function( config ) {

        console.log("local init: " + config);
            
        $scope.$parent.highlightBackground = "background-color:#9C9;";
        var tab_element = document.getElementById('requestTab');
        // if (tab_element) { tab_element.style = $scope.highlightBackground }

        $scope.setup(config);

        $scope.$parent.initialize(config);

        if (! $scope.creator) {
          console.log('default creator to user : ' + $scope.user);
          $scope.creator = $scope.user;
        }

        if ($scope.recordId) { $scope.loadRecord($scope.recordId) }
        else {
            console.log("Initialize " + $scope.statusField + '=' + $scope.statusDefault);
            if ($scope.statusField ) {
                if ($scope[$scope.statusField] === undefined) {
                    $scope.$parent[$scope.statusField] = $scope.statusDefault;
                    console.log('set default status to' + $scope.recordStatus);
                }
                Nto1Factory.setClasses($scope.statusOptions, $scope[$scope.statusField]);  
            }
        }

        $scope.ac_options = JSON.stringify($scope.Autocomplete);

        $scope.$parent.manualSet = ['Request_Notes'];  /* manually reset */
    }

    /********** Update Cost Totals **********/
    $scope.updateTotals = function (id, index) {
        var total = 0;
        for (var i=0; i < $scope.items.length; i++) {
            var thisItem = $scope.items[i];
            var itemTotal = thisItem.Cost * thisItem.Qty;
            $scope.items[i].itemTotal = itemTotal
            total += itemTotal;
        }
        
        var pst = 0.07;
        var gst = 0.05;

        $scope.subTotal = total.toFixed(2);
        $scope.pstTotal = (total * pst).toFixed(2);
        $scope.gstTotal = (total * gst).toFixed(2);
        $scope.costTotal = (total * (1+pst+gst)).toFixed(2);
            
        console.log("Reset Cost Total to "  + $scope.subTotal + " ( + pst + gst ) = " + $scope.costTotal);
    }

    $scope.clearScope = function () {
        console.log('how to clear CC dropdown menu - or reset form ?');
        $scope.$parent.clearScope();
        $scope.updateTotals();
    }

   /********** Add Item to List of Requests **********/
    $scope.addItem = function( ) {
        console.log('add item...');
        Nto1Factory.addItem( $scope.itemColumns, $scope.items );
        var index = $scope.items.length - 1;
        console.log('added item');
    }

    $scope.loadRecord = function (recordId) {
        var fields = $scope.Fields.join(',');
        var itemfields = $scope.itemFields.join(',');
        $scope.customQuery = "Select " + fields + ',' + itemfields;
        $scope.loadCondition = "Request_ID = '" + recordId + "'";

        $scope.customQuery += " FROM " + $scope.queryTables + " WHERE " + $scope.queryCondition + ' AND ' + $scope.loadCondition;

        console.log($scope.customQuery);
        var url = '/pram/api/q';
        console.log('Preload from ' + url);

        $scope.resetModel('Cost_Centre')
        /* implement promise */
        var promise =  $scope.$parent.loadRecord(url, recordId, $scope.customQuery);
        $q.when(promise)
        .then ( function (res) {
            // $scope.loadCostCentre();
            $scope.loadNextStatus();
            Nto1Factory.setClasses($scope.statusOptions, $scope.recordStatus); 
            console.log('apply user  ' + $scope.user);

            $scope.updateTotals();
            $scope.$parent.highlightBackground = "background-color:#9C9;";

            if ($scope.recordStatus == 'Pending') {
            }
            else {
                console.log('unrecognized status: ' + $scope.recordStatus);
           }
        });

    }


    $scope.saveChanges = function (status) {
        var data = {
                'FKOwner_User__ID' : $scope.ownerId,
                'Request_Date' : $scope.Request_Date,
                // 'FK_Cost_Centre__ID' : $scope.costCentre,
                'Request_Notes' : $scope.Request_Notes,
         };         

        var jsonData = JSON.stringify(data);
        var url = '/pram/api/update/Request/' + $scope.recordId;
        $q.when ($scope.$parent.saveChanges(url, jsonData))
        .then ( function () {
            $scope.loadRecord($scope.recordId);
            console.log('reload ' + $scope.recordId);
            // Nto1Factory.setClasses($scope.statusOptions, $scope.recordStatus);  
        });

    }

    /********** Save Request and List of Items Requested **********/
    $scope.createRequest = function() {
            console.log("Post Request");

            for (var i=0; i<$scope.items.length; i++) {
                $scope.items[i]['Cost_Centre_ID'] = $scope.Cost_Centre_ID;
                $scope.items[i]['Unit_Cost'] = $scope.items[i]['Cost'];
                console.log('also include ' + $scope.Cost_Centre_ID + ' AND ' + $scope.items[i]['Unit_Cost'])
            }

            var data = { 
                'FKRequester_User__ID' : $scope.userid, 
                'Request_Date' : $scope.timestamp,
                'FK_Cost_Centre__ID' : $scope.Cost_Centre_ID,
                'Request_Notes' : $scope.Request_Notes,
                'Request_Status' : 'Requested',
                'items' : $scope.items,
                'map'   : $scope.itemSet,
            }; 

            var jsonData = JSON.stringify(data);
            var url = "/pram/request/create";
            $q.when($scope.$parent.createRecord(url, jsonData))
            .then ( function (response) {
                console.log('got response');
                console.log(response);

                console.log(JSON.stringify($scope.createdRecords));
                var created = $scope.createdRecords[$scope.createdRecords.length-1];
                $scope.recordId = created['id'];

                var link = "Request #" + $scope.recordId + ' created : ' + created['description']
                console.log('created Request # ' + $scope.recordId);
                
                $scope.clearScope();
                $scope.$parent.mainMessage = link;
                // $('#topMessage').html(link);

            });           
    }

    $scope.cloneRecord = function () {
        console.log("Cloning Request " + $scope.recordId);
        $scope.recordId = '';
        $scope.Request_Date = '';
        $scope.requester = '';
        $scope.requesterId = '';
    }

    /********** Save New Item **********/
    $scope.newItem = function() {

        /** sync angular element to manually set element */
        var Velement = document.getElementById('new_Vendor_ID');
        if (Velement) {
            $scope.new_Vendor_ID = Velement.value;
        }

        if ($scope.userid === undefined) {
            $scope.userid = document.getElementById('FKRequester_User__ID').value;
        }
     
        console.log("Category:" + $scope.Item_Category_ID);
 
        var data = { 
            'Item_Name' : $scope.new_Name, 
            'FK_Item_Category__ID' : $scope.Item_Category_ID,
            'Item_Catalog' : $scope.new_Catalog,
            'Item_Description' : $scope.new_Description,
            'Item_Cost' : $scope.new_Cost,
            'FK_Vendor__ID' : $scope.new_Vendor_ID
        }; 
        var jsonData = JSON.stringify(data);

        $q.when( $scope.$parent.newItem(jsonData) )
        .then ( function (response) {
            console.log("Added new item: " + $scope.new_Name);
            $scope.new_Item_ID = $scope.itemId;
            console.log("new item ID: " + $scope.itemId);

            for ( var i=0; i<$scope.itemColumns.length; i++) {
                var col = $scope.itemColumns[i];
                // if (col['hidden']) { continue }

                var id = col['field'];
                var label = col['label'] || col['field'];
                var model = 'new_' + label;

                var el = document.getElementById(id);
                if ( el && $scope[model] ) {
                    el.value = $scope[model];
                    console.log('also set ' + id + ' to ' + model + ' = ' + $scope[model]);
                }
            }
 
        },
        function (error) {
            console.log("Error: " + error);
        });
    }

    $scope.dumpLocalScope = function () {
        console.log("*** Dumped Local Attribute List **");
        for (var i= 0; i<$scope.attributes.length; i++) {
            var att = $scope.attributes[i];
            console.log(att + ' = ' + $scope[att]);
            if ($scope.$parent[att] && $scope.$parent[att] != $scope[att]) { console.log("** Parent  " + att + " = " + $scope.$parent[att]) }
        }

        console.log('id: ' + $scope.recordId);
        console.log('url: ' + $scope.url + ' : ' + $scope.$parent.url);
        console.log('config: ' + JSON.stringify($scope.config))
        console.log('P config: ' + JSON.stringify($scope.$parent.config))

        console.log("** message **");
        console.log($scope.mainMessage);
        console.log("** Local Items: **");
        for (var i= 0; i<$scope.items.length; i++)  {
            console.log(JSON.stringify($scope.items[i]))
        }
        console.log("** item Maps **");
        console.log('Set: ' + JSON.stringify($scope.Set));
        console.log('ReSet: ' + JSON.stringify($scope.Reset));
        console.log('Map: ' + JSON.stringify($scope.Map));
        console.log('item Set: ' + JSON.stringify($scope.itemSet));
        console.log('item ReSet: ' + JSON.stringify($scope.itemReset));
        console.log('item Map: ' + JSON.stringify($scope.itemMap));
        console.log("**Local Lookups: **");
        console.log(JSON.stringify($scope.Lookup));
        console.log("** DB logs **");
        console.log(JSON.stringify($scope.createdRecords));
        console.log(JSON.stringify($scope.editedRecords));
    }


}]);
