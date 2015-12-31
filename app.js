var csv = require('csv-parser');
var requestify = require('requestify'); 
var fs = require('fs');
var global_Items = {};
var procceedRead = false;
var currentDB = '';

var stream = csv({ 
	separator: ';',
	headers: ['classid', 'instanceid', 'price']
});

var getItemPrice = function(classid) {
	console.log()
	if(global_Items[classid] === undefined) {
		console.log(classid, 'not found price');
		return;
	}
	console.log('item price -', parseFloat(global_Items[classid]['price']/100));
}

var parseItems = function() {
	fs.createReadStream('base/' + currentDB).pipe(stream)
	.on('data', function(data) {
		data = JSON.parse(JSON.stringify(data));
		classid = data['classid'];
		price = data['price'];
		global_Items[classid] = data;
	})
	.on('end', function() {
		procceedRead = true;
		console.log('parsing finish');
		console.log('get price item classid = 310776566');
		getItemPrice('310776566');
	});
}
var downloadBase = function(dbname) {
	requestify.get('https://csgo.tm/itemdb/' + dbname).then(function(response) {
		fs.writeFile('base/' + dbname, response.body);
		currentDB = dbname;
		console.log('download new db -', dbname, ', start parsing');
		parseItems();
	});
}
requestify.get('https://csgo.tm/itemdb/current_730.json').then(function(response) {
	response = JSON.parse(response.body);
	dbname = response['db'];

	fs.exists('base/' + dbname, function (exists) {
		if(exists) {
			currentDB = dbname;
			console.log('db exist, start parsing');
	  		parseItems();
	  	}
	  	else {
	  		console.log('start download new db');
	  		downloadBase(dbname);
	  	}
	});
});
