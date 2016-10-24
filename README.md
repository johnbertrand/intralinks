# intralinks - Intralinks coding exercise

# Implementation
- Written in Node.js v4.6.1

# Dependencies 

- httpdispatcher (npm install httpdispatcher)
 - https://www.npmjs.com/package/httpdispatcher
- querystring (npm install querystring)
 - https://www.npmjs.com/package/querystring
 - creates strings to be used in GET requests
- request (npm install request)
 - https://www.npmjs.com/package/request
 - handles HTTP GET, POST, and PUT requests
- hashmap (npm install hashmap)
 - https://www.npmjs.com/package/hashmap
 - basic hashMap datastructure
- form-data (npm install --save form-data)
 - https://github.com/form-data/form-data
 - attempt at trying to build binary data for file upload API call

# Implemented Features

- A login page that will trigger the Oauth flow of IL
 - [http://localhost:3000](http://localhost:3000) - select Login

- A list of workspaces. Where you can click in a individual workspace and access the “navigation tree”
 - After successful login (you are notified on both the main page and workspace page) navigate to [http://localhost:3000/workspaces](http://localhost:3000/workspaces)
 
-  A navigation tree for the folders/documents in the workspace
 - Click through each Workspace and subfolders (supports nested folders)
 
# Unimplemented Features

- Way to navigate "up" folder directory. Currently can only drill down from root (the "Workspaces" link is always available to go back to the root of a directory.

- Uploading a file is partially implemented. When viewing a folder, the [Upload a file] link will do the following:
 - "Enter" the workspace
 - Create a placeholder document (name is hard-coded)
 - Attempt to upload a file (test.txt) to the server. The request returns a valid status code, but no file is uploaded to the worksapce. I believe the issue is with how I am setting the data field 
 
# Observations

The [Update document file API](https://developers.intralinks.com/swagger/#!/Documents/upload_document_file) call seems like it can return either XML or JSON. I noticed that there is no way to select which is to be returned, and it only returns XML. I do not parse this XML because I did not get the file upload to work.

# Preparation

A lot of what is implememented in this server I was first able to accomplish with **curl** and making the requests by hand. It made working with the Oauth slightly more complicated, but helped me understand what is going on. At the HackDartmouth hackathon I attempted to use the IntraLinks API with I struggled getting past the Oauth part of the API so I was glad I was able to get it working for this exercise.

# Comments

This is maybe the second time I've written an application in Node.js, so I hope I have structured my code in a way that is A) readable and B) not breaking any important Node.js conventions. Everything is included in **server.js** and I tried to keep things as organized as possible.

There is some minimal error checking implemented. If the Node.js functions fail their errors are printed to the console. If there is a bad API request I actually throw a 400 page back to the user.

If a user is not logged in I display that information on almost every page. I do this by capturing the response on all of the API calls and check their status and detect whether or not it is because the user isn't logged in.
