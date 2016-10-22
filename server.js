var http = require('http');
var dispatcher = require('httpdispatcher');
var querystring = require('querystring'); //used to build POST request data
var request = require('request'); //used to perform HTTP requests
var HashMap = require('hashmap'); //HashMap datastructure

//localhost:3000
const PORT = 3000;

//Intralinks client api key
var client_id = "B41PayHaro1unIcFzWXSoVU8r9KBD6z6";
//Intralinks secret api key
var secret =  "tkkkqxQvk1Z7OUwy";
//used to get oauth token
var code;
//oauth token
var token;
//hashmap for workspaces (id,name)
var workspaceMap;

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

//display home page
function homePage(req,res){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html>\n<body>');
  res.write('<h1>Intralinks Coding Exercise</h1>');
  res.write('<a href=\"https://test-api.intralinks.com/v2/oauth/authorize?client_id=' + client_id + '&endOtherSessions=false\">Login</a>');
  res.write('<br>');
  res.write('<a href=\"http://localhost:3000/workspaces\">Workspaces</a>');
  res.write('<br>');
  if( token != undefined ){
	  res.write('<p>You are logged in!</p>');
  } else {
	  res.write('<p>You are not logged in!</p>');
  }
  res.write('</body></html>');
  res.end();
}

//requests current available workspaces, and adds them to hashmap
function getWorkspaces(req,res){
	var options = {
	  url: 'https://test-api.intralinks.com/v2/workspaces',
	  headers: {
		'Authorization' : 'Bearer ' + token,
		'Accept' : 'application/json'
	  }
	};

	function callback(error, response, body) {
	  workspacesObject = JSON.parse(body);
	  workspaceMap = new HashMap();
	  if( workspacesObject['workspace'] != undefined ){
	    for (var i=0; i<workspacesObject['workspace'].length; i++){
		  var name = workspacesObject['workspace'][i]['workspaceName'];
		  var id = workspacesObject['workspace'][i]['id'];
		  workspaceMap.set(id,name);
  	    }
	  }
	  //show workspace page
	  workspacesPage(req,res);
	}

	request(options, callback);
}

//list out workspaces
function listWorkspaces(req,res){
	if( workspaceMap != undefined ){
	  workspaceMap.forEach(function(name, id) {
		res.write('<a href=\"http://localhost:3000/workspace?name=' + name + '&id=' + id + '\">/' + name + '</a><br>');
	  });
	}
}

//display workspaces page
function workspacesPage(req,res){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html>\n<body>');
  res.write('<h1>Intralinks Coding Exercise</h1>');
  res.write('<a href=\"https://test-api.intralinks.com/v2/oauth/authorize?client_id=' + client_id + '&endOtherSessions=false\">Login</a>');
  res.write('<br>');
  res.write('<a href=\"http://localhost:3000/workspaces\">Workspaces</a>');
  res.write('<br>');
  res.write('<h3>Workspaces</h3>');
  if( token == undefined ){
	res.write('<p>You are not logged in!</p>');  
	res.write('</body></html>');
    res.end();
  } else {
	listWorkspaces(req,res);
	res.write('</body></html>');
    res.end();  
  }
}

//request content of current workspace
function getContents(req,res){
	var options = {
	  url: 'https://test-api.intralinks.com/v2/workspaces/' + req.params.id + '/folders/',
	  headers: {
		'Authorization' : 'Bearer ' + token,
		'Accept' : 'application/json'
	  }
	};

	function callback(error, response, body) {
	  console.log(body);
	  contentPage(req,res);
	}

	request(options, callback);
}

//display contents of a workspace
function contentPage(req,res){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html>\n<body>');
  res.write('<h1>Intralinks Coding Exercise</h1>');
  res.write('<a href=\"https://test-api.intralinks.com/v2/oauth/authorize?client_id=' + client_id + '&endOtherSessions=false\">Login</a>');
  res.write('<br>');
  res.write('<a href=\"http://localhost:3000/workspaces\">Workspaces</a>');
  res.write('<br>');
  res.write('<h3>' + req.params.name + '</h3>');
  
  res.write('</body></html>');
  res.end();  
}

//at root, return home page
dispatcher.onGet("/", function(req,res) {
  homePage(req,res);
});

//page to display all workspaces
dispatcher.onGet("/workspaces", function(req,res) {
  getWorkspaces(req,res);
});

//page to display a specific workspace
dispatcher.onGet("/workspace", function(req,res) {
  getContents(req,res);
});

//callback, return here after login page
dispatcher.onGet("/callback", function(req,res) {
  code = req.params.code
  
  var post_data = querystring.stringify({
    'code' : code,
    'grant_type' : 'authorization_code',
    'client_id' : client_id,
    'client_secret' : secret,
    'endOtherSessions' : 'false'
  });
    
  request({
    headers: {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Accept' : 'application/json'
    },
      uri: 'https://test-api.intralinks.com/v2/oauth/token',
      body: post_data,
      method: 'POST'
    }, function (err, response, body) {
      if( err ){
        console.log(err);
      }
	  else if(response.statusCode > 400 ){
		errorPage(res,response);
	  } else {
        token_object = JSON.parse(body);
        token = token_object.access_token;
	    homePage(req,res);
	  }
    });
});

//display an error page with link to "/"
function errorPage(res, response){
  body = JSON.parse(response.body)
  res.writeHead(400, {'Content-Type': 'text/html'});
  res.write('<html>\n<body>');
  res.write('<a href=\"http://localhost:3000/\">Home</a>');
  res.write('<p>');
  res.write(body['error']['code'] + ' : ' + body['status']);
  res.write('</p>');
  res.write('<p>');
  res.write(body['error']['description']);
  res.write('</p>');
  res.write('</body></html>');
  res.end();
}