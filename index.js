var http = require("http");
var httpProxy = require("http-proxy");

const port = 5000;

var proxy = httpProxy.createProxyServer({ selfHandleResponse: true });

function firstCharToLowercase(string) {
	return string.charAt(0).toLowerCase() + string.slice(1);
}

function ConvertKeysToLowerCase(obj) {
	var output = {};
	for (i in obj) {
		if (Object.prototype.toString.apply(obj[i]) === "[object Object]") {
			output[firstCharToLowercase(i)] = ConvertKeysToLowerCase(obj[i]);
		} else if (Object.prototype.toString.apply(obj[i]) === "[object Array]") {
			output[firstCharToLowercase(i)] = [];
			output[firstCharToLowercase(i)].push(ConvertKeysToLowerCase(obj[i][0]));
		} else {
			output[firstCharToLowercase(i)] = obj[i];
		}
	}
	return output;
}

var server = http.createServer(function (req, res) {
	proxy.on("proxyRes", function (proxyRes, req, res) {
		var body = [];
		proxyRes.on("data", function (chunk) {
			body.push(chunk);
		});
		proxyRes.on("end", function () {
			body = Buffer.concat(body).toString();
			var bodyJSON = JSON.parse(body);
			res.end(JSON.stringify(ConvertKeysToLowerCase(bodyJSON)));
		});
	});
	proxy.web(req, res, {
		target: "https://cks.nice.org.uk",
		changeOrigin: true,
	});
});

console.log(`Proxy listening on port ${port}`);
server.listen(port);
