'use strict';
var app = angular.module('myApp');

app.controller('Nto1Ctrl', 
    ['$scope', '$q', '$rootScope', '$http', '$location', 'Nto1Factory', 'AuthenticationService' , 
    function ($scope, $q, $rootScope, $http, $location, Nto1Factory, AuthenticationService) {
	console.log('loaded Controller');

    var start = new Date();
    $scope.timestamp = start.toISOString().slice(0, 19).replace('T', ' '); 

    /** timer with date + hours + minutes - automatically updates  **/
    var update_seconds = 1;
    setInterval (function() {
        var now = new Date();
        $scope.now = now;
        $scope.timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
        $scope.created = now.toISOString().slice(0, 19).replace('T', ' ');

        $scope.$apply();
    }, update_seconds*1000);

   $scope.$on('parametersExtended', function () {
   		console.log('extended parameters');
        $scope.Shown = Nto1Factory.Shown;
        $scope.SearchOn = Nto1Factory.SearchOn;
        $scope.Hidden  = Nto1Factory.Hidden;
        $scope.Autocomplete   = Nto1Factory.Autocomplete;

        $scope.attributes = Nto1Factory.attributes;
        $scope.Reset = Nto1Factory.Reset;
        $scope.Map = Nto1Factory.Map;
        $scope.Type = Nto1Factory.Type;
        $scope.Set = Nto1Factory.Set;

        $scope.Fields = Nto1Factory.Fields;
        $scope.itemFields = Nto1Factory.itemFields;

        $scope.item_attributes = Nto1Factory.item_attributes;
        $scope.itemReset = Nto1Factory.itemReset;
        $scope.itemMap = Nto1Factory.itemMap;
        $scope.itemSet = Nto1Factory.itemSet;

        console.log('extended Column & Autocomplete info');
    });

   $scope.$on('setClasses', function () {
        console.log('set Classes');
        $scope.highlightOn = Nto1Factory.highlight;
        $scope.highlightClass = Nto1Factory.highlightClass;

        console.log($scope.highlightOn);
        for (var status in $scope.highlightOn) {
            status = status.replace(/\s/g,'');
            $scope[status + 'Class'] = $scope.highlightOn[status];
            console.log(status + ' = ' + $scope[status + 'Class']);   
        }
   });

    $scope.pendingChanges = [];

    $scope.config = {};

    $scope.reloadConfig = function (config) {
        if ($scope.config) {
            $scope.url = $scope.config['url'] ;
            $scope.userid = $scope.config['userid'];
            $scope.user = $scope.config['user'];
            $scope.recordId = $scope.config['recordId'];
            console.log('reloaded config: ' + $scope.url + ' : ' + $scope.user);
        }
    }

    $scope.setup= function (config) {
        console.log('generic setup');
        console.log(JSON.stringify(config));
        if (config) {
            $scope.config = JSON.parse(config);           
        }
        
        $scope.reloadConfig();
    }

	/********** Initialize **********/
    $scope.initialize = function(config) {
        $scope.debugMode = 0;

        /* DemoSevice extends above specs into more attributes: Map Set, attributes, itemMap, itemReset, item_attributes  */
       
        console.log("Initializing...");

    	$scope.items = [];
        $scope.activeIndex = 0;

            
        $scope.username = $rootScope.getUsername();
    
        $scope.submitted = [];
        $scope.createdRecords = [];
        $scope.editedRecords = [];

        /** Initialize smartSearch options **/

    }

    $scope.saveRecord = function () {
        if ($scope.recordId) {
            $scope.updateRecord();
        }
        else {
            console.log('no record id to update');
        }
    }

    $scope.activateIndex = function (index) {
        console.log('set active index to ' + index);
        $scope.activeIndex = index || 0;
    }

    $scope.cloneRecord = function () {
        console.log("Clone Record " + $scope.recordId);
    }
     
    /** POST TO DATABASE **/
    $scope.createRecord = function (url, jsonData) {

        console.log('url: ' + url);
        console.log('data: ' + jsonData);
        
        return $http.post(url, jsonData )
            .success ( function (response) {
                console.log("Posted successfully");

                $scope.createdRecords.push({ 'id' : response['Record_ID'], 'description' : response['Description']});
            })
            .error (function (error) {
                console.log("Error saving record");
                console.log(jsonData);
                console.log(error);
            });
    }  

    $scope.recordChanged = function (field) {
        console.log("Changed " + field);
    }  

    $scope.saveChanges = function ( url, jsonData ) {
        var currentStatus = $scope.recordStatus;

        return $http.post(url, jsonData)
        	.success ( function (response) {
    			console.log("saved changes");
                console.log(url);
                console.log(jsonData);
        	})
        	.error ( function (error) {
        		console.log("Error updating record "  + error);
        	});
               
    }

    $scope.newItem = function (jsonData) {
        console.log('new item: ' + jsonData);
        return  $http.post("/record/insert/" + $scope.itemClass, jsonData ).
            success ( function (response) {
                console.log("Added New Record");
                var itemId = response['record_ID'];
                var recordDescription = response['Description'];
                var link = "<div class='alert alert-warning'><A href ='/record/Item/" + itemId + "?format=html'> New Item #" + itemId + ' - ' + recordDescription + "</A></div>\n";
                
                $scope.itemId = itemId;

                $('#topMessage').html(link);
                $('#newItemModal').modal('hide');
                $('#message').html("<div class='alert alert-warning'>Added New Record ...</div>");
                console.log(response);
        		$('#internalMessage').html('');
            }).
            error (function (response) {
                    console.log("Failed to Insert");    
        });

    }

    /********** Save Request and List of Items Requested **********/

    $scope.toggleDebugMode = function() {
        console.log('toggle Debug Mode');
        if ($scope.debugMode) {
            $scope.debugMode = 0;
            console.log('toggle debug mode OFF');
        }
        else {
            console.log('toggle debug mode ON');
            $scope.debugMode = 1;
        }
    }

    /** Generate hash to stoer lookup tables **/
    $scope.Lookup = {};

    $scope.loadLookup = function (url, table, model, def, condition, index) {
        $scope.Routes0 = {};
        if ($scope.Lookup[table]) {
            console.log('already loaded ' + table);
        }
        else {
            $scope[model] = {};

            console.log("API = " + url + ' -> ' + table + ' ' + index + ': ' + model + '[default = ' + def + '] ' + condition);
            console.log(JSON.stringify($scope.items));

            Nto1Factory.loadLookup(url, table, model, def);
        }

        if (index != undefined) { 
            var xModel = model || table;
            xModel +=  index;
            $scope[xModel] = {};
            console.log('SET ' + xModel);
        }
    }

    $scope.$on('loadedLookup', function (event, args) {
        var table = args['table'];
        var model = args['model'];

        $scope.Routes = {}; 

        var m = model.replace(/^.*\./,'');
        // .replace(/^.*\./,'');;
        
        console.log('synced ' + table + ' Lookup : ' + model);
        $scope.Lookup[m] = Nto1Factory.Lookup[table];

        var def = Nto1Factory.Lookup[table]['value'];
        console.log('default = ' + JSON.stringify(def));
  
        if (def != undefined) {
            console.log('Set default ' + model + ' to ' + JSON.stringify(def));
            $scope[model] = def;
        }
        console.log(table + ' lookup ' + model + JSON.stringify($scope.Lookup[model]));
    });


    $scope.$on('listUpdated', function() {
        $scope.items = Nto1Factory.items;
        console.log(' service updated list to ' + $scope.items.length);
    });

    $scope.editMode = function (toggle) {
        if (toggle) {
            if ($scope.uiMode == 'Edit' ) { $scope.uiMode = '' }
            else { $scope.uiMode = 'Edit' }
        }
        else { $scope.uiMode = 'Edit' }

    }

    $scope.dumpScope = function () {
        console.log("*** Dumped Attribute List **");
        for (var i= 0; i<$scope.attributes.length; i++) {
            var att = $scope.attributes[i];
            console.log(att + ' = ' + $scope[att]);
        }
        console.log("** Items: **");
        for (var i= 0; i<$scope.items.length; i++)  {
            console.log(JSON.stringify($scope.items[i]))
        }
        console.log("** Lookups: **");
        console.log(JSON.stringify($scope.Lookup));
        console.log("** Column/Fields **");
        console.log('search on: ' +JSON.stringify($scope.SearchOn));
    }

    /********** Load Existing Request from Database **********/
    $scope.loadRecord = function(urlRequest, recordId, query) {
        console.log('load Record: ' + recordId);
        var recordData = [];

        if (!urlRequest || !recordId) { console.log("Error loading record without url and recordID"); return $q.when(null) }
        
        $scope.clearScope();

        var jsonData = JSON.stringify( { 'query' : query } );

        // Use post to prevent parameters length limitations in GET
        return $http.post(urlRequest, jsonData)
        .success ( function (response) {
            console.log("Loaded Data");
            console.log(JSON.stringify(response) ); 
            recordData = response; 
            
            $scope.reloadConfig();

            $scope.items = [];           
            for (var i=0; i<recordData.length; i++) {
                 if (i == 0) {
                     for (var att in $scope.Map) {
                        var field = $scope.Map[att];
                        var type = $scope.Type[att];
                        if ( (type == 'date') && recordData[0][att]) {
                            var stamp = recordData[0][att];
                            console.log('get ' + att + ' date from ' + stamp);
                            $scope[att] = recordData[0][att].substring(0,10);
                        }
                        else { $scope[att] = recordData[0][att] }
            
                        console.log(att + " = " + $scope[att]);
                     }
                 }
 
                 var thisitem = {};

                 for (var att in $scope.itemMap) {
                     var field = $scope.itemMap[att];
                     if (recordData[i][att] === undefined ) { 
                        console.log(att + ' is not defined');
                        continue; 
                     }

                     if ( field.match(/date/i) && recordData[i][att]) { thisitem[att] = recordData[i][att].substring(0,10) }
                     else { thisitem[att] = recordData[i][att]; }
                 }
                 
                 thisitem['Total'] = thisitem['Cost'] * thisitem['Qty'];
                 thisitem['saved'] = 1;

                 $scope.items.push(thisitem);

                 $scope.pendingChanges = [];
                 console.log('added item ' + i + ':' + JSON.stringify(thisitem));
                 console.log($scope.items.length + "Total items added");
            }
            console.log($scope.items.length + "Total items added");

        })
        .error ( function (error) {
            console.log("Error retrieving record: " + urlRequest );
            console.log("Q: " + query);
        });

    }   

    /********** Delete Item **********/
    $scope.deleteItem = function ( index ) {
        console.log('Remove item :' + index);
        $scope.items.splice(index, 1); 
        $scope.notePendingChange("Deleted Item(s)");    
    }
        
    $scope.notePendingChange = function (message) {
        $scope.pendingChanges.push(message);
        console.log("noted pending change: " + message);
    }
    
    $scope.notePendingChange = function (message) {
        $scope.pendingChanges.push(message);
        console.log("noted pending change: " + message);    
    }
   
    $scope.clearItem = function () {
        for (var i=0; $i < $scope.item_attributes.length; i++) {
            var att = $scope.item_attributes[i];
            var searchElement = 'item' + att;
            $scope[searchElement] = '';
        }
    }

    $scope.clearScope = function () {
        $scope.items = [];
        for (var i=0; i < $scope.attributes.length; i++) {
            var att = $scope.attributes[i];
            $scope[att] = '';
        }
        
        console.log('cleared record');
       
        if ($scope.manualSet) {
            console.log('manually clear elements');
            for (var i=0; i < $scope.manualSet.length; i++) {
                var id = $scope.manualSet[i];
                console.log('clear element ' + id);
                var element = document.getElementById(id);
                if (element === undefined || element === null ) { console.log($scope.manualSet[i] + ' not syncable') }
                else {
                    element.value = '';
                }
            }
        }

        $scope.reloadConfig();

        $scope.recordId = '';
        $scope.mainMessage = '';
        var msgElement = document.getElementById('message');
        if (msgElement) { console.log('clear message'); msgElement.value = '' }
        else { console.log('no message') }

        // $('#topMessage').val('reset');
    }

    /** Custom Actions **/
    /* enable specific atts to be inherited from item to main class - alert on conflict */
    $scope.inheritItemAttribute = function (index, atts, errMsg) {
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

    $scope.loadNextStatus = function(newStatus) {
        console.log('determine next status level');
        if (newStatus) { $scope.nextStatus = newStatus }
        else {
            console.log("check " + $scope.statusOptions.length + " status options");
            for (var i=0; i<$scope.statusOptions.length; i++) {
                var thisStatus = $scope.statusOptions[i];
                var nextStatus = $scope.statusOptions[i+1];
                console.log('compare ' + $scope.recordStatus + " with " + thisStatus);
                if ($scope.recordStatus == thisStatus) { 
                    $scope.nextStatus = nextStatus;
                    console.log('next status level = ' + $scope.nextStatus);
                    break;
                }
            }
        }
    }

    /** Standards **/

    /** default lookup menu settings **/
    $scope.MenuSettings = {
        closeOnSelect: true,
        selectionLimit: 1,
        enableSearch: true,
        showCheckAll: false,
        showUncheckAll: false,
        externalIdProp: '',
        smartButtonMaxItems: 1,
        smartButtonTextConverter: function(itemText, originalItem) {
            return itemText;
        }
    };

    /** syncronize lookup id / label with attribute **/
    $scope.syncLookup = function (attribute, id, label) {
        $scope[id] = $scope[attribute]['id'];
        $scope[label] = $scope[attribute]['label'];
        console.log("synced " + attribute + ' -> ' + $scope[id] + " = " + $scope[label]);
    }

   /*** Incomplete **/
    $scope.updateRecord = function () {
        console.log('update record');
    }

    $scope.addRecord = function () {
        console.log("trigger new item");
        $('#insideModal').html("ADD INTERNAL CONTENT");
    }        

    $scope.searchItem = function() {
        console.log('search item..');
    }
    
    $scope.selectItem = function () {
        console.log("SELECTING");
    }


}]);
