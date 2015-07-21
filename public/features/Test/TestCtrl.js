'use strict';
var app = angular.module('myApp');

app.controller('TestCtrl', 
    ['$scope', '$q', '$rootScope', '$http', '$location', '$injector', 'Nto1Factory', 'AuthenticationService' , 
    function ($scope, $q, $rootScope, $http, $location, $injector, Nto1Factory, AuthenticationService) {
	console.log('loaded Test Controller');

/** Customize Section **/
    $scope.CustomData = function () {
        $scope.userid = document.getElementById('FKRequester_User__ID').value;
        $scope.itemVendorId = document.getElementById('Vendor_ID').value;
        $scope.itemVendor = document.getElementById('Vendor').value;
 
         $scope.insertData = { 
                'Item_Name' : $scope.itemName, 
                'FK_Item_Category__ID' : $scope.itemCategory,
                'Item_Catalog' : $scope.itemCatalog,
                'Item_Description' : $scope.itemDescription,
                'Item_Cost' : $scope.itemCost,
                'Vendor_ID' : $scope.itemVendorId,
                'Requester' : $scope.itemRequestBy,
                'Request_Date' : $scope.itemRequestDate,
                'Item_Request_Notes' : $scope.itemRequestNotes
          };    
    }


    $scope.example7data =  [{id: 1, label: "David"}, {id: 2, label: "Jhon"}, {id: 3, label: "Danny"}]; 
    $scope.example7model = {}; //example7data[1]; // [{id: 2}]; // $scope.example7data[1]; 
    $scope.example7settings = $scope.MenuSettings; //{externalIdProp: ''};

    $scope.formats = ['A','B','C'];
    $scope.dt1 = [];
    $scope.dt2 = '';

    $scope.title = 'title..';
    $scope.exampleData = [{"id" : 1, "label" : "Ashley"}, {"id" : 2, "label" : "Beth"}];
    $scope.exampleModel = [];
    $scope.customLoad = function () {
        console.log('custom load...');
        $scope.dumpScope();
    }

    /********** Update Cost Totals **********/
    $scope.updateTotals = function (index) {
        var total = 0;
        for (var i=0; i < $scope.items.length; i++) {
            var thisItem = $scope.items[i];

            // $scope.items[i]['Total'] = $scope.items[i]['Qty'] * $scope.items[i]['Cost'];

            var itemTotal = thisItem.Cost * thisItem.Qty;
            $scope.items[i].Total = itemTotal;
            console.log('reset item total to ' + itemTotal);
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

    $scope.customUpdate = function (index) {
        $scope.updateTotals(index);
    }

    /** Set common Vendor based on individual Vendor **/
    $scope.inheritItemAttribute = function (index) {
        console.log('inherit Vendor...' + index);
        var atts = ['Vendor', 'Vendor_ID'];
        var errMsg = "Note Vendor Conflict";

        var conflicts = [];
        for (var i=0; i<atts.length; i++) {
            var att = atts[i];
            var current = $scope[att];
            if (current == undefined) {
                $scope[att] = $scope.items[index][att];
                console.log('set ' + att + ' to ' + $scope[att]);
            }
            else if (current == $scope.items[index][att]) {
                console.log(att + ' concurs...');
            }
            else {
                console.log(att + ' conflict');
                conflicts.push(att);
            }
        }

        if (conflicts.length) {
            alert(errMsg);
            console.log(errMsg);
        }
    }

    $scope.customAdd = function (index) {
        // $scope.items[index]['Total'] = $scope.items[index]['Qty'] * $scope.items[index]['Cost'];
        $scope.inheritItemAttribute(index);
    }

    $scope.customCreateRecord = function() {
        console.log('custom Create');
        $scope.userid = document.getElementById('userid').value;
        $scope.costCentre = $scope.CC.id;

        var data = { 
            'FKOwner_User__ID' : $scope.ownerId,
            'FKRequisitioner_User__ID' : $scope.requisitioner,
            'Requisition_Date' : $scope.timestamp,
            // 'FK_Cost_Centre__ID' : $scope.costCentre,
            'Requisition_Notes' : $scope.Requisition_Notes,
            'Requisition_Notes' : $scope.orderNotes,
            'Requisition_Number' : $scope.RequisitionNo,
            'Quote_Number' : $scope.Quote,
            'Requisition_Status' : 'Requisitioned',
            'items' : $scope.items,
            'map'   : $scope.itemSet,
        }; 

        var jsonData = JSON.stringify(data);

        console.log($scope.url);
        console.log(jsonData);

        var feedback = $http.post($scope.url + "/order/requisition", jsonData )
            .success ( function (response) {
                console.log("Posted successfully");

                var orderId = response['Requisition_ID'];
                var orderDescription = response['Description']
                
                var link = $scope.button;

                $scope.recordDescription = response['Description'];
                $scope.class = 'Order';
                $scope.recordId = orderId;

                $('#topMessage').html(link);
                console.log(response);
                $scope.clear();
            })
            .error (function (error) {
                console.log("Error saving requisition");
                console.log(jsonData);
                console.log(error);
            });

        console.log(feedback);
    }

    $scope.customConfig = function () {
            $scope.creator = $scope.user;
            $scope.creatorId = $scope.userid;
            $scope.requisitioner = $scope.user;
            $scope.requisitionerId = $scope.userid;
            $scope.owner = 'George Yang';
            $scope.ownerId = '2';
    }

    $scope.customInitialize = function () {

        $scope.itemClass = 'Item_Request';
        $scope.customQuery = "Select * from Requisition, Item_Request WHERE FK_Requisition__ID=Requisition_ID AND Requisition_ID = '" + $scope.recordId + "'";

        $scope.statusField = 'recordStatus';
        $scope.statusDefault = 'Pending';

        /* Customize as Required */
        $scope.statusOptions = ['Pending', 'Requisitioned', 'Ordered', 'Received','Reconciled'];
        
        $scope.url = "http://limsdemo.bcgsc.ca:3031";

        $scope.Columns = [
            { field : 'Requisition_ID', label : 'orderId', mandatory : 1, set: 1 },
            { field : 'Requisition_Notes', set: 1 },            
            { field : 'FKOwner_User__ID', label : 'ownerId', mandatory : 1, set: 1 },
            { field : 'FKCreator_User__ID', label : 'creatorId', mandatory : 1, set: 1 },
            { field : 'Requisition_Date', label : 'requisitioned', mandatory : 1, set: 1 },
            { field : 'Creation_Date', label : 'created', mandatory : 1, set: 1 },
            { field : 'Order_Date', label : 'ordered', mandatory : 0, set: 1 },
            { field : 'FKOrderer_User__ID', label : 'ordererId', mandatory : 1, set: 1 },
            { field : 'Requisition_Status', label : 'recordStatus', mandatory : 1, set: 1 },
            { field : 'Requisition_Notes', set: 1 },
            { field : 'FK_Vendor__ID', label : 'VendorId', mandatory : 1, set: 1 },
            { field : 'Vendor_Name', label : 'Vendor', mandatory : 1},
            { field : 'Requisition_Number', label : 'requisitionNo', set: 1 },
            { field : 'PO_Number', label : 'PONumber', set: 1 },
            { field : 'PO_Date', label : 'PODate', set: 1 },
            { field : 'Quote_Number', label : 'Quote', set: 1 },
            { field : 'Vendor_Name', label : 'Vendor', mandatory : 1}  // not set ...
       ];
        /** mapping item columns for search & inclusion **/

        $scope.itemColumns = [
            { field : 'Request_Date', reset: 1, mandatory : 1, type:'date'},
            { label : 'Requested_By', reset: 1, field : 'User_Name', mandatory : 1},
            { label : 'Qty', set: 1, reset: 1, field : 'Unit_Qty', mandatory : 1, type:'number'},
            { label : 'Cost', set: 1, reset: 1, field : 'Unit_Cost', mandatory : 1, type:'number'},
            { label : 'Name', reset: 1, field : 'Item_Name', mandatory : 1},
            { label : 'Item_Request_ID', set: 1, field : 'Item_Request_ID', target : 'FK_Item_Request__ID', mandatory : 1, hidden:1},
            { label : 'Vendor', reset: 1, field : 'Vendor_Name', mandatory : 1},
            { label : 'Vendor_ID', reset: 1, field : 'Vendor_ID', mandatory : 1, type: 'number', hidden:1},
            { label : 'Catalog', reset: 1, field : 'Item_Catalog'},
            { label : 'DeliverTo', field : 'Deliver_To'},
            { label : 'CostCentreID', set: 1, field : 'FK_Cost_Centre__ID', hidden:1},            
            { label : 'CostCentre', field : 'Cost_Centre_Description'},            
            { label : 'Notes', reset: 1, set: 1, field : 'Item_Request_Notes'}
        ];

        $scope.recordStatus = 'Pending';
         
        $scope.subTotal = '0.00';
        $scope.pstTotal = '0.00';
        $scope.gstTotal = '0.00';
        $scope.costTotal = '0.00';
   
        $scope.Query = {
            url : $scope.url + '/api/q',
            target : 'Item_Name',
            show : "User_Name,Request_Date,Item_Category_Description,Item_Name,Item_Description,Item_Catalog,Vendor_Name,Unit_Qty, Unit_Cost,Item_Request_Notes, Deliver_To",
            query_table : "(Item, Item_Request, Request, User) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=FK_Vendor__ID",
            query_field : "User_Name,Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, CASE WHEN Unit_Cost IS NULL THEN Item_Cost ELSE Unit_Cost END as Unit_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes",
            query_condition : "FK_Request__ID=Request_ID AND FKRequester_User__ID=User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID",
            // query : "SELECT DISTINCT User_Name,Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, CASE WHEN Unit_Cost IS NULL THEN Item_Cost ELSE Unit_Cost END as Unit_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes FROM (Item, Item_Request, Request, User) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=FK_Vendor__ID WHERE FK_Request__ID=Request_ID AND FKRequester_User__ID=User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID",
            set : "Item_Category_Description,Unit_Qty,Unit_Cost,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name,Item_Request_ID,User_Name,Request_Date,Item_Request_Notes, Deliver_To",
            condition : "FK_Item_Category__ID IN (<Item_Category>)",
            onEmpty : "No Requested Items found.<P><div class='alert alert-warning'>Please try different spellings or different field to search.</div>\n"
        };
        console.log($scope.Query['url']);

    }

    $scope.initialize = function(config) {
        $scope.customConfig();      
        $scope.customInitialize();

        console.log("Initialize " + $scope.statusField + '=' + $scope.statusDefault);
           if ($scope.statusField) {
            $scope[$scope.statusField] = $scope.statusDefault;
            console.log('set ' + $scope.recordStatus);

            Nto1Factory.setClasses($scope.statusOptions, $scope[$scope.statusField]);  
        }
        if (! $scope.requistioned ) { $scope.requisitioned = $scope.timestamp }
        if (! $scope.created  ) { $scope.created = $scope.timestamp }

        Nto1Factory.extend_Parameters($scope.Columns, $scope.itemColumns, $scope.Query);

        $scope.ac_options = JSON.stringify($scope.Query);

        /* ?? */
        $scope.manualSet = ['Request_Notes'];  /* manually reset */
    }

   /********** Add Item to List of Requests **********/
    $scope.addItem = function( ) {
        Nto1Factory.addItem( $scope.itemColumns, $scope.items );
        var index = $scope.items.length - 1;
        $scope.customAdd(index);
        $scope.customUpdate(index);
        console.log('added item');
    }

    $scope.loadRecord = function (recordId) {

        $scope.preLoadRecord(recordId);
        for (vari=0; i<$scope.items.length; i++) {
            $scope.customAdd(i);
            $scope.customUpdate(i);
        }

        $scope.customLoad();
    }

    $scope.createRecord = function () {
        $scope.customCreateRecord();
    }

    /********** Save New Item **********/
    $scope.newItem = function() {
        $scope.CustomData();
        var data = $scope.insertData();

        var jsonData = JSON.stringify(data);
        console.log(jsonData);
        /* custom */
        var feedback = $http.post("/record/insert/" + $scope.itemClass, jsonData ).
            success ( function (response) {
                console.log("Added New Record");
                var itemId = response['record_ID'];
                var recordDescription = response['Description'];
                var link = "<div class='alert alert-warning'><A href ='/record/Item/" + itemId + "?format=html'> New Item #" + itemId + ' - ' + recordDescription + "</A></div>\n";
                
                $scope.itemId = itemId;
                $('#topMessage').html(link);
                $('#newItemModal').modal('hide');
                console.log('Reset main message');
                $('#message').html("<div class='alert alert-warning'>Added New Record ...</div>");
                console.log(response);
            }).
            error (function (response) {
                    console.log("Failed to Insert");    
        });

        $('#internalMessage').html('');
            console.log(feedback);
    }

    $scope.Lookup = {};
    $scope.loadLookup = function (table, model, def) {
        if ($scope.Lookup[table]) {
            console.log('already loaded ' + table);
        }
        else {
            var url = $scope.url + "/api/lookup/" + table;
            console.log("API = " + url + ' -> ' + table);
            Nto1Factory.loadLookup(url, table, model, def);
        }
    }
    $scope.initialize();


}]);
