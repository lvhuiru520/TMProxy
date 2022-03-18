const http = require("http");
const os = require("os");
const path = require("path");
const defaultConfig = require("./config/default.json");
const fs = require("fs");
function getIpAddress() {
    var ifaces = os.networkInterfaces();
    let addressList = [];
    for (var dev in ifaces) {
        let iface = ifaces[dev];
        for (let i = 0; i < iface.length; i++) {
            let { family, address } = iface[i];
            if (family === "IPv4") {
                addressList.push(address);
            }
        }
    }
    return addressList;
}

const checkPortExist = ({ port, successFn = () => {}, errorFn = () => {} }) => {
    const addressList = getIpAddress();
    addressList.push("0.0.0.0");
    let num = 0;
    addressList.forEach((host) => {
        const server = http.createServer().listen(port, host);
        server.on("listening", () => {
            num++;
            if (num === addressList.length) {
                successFn();
            }
            server.close();
        });
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                errorFn(error.message);
            }
            server.close();
        });
    });
};

const replyFn = ({ type, event, message, params }) => {
    event.reply(type, {
        message,
        params,
    });
};
const ccpProxyReplyFn = ({ event, message, params }) => {
    replyFn({
        type: "ccp-proxy-reply",
        event,
        message,
        params,
    });
};
const ccpReplyFn = ({ event, message, params }) => {
    replyFn({
        type: "ccp-reply",
        event,
        message,
        params,
    });
};

const userProfileConfig = path.join(
    process.env.USERPROFILE,
    ".tmProxy.config.json"
);

const checkFileExist = () => {
    try {
        fs.statSync(userProfileConfig);
        return true;
    } catch (error) {
        return false;
    }
};

const allConfig = checkFileExist()
    ? Object.assign(defaultConfig, require(userProfileConfig))
    : defaultConfig;

module.exports = {
    checkPortExist,
    ccpProxyReplyFn,
    ccpReplyFn,
    allConfig,
    userProfileConfig,
};
