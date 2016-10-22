var http = require('http');
var dispatcher = require('httpdispatcher');
var querystring = require('querystring'); //used to build POST request data
var request = require('request'); //used to perform HTTP requests

//localhost:3000
const PORT = 3000;

//Intralinks client api key
var client_id = "B41PayHaro1unIcFzWXSoVU8r9KBD6z6";
//Intralinks secret api key
var secret =  "tkkkqxQvk1Z7OUwy";
//used to get oauth token
var code;

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
  res.write('</body></html>');
  res.end();
}

//at root, return home page
dispatcher.onGet("/", function(req,res) {
  homePage(req,res);
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
        console.log(error);
      }
      token_object = JSON.parse(body);
      token = token_object.access_token;
      console.log(token);
	  homePage(req,res);
    });
});