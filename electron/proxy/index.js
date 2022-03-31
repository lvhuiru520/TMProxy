const httpProxy = require("http-proxy");
const { allConfig: config } = require("../tools");

const proxyServer = ({
    domain = "test",
    subdomain = "master",
    logFn = () => {},
    errorFn = () => {},
    onListeningFn = () => {},
}) => {
    const options = {
        target: `http://${subdomain}.${domain}.com`,
        changeOrigin: true,
        /* cookieDomainRewrite: {
            "*": "",
        }, */
    };
    const proxy = httpProxy
        .createProxyServer(options)
        .listen(config.proxyPort, "127.0.0.1");
    proxy._server.on("listening", onListening);
    proxy._server.on("error", onError);
    proxy.on("error", (err, req, res, target) => {
        var _a;
        const hostname =
            ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.host) ||
            req.hostname ||
            req.host; // (websocket) || (node0.10 || node 4/5)
        const requestHref = `${hostname}${req.url}`;
        const targetHref = `${
            target === null || target === void 0 ? void 0 : target.href
        }`; // target is undefined when websocket errors
        errorFn(
            `[HPM] Error occurred while proxying request ${requestHref} to ${targetHref} ${
                err.code || err
            }`
        );
    });
    function onError(error) {
        if (error.syscall !== "listen") {
            errorFn(error);
        }

        var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                errorFn(bind + " requires elevated privileges");
            /* process.exit(1); */
            case "EADDRINUSE":
                errorFn(bind + " is already in use");
            /* process.exit(1); */
            default:
                errorFn(error);
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        onListeningFn();
        var addr = proxy._server.address();
        logFn(`目标地址：${options.target}`);
        logFn(`代理地址：http://${addr.address}:${addr.port}`);
    }
    return proxy;
};

module.exports = proxyServer;
