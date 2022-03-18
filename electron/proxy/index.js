const http = require("http"),
    httpProxy = require("http-proxy");
const { allConfig: config } = require("../tools");

const proxyServer = ({ domain = "test", subdomain = "master" }) => {
    const proxy = httpProxy.createProxyServer({});
    const options = {
        target: `http://${subdomain}.${domain}.com`,
        changeOrigin: true,
        cookieDomainRewrite: {
            "*": "",
        },
    };

    const server = http.createServer(function (req, res) {
        proxy.web(req, res, options);
    });

    const hostname = "127.0.0.1";
    server.listen(config.proxyPort, hostname, () => {
        var addr = server.address();
        console.info(`代理地址：${options.target}`);
        console.info(`本地地址：http://${hostname}:${config.proxyPort}`);
        console.info(addr);
    });

    return server;
};

module.exports = proxyServer;
