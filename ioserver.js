var ext = require ("./io");
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8080;

http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname, filename = path.join(process.cwd(), uri);
	var parts = url.parse(request.url);
    console.log("URL: " + request.url);
	console.log("PATH: " + parts.pathname);
    // HTML5 streaming data
    if (request.url === "/stream") 
    {
        response.writeHead(200, {"Content-Type":"text/event-stream", "Cache-Control":"no-cache", "Connection":"keep-alive"});
        response.write("retry: 10000\n");
        response.write("event: connecttime\n");
		response.write(sendDatastream());

        var interval = setInterval(function() {
			response.write(sendDatastream());
        }, 2000);
        request.connection.addListener("close", function () {
			clearInterval(interval);
		}, false);
	} 
	else
	{
		// Forms and files handling
		var handled = false;
		// Form handler
		if (parts.pathname == "/control")
		{
			handled = true;
			// Redirect back to main page
			filename = "index.html";
		}
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
			if (fs.statSync(filename).isDirectory()) 
			{	
				filename += '/index.html';
			}
			// Everything else: .css etc
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
        }); // path.Exists
	}
 }).listen(parseInt(port, 10)); // createServer

console.log("I/O server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

// Send data stream
function sendDatastream()
{
	var state = ext.readTrap();
	var temp = ext.readTemp().toPrecision(4);
    var values = 'data: {"state":' + state + ',"temp":' + temp +'}\n\n';
    return values;
}


