function custom_autofill (id) {

    var el = getElementById(id);
    el.autocomplete({
  	source: function( request, response ) {
    	  console.log('call ajax from here...');
    	  $.ajax({
		url: "http://localhost:2000/items/search/ter",
		dataType: "json",
		method: "GET",
		data: {
			q : request.term
		},
		success: function( data ) {	
			console.log('Got Data:' + data);
			console.log('Got Data:' + data.data);
			console.log('input:' + request.term);
			response( data );
		}
    	});
  	},
  	minLength: 3,
  	select: function( event, ui ) {
    		console.log('selectblock');
    		log( ui.item ?
      		"Selected: " + ui.item.label :
      		"Nothing selected, input was " + this.value);
  	},
  	open: function() {
		console.log('open');
    		$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
  	},
  	close: function() {
		console.log('close');
    		$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
  	}
    });
};

