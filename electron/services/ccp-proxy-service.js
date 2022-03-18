const { app, ipcMain } = require("electron");
const killPort = require("kill-port");

const {
    checkPortExist,
    ccpProxyReplyFn: replyFn,
    allConfig: config,
} = require("../tools");
const proxyServer = require("../proxy");

const ccp_proxy_connect = () => {
    const serverStart = (event, params) => {
        const server = (app.ccp_proxy_server = proxyServer(params));
        server.on("listening", () => {
            replyFn({
                event,
                message: "start-successful",
                params: {
                    current: params,
                    data: {
                        proxyAddress: `http://${params.subdomain}.${params.domain}.com`,
                        localAddress: `http://127.0.0.1:${config.proxyPort}`,
                    },
                },
            });
        });
        server.on("error", (stream) => {
            replyFn({
                event,
                message: "server-error",
                params: { data: stream },
            });
        });
        server.on("close", (stream) => {
            replyFn({
                event,
                message: "ccp-proxy-closed",
                params: stream,
            });
        });
    };
    ipcMain.on("ccp-proxy-listening", (event, arg) => {
        switch (arg.type) {
            case "start":
                checkPortExist({
                    port: config.proxyPort,
                    successFn: () => {
                        serverStart(event, arg.params);
                    },
                    errorFn: () => {
                        replyFn({
                            event,
                            message: "port-in-use",
                        });
                    },
                });
                break;
            case "pause":
                app.ccp_proxy_server.close((err) => {
                    if (!err) {
                        replyFn({
                            event,
                            message: "pause-successful",
                        });
                    }
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
