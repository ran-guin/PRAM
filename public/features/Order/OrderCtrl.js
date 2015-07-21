'use strict';
var app = angular.module('myApp');

app.controller('OrderCtrl', 
    ['$scope', '$log', '$q', '$rootScope', '$http', '$location', '$injector', 'Nto1Factory', 'AuthenticationService', 
    function ($scope, $log, $q, $rootScope, $http, $location, $injector, Nto1Factory, AuthenticationService) {

	console.log('loaded Order Controller');

    /** timer with date + hours + minutes - automatically updates  **/
    var update_seconds = 1;    
    setInterval (function() {

        if ($scope.recordStatus == 'Pending') { 
          $scope.$parent.created = $scope.timestamp; 
          $scope.$parent.requisitioned = $scope.timestamp;
        }
        else if ($scope.recordStatus == 'Requisitioned') { $scope.$parent.ordered = $scope.timestamp }
        else if ($scope.recordStatus == 'Ordered') { $scope.$parent.received = $scope.timestamp }
        else if ($scope.recordStatus == 'RecievedinFull') { $scope.$parent.reconciled = $scope.timestamp }
        else if ($scope.recordStatus == 'Pending') { $scope.$parent.requisitioned = $scope.timestamp }

        $scope.$apply();
    }, update_seconds*1000);


    /********** Update Cost Totals **********/
    $scope.updateTotals = function (index) {
        var total = 0;
        for (var i=0; i < $scope.items.length; i++) {
            var thisItem = $scope.items[i];

            $scope.items[i].updateCost = true;
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

    $scope.confirmPrice = function (index) {
      console.log("Confirm price for item # " + index);
      console.log($scope.items[index]['Cost']);

      var updateDB = 0;
      if ($scope.items[index]['Cost'] === null || $scope.items[index]['Cost'].length == 0 ) {
          $scope.items[index]['Cost'] = $scope.items[index]['Item_Cost'];
          console.log('set to item cost...' + $scope.items[index]['Cost']);
      }
      else {
        if ($scope.items[index].updateCost) {
          updateDB = 1;
        }
      }
      $scope.updateTotals();

      var itemRequestId = $scope.items[index]['Item_Request_ID'];
      if (itemRequestId) {
        var data = JSON.stringify({ 'Unit_Cost' : $scope.items[index]['Cost'] });

        var url = "/pram/record/update/Item_Request/" + itemRequestId;
        $q.when( $http.post(url, data ) )
        .then ( function (res) {
          $scope.items[index].fixPrice = 0;
          console.log("updated price #" + index); 
        },
        function (error) {
          console.log('update price error ' + error);
        });
      }
    }

    $scope.fixPrice = function (index) {
        $scope.items[index].fixPrice = 1;
    }

    $scope.customUpdate = function (index) {
        $scope.updateTotals(index);
    }

    $scope.customAdd = function (index) {
        // $scope.items[index]['Total'] = $scope.items[index]['Qty'] * $scope.items[index]['Cost'];
        console.log('inherit Vendor...' + index);
        var atts = ['Vendor', 'Vendor_ID'];
        var errMsg = "Note Vendor Conflict";

        $scope.$parent.inheritItemAttribute(index, atts, errMsg);
    }

/** TEMPORARY CUSTOM */
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clearScope = function () {
    $scope.dt = null;
    $scope.$parent.clearScope();
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 2);
  $scope.events =
    [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i=0;i<$scope.events.length;i++){
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };

  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 2);
  $scope.events =
    [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i=0;i<$scope.events.length;i++){
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };

  // examples from angular bootstrap

  $scope.$parent.CostCentres = [];

    /** run PRIOR to standard initialization  */
    $scope.setup = function (config) {
        $scope.$parent.itemClass = 'Item_Request';
        $scope.$parent.mainClass = 'Requisition';
        
        $scope.$parent.statusField = 'recordStatus';
        $scope.$parent.statusDefault = 'Pending';

        $scope.editAccess = {};
        /* Customize as Required */
        $scope.$parent.statusOptions = ['Pending', 'Requisitioned', 'Ordered', 'Received in Part','Received in Full', 'Reconciled'];
        $scope.editAccess['Item_Request'] = 1; // get from authorization ... 

        $scope.Columns = [
            { field : 'Requisition_ID', label : 'orderId', mandatory : 1, set: 1 },
            { field : 'Requisition_Notes', set: 1 },            
            { field : 'FKOwner_User__ID', label : 'ownerId', mandatory : 1, set: 1 },
            { field : 'Owner.User_Name', label : 'owner', mandatory : 1, set: 1 },
            { field : 'FKCreator_User__ID', label : 'creatorId', mandatory : 1, set: 1 },
            { field : 'Creator.User_Name', label : 'creator', mandatory : 1, set: 1 },
            // { field : 'FKRequester_User__ID', label : 'requesterId', mandatory : 1, set: 1 },
            // { field : 'Requester.User_Name', label : 'requester', mandatory : 1, set: 1 },
            { field : 'Last_Updated', type: 'date'},
            { field : 'Updater.User_Name', label : 'updater'},
            { field : 'FKUpdater_User__ID', label : 'updaterId'},
            { field : 'Requisition_Date', label : 'requisitioned', mandatory : 1, set: 1 },
            { field : 'Creation_Date', label : 'created', mandatory : 1, set: 1 },
            { field : 'Order_Date', label : 'ordered', mandatory : 0, set: 1 },
            { field : 'FKOrderer_User__ID', label : 'ordererId', mandatory : 1, set: 1 },
            { field : 'Requisition_Status', label : 'recordStatus', mandatory : 1, set: 1 },
            { field : 'Requisition_Notes', set: 1 },
            { field : 'Requisition.FK_Vendor__ID', label : 'Vendor_ID', mandatory : 1 },
            { field : 'Vendor_Name', label : 'Vendor', mandatory : 1},
            { field : 'Requisition_Number', set: 1 },
            { field : 'PO_Number', label : 'PONumber', set: 1 },
            { field : 'PO_Date', label : 'PODate', set: 1 },
            { field : 'Quote_Number', label : 'Quote', set: 1 },
            // { field : 'Vendor_ID', label : 'VendorId', mandatory : 1},  // not set ...
            // { field : 'Requisition.FK_Cost_Centre__ID', label: 'CCID', set: 1 },
            { field : 'Invoice_Number', set: 1 },
            { field : 'Ledger_Number', set: 1 },
            { field : 'FKReconciler_User__ID', label :  'reconcilerId', set: 1 },
            { field : 'Reconciliation_Date', set: 1 },
            { field : 'Reconciler.User_Name', label :  'reconciler'},
      ];
        /** mapping item columns for search & inclusion **/

        $scope.itemColumns = [
            { field : 'Request_Date', reset: 1, mandatory : 1, type:'date'},
            { label : 'Requested_By', reset: 1, field : 'Requester.User_Name', mandatory : 1},
            { label : 'Qty', set: 1, reset: 1, field : 'Unit_Qty', mandatory : 1, type:'number'},
            { label : 'Cost', set: 1, reset: 1, field : 'Unit_Cost', mandatory : 1, hidden:1},
            { field : 'Item_Cost', type: 'number'},
            { label : 'Name', reset: 1, field : 'Item_Name', mandatory : 1},
            { label : 'Item_Request_ID', set: 1, field : 'Item_Request_ID', target : 'FK_Item_Request__ID', mandatory : 1, hidden:1},
            { label : 'Vendor', reset: 1, field : 'Vendor_Name', mandatory : 1},
            { field : 'Vendor_Phone', hidden: 1},
            { label : 'Vendor_ID', reset: 1, field : 'Vendor_ID', mandatory : 1, type: 'number', hidden:1},
            { label : 'Catalog', reset: 1, field : 'Item_Catalog'},
            { label : 'DeliverTo', field : 'Deliver_To'},
            { label : 'CostCentreID', set: 1, field : 'Item_Request.FK_Cost_Centre__ID', hidden:1},            
            { label : 'CostCentre', field : 'Cost_Centre_Description', hidden: 1},            
            { label : 'Notes', reset: 1, set: 1, field : 'Item_Request_Notes'},
            { field : 'Last_Received_Date', label : 'Received_Date', hidden: 1},
            { field : 'Received_Qty' },
        ];
         
        // $scope.$parent.manualSet = ['Requisition_Notes'];

        $scope.subTotal = '0.00';
        $scope.pstTotal = '0.00';
        $scope.gstTotal = '0.00';
        $scope.costTotal = '0.00'; 

        $scope.Autocomplete = {
            url : '/pram/api/q',
            target : 'Item_Name',
            show : "Requester.User_Name,Request_Date,Item_Category_Description,Item_Name,Item_Description,Item_Catalog,Vendor_Name,Unit_Qty, Item_Cost, Unit_Cost,Item_Request_Notes, Deliver_To, Received_Qty, Received_Date",
            search : 'Request_Date,Requested_By,Qty,Item_Cost,Name,Vendor,Catalog,DeliverTo,CostCentre,Notes',
            hide: 'Item_Request_ID,Vendor_ID,CostCentreCostCentreID,Unit_Cost',
            query_table : "(Item, Item_Request, Request, User AS Requester) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=FK_Vendor__ID",
            query_field : "Vendor_Phone, Requester.User_Name, Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, Item_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes",
            query_condition : "FK_Request__ID=Request_ID AND FKRequester_User__ID=Requester.User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID",
            group : "Item_Request_ID",
            // query : "SELECT DISTINCT User_Name,Request_Date,Item_Request_ID,Item_Category_Description,Unit_Qty,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name, CASE WHEN Unit_Cost IS NULL THEN Item_Cost ELSE Unit_Cost END as Unit_Cost,Item_Request_Notes,Deliver_To, Item_Request_Notes FROM (Item, Item_Request, Request, User) JOIN Item_Category ON FK_Item_Category__ID=Item_Category_ID LEFT JOIN Vendor ON Vendor_ID=FK_Vendor__ID WHERE FK_Request__ID=Request_ID AND FKRequester_User__ID=User_ID AND FK_Item__ID=Item_ID AND Request_ID=FK_Request__ID",
            set : "Vendor_Phone, Item_Category_Description,Unit_Qty,Short_Qty, Item_Cost,Item_Name,Item_Catalog,Vendor_ID,Vendor_Name,Item_Request_ID,User_Name,Request_Date,Item_Request_Notes, Deliver_To,Requested_By",
            condition : "FK_Item_Category__ID IN (<Item_Category>)",
            onEmpty : "No Requested Items found.<P><div class='alert alert-warning'>Please try different spellings or different field to search.</div>\n"
        };
         
        $scope.$parent.queryTables = "(Requisition, Item_Request, Vendor, Request, Item, User as Creator, Cost_Centre)";
        $scope.$parent.queryTables += " LEFT JOIN User as Requester ON Request.FKRequester_User__ID=Requester.User_ID LEFT JOIN User as Owner ON Owner.User_ID=FKOwner_User__ID LEFT JOIN User as Reconciler ON Reconciler.User_ID=FKReconciler_User__ID LEFT JOIN User as Updater ON Updater.User_ID=FKUpdater_User__ID";
        $scope.$parent.queryCondition = "FK_Requisition__ID=Requisition_ID AND Requisition.FK_Vendor__ID=Vendor_ID AND FK_Request__ID=Request_ID AND FK_Item__ID=Item_ID AND FKCreator_User__ID=Creator.User_ID AND Item_Request.FK_Cost_Centre__ID=Cost_Centre_ID";
        $scope.$parent.queryGroup = 'Item_Request_ID';

        console.log($scope.Autocomplete['url']);
         
        Nto1Factory.extend_Parameters($scope.Columns, $scope.itemColumns, $scope.Autocomplete);

        $scope.$parent.setup(config);
    }

    $scope.initialize = function( config ) {

        console.log("local init: " + config);

        $scope.setup(config);

        $scope.$parent.initialize(config);

        if (! $scope.creator) {
          console.log('default creator to user : ' + $scope.user);
          $scope.creator = $scope.user;
          $scope.creatorId = $scope.userid;
          $scope.requisitioner = $scope.user;
          $scope.requisitionerId = $scope.userid;
        }

        if ($scope.recordId) { 
          $q.when( $scope.loadRecord($scope.recordId) )
          .then ( function (res) {

            console.log("LR352 : " + $scope.recordId);
            // console.log(JSON.stringify($scope.Lookup));
            // if ($scope.Lookup.CostCentre['value']) {
            //   var def = $scope.Lookup.CostCentre['value'];
            //   console.log('set default lookup to ' + def);
            //   $scope.resetModel(Cost_Centre, def);
            // }
          });
        }
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

        /* ?? */
        $scope.manualSet = ['Request_Notes'];  /* manually reset */
    }

   /********** Add Item to List of Requests **********/
    $scope.addItem = function( ) {
        Nto1Factory.addItem( $scope.itemColumns, $scope.items );
        var index = $scope.items.length - 1;
        $scope.customAdd(index);
        $scope.customUpdate(index);
        
        $scope.$parent.items[index].Received_Qty = 0;
        
        console.log('added item');
    }

    $scope.loadRecord = function (recordId) {
        var fields = $scope.Fields.join(',');
        var itemfields = $scope.itemFields.join(',');

        $scope.$parent.customQuery = "Select " + fields + ',' + itemfields;
        $scope.$parent.loadCondition = "Requisition_ID = '" + recordId + "'";

        $scope.$parent.customQuery += " FROM " + $scope.queryTables + " WHERE " + $scope.queryCondition + ' AND ' + $scope.loadCondition;

        if ($scope.queryGroup) { $scope.$parent.customQuery += " GROUP BY " + $scope.queryGroup }
        
        console.log($scope.customQuery);
        var url = '/pram/api/q';
        console.log('preload from ' + url);

        /* implement promise */
        var promise =  $scope.$parent.loadRecord(url, recordId, $scope.customQuery);
        $q.when(promise)
        .then ( function (res) {
            $scope.loadCostCentre();
            $scope.loadNextStatus();
            Nto1Factory.setClasses($scope.statusOptions, $scope.recordStatus); 
            console.log('apply user  ' + $scope.user);

            $scope.$parent.highlightBackground = "background-color:#9C9;";

            if ($scope.recordStatus == 'Pending') {
                var highlight_element = document.getElementById('pendingHeader');
                if (highlight_element) { highlight_element.setAttribute('style', $scope.highlightBackground) }
           }
            else if ($scope.recordStatus == 'Requisitioned') {
                var highlight_element = document.getElementById('requisitionedHeader');
                if (highlight_element) { highlight_element.setAttribute('style', $scope.highlightBackground) }
           }
            else if ($scope.recordStatus == 'Ordered') {
                var highlight_element = document.getElementById('orderedHeader');
                if (highlight_element) { highlight_element.setAttribute('style', $scope.highlightBackground) }
            }
            else if ($scope.recordStatus == 'Received in Full') {
                var highlight_element = document.getElementById('receivedHeader');
                if (highlight_element) { highlight_element.setAttribute('style', $scope.highlightBackground) }
           }  
           else {
            console.log('unrecognized status: ' + $scope.recordStatus);
           }
        });
    }

    $scope.loadCostCentre = function () {
        /* implement promise */
             console.log('checking ' + $scope.items.length + " referenced items");
            for (var i=0; i<$scope.items.length; i++) {
                $scope.customAdd(i);
                $scope.customUpdate(i);

                /** Sync Cost Centre **/
                console.log('load cost centre ' + $scope.CostCentreId);
                console.log( JSON.stringify($scope.items[i]) );
                if ( $scope.CostCentreId === undefined ) {
                    $scope.CostCentreId = $scope.items[i]['CostCentreID'];
                }
                else if ($scope.CostCentreId == $scope.items[i]['CostCentreID'] ) {
                    /* ignore */ 
                    console.log('already set ')
                }
                else {
                    console.log('Cost Centre Conflict');
                    $scope['CostCentreId'] = 'n/a';
                }
                var el = document.getElementById('Funding');
                if (el) {
                    el.value = $scope.CostCentreId;
                    console.log('set cost centre ' + $scope.CostCentreId);
                }

            }

    }

    $scope.createRequisition = function () {
       $scope.costCentre = $scope.Cost_Centre.id;

        var data = { 
            'FKOwner_User__ID' : $scope.ownerId,
            'FKCreator_User__ID' : $scope.creatorId,
            'Creation_Date' : $scope.timestamp,
            'Requisition_Date' : $scope.timestamp,
            'FK_Vendor__ID' : $scope.Vendor_ID,
            // 'FK_Cost_Centre__ID' : $scope.costCentre,
            'Requisition_Notes' : $scope.Requisition_Notes,
            'Requisition_Number' : $scope.Requisition_Number,
            'Quote_Number' : $scope.Quote,
            'Requisition_Status' : 'Requisitioned',
            'items' : $scope.items,
            'map'   : $scope.itemSet,
        }; 

        var jsonData = JSON.stringify(data);
        var url = "/pram/order/create";
        $q.when($scope.$parent.createRecord(url, jsonData))
        .then ( function (response) {
            console.log('got response');
            console.log(response);

            var created = $scope.createdRecords[$scope.createdRecords.length-1];
            $scope.recordId = created['id'];

            var link = "Order #" + $scope.recordId + ' created : ' + created['description']
            console.log('created Order # ' + $scope.recordId);

            $q.when( $scope.loadRecord($scope.recordId))
            .then ( function (response) {
                Nto1Factory.setClasses($scope.statusOptions, $scope.$parent.recordStatus); 
            });
            console.log("LR517 : " + $scope.recordId);
            $('#topMessage').html(link);

        });
    }

    $scope.receiveAll = function () {
        console.log('receive all items');
        for (var i= 0; i<$scope.items.length; i++)  {
            $scope.$parent.items[i]['Rcvd_Qty'] = $scope.items[i]['Qty'];
            console.log('Rcvd ' + $scope.items[i]['Qty'] + ' of item # ' + i);
        }
    }

    $scope.recordReceipt = function () {
        console.log('record receipt');

        $scope.$parent.itemsReceivedinFull = 0;
        $scope.$parent.itemsReceivedinPart = 0;

        var promises = $scope.items.map(function (item) {
            return $scope.receiveThisItem(item);
        });

        return $q.all(promises)
        .then ( function () {
            var newStatus = '';
            if ($scope.$parent.itemsReceivedinFull) {
               if ($scope.recordStatus != 'Received in Full') {
                  newStatus = 'Received in Full'
               }
            }
            else if ($scope.$parent.itemsReceivedinFull || $scope.$parent.itemsReceivedinFull) {
              if ($scope.recordStatus != 'Received in Part') {
                newStatus = 'Received in Part';
              }
            }

            if (newStatus && $scope.recordId) {
              var updateData = JSON.stringify({'Requisition_Status' : newStatus});
              var updateURL = '/pram/api/update/Requisition/' + $scope.recordId;

              $q.when ( $scope.$parent.saveChanges(updateURL, updateData) )
              .then ( function () {
                  $scope.loadRecord($scope.recordId);
                  console.log("LR561 : " + $scope.recordId);
              });
            }

        }, 
        function (error) {
          if (error) {
            console.log("Error: " + error)
          }
        });
    }

    $scope.receiveThisItem = function (item) {
      console.log("Received Item:" + JSON.stringify(item));
        var itemRequestId = item['Item_Request_ID'];

        var qty = item['Rcvd_Qty'];
        var total = qty + item['Received_Qty'];
        
        if (qty < 1) { return $q.when(null) }

        console.log(itemRequestId + ' received x ' + qty + " = " + total);

        console.log('Received Item Request ' + itemRequestId + " x " + qty);
        var data = {
            'FKReceiver_User__ID' : $scope.userid,
            'Rcvd_Date' : $scope.timestamp,
            'Rcvd_Qty' : qty,
            'FK_Item_Request__ID' : itemRequestId,
            'Receipt_Notes' : item.Receipt_Notes,
         };         

         var IRstatus = 'Pending';
         if (total >= item['Qty']) {
            IRstatus = 'Received in Full';
            $scope.$parent.itemsReceivedinFull++;
         }
         else if (total > 0) {
            IRstatus = 'Received in Part';
             $scope.$parent.itemsReceivedinPart++;
        }
        item['Status'] = IRstatus;

        var jsonData = JSON.stringify(data);
        var url = '/pram/api/create/Receipt';
            
        return $q.when ($scope.$parent.createRecord(url, jsonData))
        .then ( function () {
            var update = {
                'Received_Qty' : total,
                'Last_Received_Date' : $scope.timestamp,
                'Item_Request_Status' : IRstatus,
            }
            var updateData = JSON.stringify(update);
            var updateURL = '/pram/api/update/Item_Request/' + itemRequestId;

            console.log("... and update Item_Request");
            $q.when ( $scope.$parent.saveChanges(updateURL, updateData) )
            .then ( function () {
                $scope.loadRecord($scope.recordId);
                 console.log("LR621 : " + $scope.recordId);
            });
        });        
    }

    $scope.saveChanges = function (status) {

        if ($scope.recordStatus == 'Pending') {
            $scope.$parent.requisitioner = $scope.user;
            $scope.$parent.requisitionerId = $scope.userid;
            $scope.$parent.requisitioned = $scope.timestamp;
            console.log('set requisitioner');
        }
        else if ($scope.recordStatus == 'Requisitioned') {
            $scope.$parent.orderer = $scope.user;
            $scope.$parent.ordererId = $scope.userid;
            $scope.ordered = $scope.timestamp;
             console.log('set orderer');
        }
        else if ($scope.recordStatus == 'Ordered') {
            $scope.receiver = $scope.user;
            $scope.receiverId = $scope.userid;
            $scope.received = $scope.timestamp;
            console.log('set receiver');
        }
        else if ($scope.recordStatus == 'Received in Full') {
            $scope.reconciler = $scope.user;
            $scope.reconcilerId = $scope.userid;
            $scope.Reconciliation_Date = $scope.timestamp;
            console.log('set reconciler');
        }  
        else {
          console.log('unrecognized status: ' + $scope.recordStatus);
        }

        var data = {
                'FKOwner_User__ID' : $scope.ownerId,
                // 'FKRequisitioner_User__ID' : $scope.requisitioner,
                'Requisition_Date' : $scope.timestamp,
                // 'FK_Cost_Centre__ID' : $scope.costCentre,
                'Requisition_Notes' : $scope.Requisition_Notes,
                'Requisition_Number' : $scope.Requisition_Number,
                'Quote_Number' : $scope.Quote,

                'PO_Number' : $scope.PONumber,
                'PO_Date' : $scope.PODate,
                'Requisition_Status' : status,

                'FKReconciler_User__ID' : $scope.reconcilerId,
                'Reconciliation_Date'  : $scope.Reconciliation_Date,
                'Invoice_Number' : $scope.Invoice_Number,
                'Ledger_Number' : $scope.Ledger_Number,

                'FKUpdater_User__ID' : $scope.userid,
                'Last_Updated' : $scope.timestamp,
         };         

        var jsonData = JSON.stringify(data);
        
        console.log('update data:' + jsonData);

        var url = '/pram/api/update/Requisition/' + $scope.recordId;
        $q.when ($scope.$parent.saveChanges(url, jsonData))
        .then ( function () {
            $scope.loadRecord($scope.recordId);
            console.log("LR701 : " + $scope.recordId);

            // Nto1Factory.setClasses($scope.statusOptions, $scope.recordStatus);  
        });
    }

    // Save changes to Item_Request (same in Request Controller)
    $scope.saveIRChanges = function (index) {
        var IR_id = $scope.items[index]['Item_Request_ID'];
        if (IR_id) {
            console.log("save changes to item # " + index);
            
            var data = { 
                'FK_Requisition__ID' : $scope.recordId,
                'Unit_Qty' : $scope.items[index].Qty,
                'Deliver_To' : $scope.items[index].Deliver_To,
                'Item_Request_Notes' : $scope.items[index].Item_Request_Notes,
            }; 
            var jsonData = JSON.stringify(data);

            var url = '/pram/api/update/Item_Request/' + IR_id;
            $q.when ($scope.$parent.saveChanges(url, jsonData))
            .then ( function (response) {
              $scope.items[index].saved = 1;
            },
            function (error) {
                if (error) {
                    console.log("Error: " + error);
                }
            });
        }
        else {
            console.log('no item ID specified');
        }
    }


    /********** Save New Item **********/
    $scope.newItem = function() {
        /** reload angular attributes from new item form **/
        // $scope.userid = document.getElementById('FKRequester_User__ID').value;
        $scope.itemVendorId = document.getElementById('Vendor_ID').value;
        $scope.itemVendor = document.getElementById('Vendor').value;
 
        var data  = { 
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

        var jsonData = JSON.stringify(data);

        $scope.$parent.newItem(jsonData);
    }

    // $scope.initialize();

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
