var http = require('http')
  , app = http.createServer(handler)
  , fs = require('fs')
  , path = require('path')
  , url = require('url');

var mimeTypes = {
	"html" : "text/html",
	"js" : "text/javascript",
	"css"  : "text/css",
	"png"  : "image/png",
	"jpeg" : "image/jpeg"
	};

app.listen(9000);

function handler (request, response) {
    //console.log(request.url);
    var uri = url.parse(request.url).pathname; 
    if(uri == "/") uri = "/index.html";
    var filename = path.join(process.cwd(), "/" + uri);
    console.log(filename);
    path.exists(filename, function(exists) {
    if(!exists) {
        //console.log("not exists: " + filename);
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write('404 Not Found\n');
        response.end();
        return;
    }
    //var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
    response.writeHead(200, {'Content-Type':mimeTypes[path.extname(filename).split(".")[1]]});

    var fileStream = fs.createReadStream(filename);
    fileStream.pipe(response);

    }); //end path.exists
}

