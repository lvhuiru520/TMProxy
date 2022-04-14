const { app, ipcMain } = require("electron");
const killPort = require("kill-port");

const { ccpProxyReplyFn: replyFn, allConfig: config } = require("../tools");
const proxyServer = require("../proxy");

const ccp_proxy_connect = () => {
    const serverStart = (event, params) => {
        const proxy = proxyServer({
            ...params,
            port: config.proxyPort,
            logFn: (data) => {
                console.log("connect", data);
                replyFn({
                    event,
                    message: "server-connecting",
                    params: data,
                });
            },
            errorFn: (data) => {
                console.log(data, "error");
                replyFn({
                    event,
                    message: "server-error",
                    params: data,
                });
            },
            onListeningFn: () => {
                console.log("start", params);
                replyFn({
                    event,
                    params: params,
                    message: "start-successful",
                });
            },
            onPortInUseFn: () => {
                // 端口号被占用
                replyFn({
                    event,
                    message: "port-in-use",
                });
            },
        });
        proxy.on("close", (stream) => {
            console.log("close", stream);
            replyFn({
                event,
                message: "ccp-proxy-closed",
                params: stream,
            });
            app.ccp_proxy_server = null;
        });
        app.ccp_proxy_server = proxy;
    };
    ipcMain.on("ccp-proxy-listening", (event, arg) => {
        switch (arg.type) {
            case "start":
                serverStart(event, arg.params);
                break;
            case "pause":
                console.log("pause");
                app.ccp_proxy_server.close(() => {
                    replyFn({
                        event,
                        message: "pause-successful",
                    });
                });
                break;
            case "switch":
                app.ccp_proxy_server.close((err) => {
                    if (!err) {
                        replyFn({
                            event,
                            message: "switch-successful",
                        });
                        serverStart(event, arg.params);
                    }
                });
                break;
            case "stop-port":
                killPort(config.proxyPort).then(() => {
                    replyFn({
                        event,
                        message: "stop-port-successful",
                    });
                });
                break;
        }
    });
};

module.exports = {
    ccp_proxy_connect,
};
