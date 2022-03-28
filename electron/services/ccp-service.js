const { app, ipcMain, Notification } = require("electron");
const treeKill = require("tree-kill");
const killPort = require("kill-port");

const {
    checkPortExist,
    ccpReplyFn: replyFn,
    allConfig: config,
} = require("../tools");
const { ccp_start } = require("../childProcess");
const startCCPService = (event) => {
    const ccp = ccp_start();
    ccp.stdout.on("data", (data) => {
        replyFn({
            event,
            message: "connecting",
            params: data,
        });
    });
    ccp.stderr.on("data", (data) => {
        replyFn({
            event,
            message: "connecting-error",
            params: data,
        });
    });
    ccp.stderr.on("close", (stream) => {
        replyFn({
            event,
            message: "connect-close",
            params: stream,
        });
        console.log(stream, "stream close");
    });
    return ccp;
};

function showNotification() {
    new Notification({
        title: "CCP",
        body: "启动成功",
    }).show();
}

const start = (event) => {
    checkPortExist({
        port: config.localPort,
        successFn: () => {
            app.ccp_process = startCCPService(event, (data) => {
                if (
                    !app.firstCompiled &&
                    data.includes("Compiled successfully.")
                ) {
                    app.firstCompiled = true;
                    showNotification();
                }
            });
            if (app.ccp_process) {
                replyFn({
                    event,
                    message: "start-successful",
                });
            }
        },
        errorFn: () => {
            replyFn({ event, message: "port-in-use" });
        },
    });
};

const ccp_connect = () => {
    ipcMain.on("ccp-service", (event, arg) => {
        switch (arg.type) {
            case "start":
                start(event);
                break;
            case "pause":
                app.ccp_process.pid &&
                    treeKill(app.ccp_process.pid, (err) => {
                        if (!err) {
                            replyFn({
                                event,
                                message: "pause-successful",
                            });
                        }
                    });
                break;
            case "restart":
                treeKill(app.ccp_process.pid, (err, res) => {
                    if (!err) {
                        app.firstCompiled = false;
                        replyFn({
                            event,
                            message: "restart-successful",
                        });
                        start(event);
                    }
                });
                break;
            case "stop-port":
                killPort(config.localPort).then(() => {
                    app?.ccp_process?.pid && treeKill(app.ccp_process.pid);
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
    startCCPService,
    ccp_connect,
};
