var http = require("http");
var httpProxy = require("http-proxy");

const port = 6123;

var proxy = httpProxy.createProxyServer({
  selfHandleResponse: true,
});

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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
  proxy.on("proxyRes", function (proxyRes, req, res) {
    var body = [];
    proxyRes.on("data", function (chunk) {
      body.push(chunk);
    });
    proxyRes.on("end", function () {
      body = Buffer.concat(body).toString();
      var bodyJSON;
      try {
        bodyJSON = JSON.parse(body);
        console.log("parsed body");
        res.end(JSON.stringify(ConvertKeysToLowerCase(bodyJSON)));
      } catch (e) {
        console.error(e);
      }
    });
  });
  proxy.web(req, res, {
    target: "https://cks.nice.org.uk",
    changeOrigin: true,
  });
});

console.log(`Proxy listening on port ${port}`);
server.listen(port);
