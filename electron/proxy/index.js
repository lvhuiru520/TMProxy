const httpProxy = require("http-proxy");
const { allConfig: config, commonErrorCode } = require("../tools");
const events = require("events");
events.EventEmitter.defaultMaxListeners = 0;
const proxyServer = ({
    domain = "test",
    subdomain = "master",
    logFn = () => {},
    errorFn = () => {},
    onListeningFn = () => {},
    onPortInUseFn = () => {},
    port,
}) => {
    const options = {
        // target: `http://${subdomain}.${domain}.com`,
        target: "http://localhost:3005/",
        changeOrigin: true,
        cookieDomainRewrite: {
            "*": "",
        },
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
                (commonErrorCode[err.code]
                    ? err.code + " " + commonErrorCode[err.code]
                    : err.code) || err
            }`
        );
        res.destroy();
    });
    function onError(error) {
        if (error.syscall !== "listen") {
            proxy.close(() => {
                errorFn(error);
            });
        }
        var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                proxy.close(() => {
                    errorFn(bind + " requires elevated privileges");
                });
            case "EADDRINUSE":
                proxy.close(() => {
                    // errorFn(bind + " is already in use");
                    onPortInUseFn();
                    console.log(proxy.listenerCount(), "proxy");
                });
            default:
                proxy.close(() => {
                    errorFn(error);
                });
        }
    }

    function onListening() {
        onListeningFn();
        var addr = proxy._server.address();
        logFn(`目标地址：${options.target}`);
        logFn(`代理地址：http://${addr.address}:${addr.port}`);
    }
    return proxy;
};

module.exports = proxyServer;
