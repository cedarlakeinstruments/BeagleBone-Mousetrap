var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8080;

var trap = require("bonescript");
setupIo();

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname, filename = path.join(process.cwd(), uri);
    console.log("URL: " + request.url);
    // HTML5 streaming data
    if (request.url === "/stream") {
        response.writeHead(200, {"Content-Type":"text/event-stream", "Cache-Control":"no-cache", "Connection":"keep-alive"});
        response.write("retry: 10000\n");
        response.write("event: connecttime\n");
        //response.write("data: " + (new Date()) + "\n\n");
        // response.write("data: " + (new Date()) + "\n\n");
	response.write("data " + readTrap());

        var interval = setInterval(function() {
            response.write("data:" + readTrap() + "\n\n");
        }, 2000);
        request.connection.addListener("close", function () {
        clearInterval(interval);
    }, false);
  } 
  else
  {
      path.exists(filename, function(exists) {
        if(!exists) 
        {
            // File not found
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }
        // Default to index.html if directory requested
        if (fs.statSync(filename).isDirectory()) filename += '/index.html';
        // Everything else; .js, .css etc
        fs.readFile(filename, "binary", function(err, file) {
          if(err) 
          {        
            // server error
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
            return;
          }
    
          response.writeHead(200);
          response.write(file, "binary");
          response.end();
        });
      });
  }
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

function setupIo()
{
    trap.pinMode("P8_19", trap.INPUT);
}

function readTrap()
{
   return trap.digitalRead("P8_19");
}
