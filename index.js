var http = require("http");
var httpProxy = require("http-proxy");

const port = 6001;

const fail = process.env.FAIL;

var proxy = httpProxy.createProxyServer({
  selfHandleResponse: true,
});

function firstCharToLowercase(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function convertKeysToLowerCase(input) {
  if (typeof input !== "object" || input === null) return input;

  if (Array.isArray(input)) return input.map(convertKeysToLowerCase);
  return Object.keys(input).reduce(function (newObj, key) {
    let val = input[key];
    let newVal = typeof val === "object" ? convertKeysToLowerCase(val) : val;
    newObj[firstCharToLowercase(key)] = newVal;
    return newObj;
  }, {});
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
        if (fail) {
          bodyJSON.failed = true;
        }
        res.end(JSON.stringify(convertKeysToLowerCase(bodyJSON)));
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

if (fail) {
  console.log("Forcing failed to equal true");
}


server.listen(port);
