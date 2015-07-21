function createRequest(data) {
    var items = data.items;
    console.log('Requesting ' + items.length + ' Items');
    var requester = data.userid;
    var requestDate = data.requestDate;
    var costCentre = data.costCentre;
    var notes = data.notes;

    var insertR = "INSERT INTO Request (FKRequester_User__ID, RequestDate, FK_Cost_Centre__ID, Notes) VALUES (?, ?, ?, ?) ";
    var values = [requester, requestDate, costCentre, notes];

    data.requestID = '999';
        
    var insertV = "INSERT INTO Item_Request (FK_Item__ID, FK_Request__ID, Unit_Cost, Unit_Qty, Notes) VALUES (?, ?, ?, ?, ?)";
    console.log('Requested ' + requestDate + ' by ' + data.requester);
    
    var message = "Requesting:<UL>";
    message += "<LI>" + insertR + "</LI>";
    message += "<LI>" + insertV + "</LI>";
    message += "<LI><OL>";
    for (var i=0; i<items.length; i++) {
        var item = items[i];
        var name = item.name;
        var cost = item.cost;
        var qty  = item.qty;
        console.log(qty + ' x $ ' + cost + ' of: ' + name );
        
        var values = [ item.id, data.requestID, item.cost, item.qty, item.notes ];
        message += "<LI>" + values.join('; ') + '</LI>';
    }
    message += "</OL></LI></UL>";
    
    $('#pageError').html(message);    
    return items.length;

    console.log(data);

}
