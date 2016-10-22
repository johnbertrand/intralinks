var http = require('http');
var dispatcher = require('httpdispatcher');

const PORT = 3000;

function handleRequest(request, response){
	try{
		console.log(request.url);
		dispatcher.dispatch(request,response);
	} catch(err) {
		console.log(err);
	}
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
	console.log("Server listening on localhost:%s", PORT);
});

dispatcher.setStatic('resources');

function homePage(req,res){
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<html>\n<body>');
	res.write('<h1>Intralinks Coding Exercise</h1>');
	res.write('</body></html>');
	res.end();
}

dispatcher.onGet("/", function(req,res) {
	homePage(req,res);
});