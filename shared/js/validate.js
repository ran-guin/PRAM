function validateAngularForm ( id ) {
    var scope = document;
    console.log('validate form: ' + id);
    if (id) { scope = document.querySelector('#' + id) }

    console.log(scope);

    var req = scope.querySelectorAll('[mandatory]');

    console.log('validating ' + req.length + ' elements');

    var fails = [];
    for ( var i=0; i< req.length; i++) {
        var val = req[i].value;
        var type = req[i].type;
        var name = req[i].name || req[i].id;
      
        var pass=0;
        if (type.match(/select/) && val.match(/^[0-9]+$/) ) {
            pass++;
            console.log('Number selected:' + val);
        }
        else if (type.match('text') || type.match('hidden')) {
            pass = val;
        }
        else {
            console.log('failed ' + type + ': ' + val);
        }

        if ( pass ) { 
            req[i].style.backgroundColor=''; 
            continue
        }
	fails.push(name);
        req[i].style.backgroundColor='#FCC'; 
    }
    if (fails.length) { 
	var msg = "Please Supply Missing Information: \n\t* " + fails.join("\n\t* ") + "\n";
	alert( msg );
        console.log('Failed Validation');
        return false;
    }
    return true;
}
