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
    if( error ){
        console.log(error);
    } else {
      contentsObject = JSON.parse(body);
      contentPage(req,res,contentsObject,req.params.id);
    }
  }
  request(options, callback);
}

//request content of specific folder
function getFolder(req,res){
	var options = {
    url: 'https://test-api.intralinks.com/v2/workspaces/' + req.params.workspace + '/folders/' + req.params.id + '/contents',
    headers: {
    'Authorization' : 'Bearer ' + token,
    'Accept' : 'application/json'
    }
  };
  
  function callback(error, response, body) {
    if( error ){
        console.log(error);
    } else {
      contentsObject = JSON.parse(body);
      folderPage(req,res,contentsObject,req.params.workspace);
    }
  }
  request(options, callback);
}

//display contents of a workspace
function contentPage(req,res,obj,workspace){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html>\n<body>');
  res.write('<h1>Intralinks Coding Exercise</h1>');
  res.write('<a href=\"https://test-api.intralinks.com/v2/oauth/authorize?client_id=' + client_id + '&endOtherSessions=false\">Login</a>');
  res.write('<br>');
  res.write('<a href=\"http://localhost:3000/workspaces\">Workspaces</a>');
  res.write('<br>');
  res.write('<h3>' + req.params.name + '</h3>');
  if( token == undefined ){
    res.write('<p>You are not logged in!</p>');  
    res.write('</body></html>');
    res.end();
  } else {
    if( obj['folder'] != undefined){
      for (var i=0; i<obj['folder'].length; i++){
        var name = obj['folder'][i]['name'];
        var id = obj['folder'][i]['id'];
        
		//do not show sub-folders
		var parentId = obj['folder'][i]['parentId'];
	    if( parentId == undefined ){
		  res.write('<a href=\"http://localhost:3000/folder?id=' + id + '&workspace=' 
                      + workspace + '&name=' + name + '\">/' + name + '</a><br>');
	    }
      }
    }
    res.write('</body></html>');
    res.end();  
  }
}

//display contents of a folder
function folderPage(req,res,obj,workspace){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html>\n<body>');
  res.write('<h1>Intralinks Coding Exercise</h1>');
  res.write('<a href=\"https://test-api.intralinks.com/v2/oauth/authorize?client_id=' + client_id + '&endOtherSessions=false\">Login</a>');
  res.write('<br>');
  res.write('<a href=\"http://localhost:3000/workspaces\">Workspaces</a>');
  res.write('<br>');
  if( req.params.name != undefined ){
    res.write('<br><br><a href=\"\">[BACK]</a>'); //TODO
	res.write('<h3>/' + req.params.name + '</h3>');
	res.write('<br><br>');
  }
  if( token == undefined ){
    res.write('<p>You are not logged in!</p>');  
    res.write('</body></html>');
    res.end();
  } else {
	if( obj['contentList'] != undefined && obj['contentList']['docFolderList'] != undefined){
      for (var i=0; i<obj['contentList']['docFolderList'].length; i++){
        var name = obj['contentList']['docFolderList'][i]['name'];
        var id = obj['contentList']['docFolderList'][i]['id'];
        
		if( obj['contentList']['docFolderList'][i]['entityType'] == "DOCUMENT" ){ //document
		  res.write('<p>' + name + '</p>');
		} else { //folder
		  res.write('<a href=\"http://localhost:3000/folder?id=' + id + '&workspace=' 
                      + workspace + '&name=' + name + '\">/' + name + '</a><br>');
		}
		res.write('<br>');
      }
    }
	
	//upload prompt
	var docName = "theNewDocument";
	res.write('<br><a href=\"http://localhost:3000/upload?workspace=' + workspace + '&folderId=' + req.params.id + '&docName=' + docName + '\">[Upload File Here]</a>');
	
    res.write('</body></html>');
    res.end();  
  }
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

//page to display a specific folder
dispatcher.onGet("/folder", function(req,res) {
  getFolder(req,res);
});

//creates placeholder document
function createPlaceHolderDocument(req, res){

  var post_json = { documents:[{document: {name: req.params.docName, parentId : parseInt(req.params.folderId)}}]};
  
  var post_data = JSON.stringify(post_json);
  console.log(post_data);
  
  var options = {
	url: 'https://test-api.intralinks.com/v2/workspaces/' + req.params.workspace + '/documents',
	headers: {
	'Authorization' : 'Bearer ' + token,
	'Accept' : 'application/json',
	'Content-Type' : 'application/json',
	},
	method: 'POST',
	body: post_data
  };

  function callback(error, response, body) {
	if( response.statusCode == 201 ){
	  //placeholder has been created, now need to upload
	  placeholder = JSON.parse(body);
	  
	  id = placeholder['documentPartial'][0]['id'];
	  version = placeholder['documentPartial'][0]['version'];
	  
	} else {
		console.log('Could not create placeholder document');
	}
  }

  
  request(options, callback);
	
}

//called when user wants to upload a file to a workspace
dispatcher.onGet("/upload", function(req,res) {

  var post_data = querystring.stringify({
    'acceptSplash' : true,
  });
  
  var options = {
    url: 'https://test-api.intralinks.com/v2/workspaces/' + req.params.workspace + '/splash',
    headers: {
    'Authorization' : 'Bearer ' + token,
    'Accept' : 'application/json',
	'Content-Type' : 'application/json',
    },
	body: post_data
  };

  function callback(error, response, body) {
    if( response.statusCode == 200 ){
		createPlaceHolderDocument(req,res);
	} else {
		console.log('Could not enter workspace: ' + req.params.workspace);
	}
  }

  request(options, callback);
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
  console.log(post_data);
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