const http = require("http"),
    httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({});

const environment = process.env.environment || "test";
const subdomain = process.env.subdomain || "master";
const options = {
    target: `http://${subdomain}.${environment}.com`,
    changeOrigin: true,
    cookieDomainRewrite: {
        "*": "",
    },
};

const server = http.createServer(function (req, res) {
    proxy.web(req, res, options);
});

const port = 8080,
    hostname = "127.0.0.1";
server.listen(port, hostname, () => {
    var addr = server.address();
    console.info(`代理地址：${options.target}`);
    console.info(`本地地址：http://${hostname}:${port}`);
    console.info(addr);
});
