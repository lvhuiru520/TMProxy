const child_process = require("child_process");
const path = require("path");
const { allConfig: config } = require("./tools");

const ccp_start = () => {
    let dirname = "";
    if (config?.localPath) {
        JSON.parse(config?.localPath).forEach((item) => {
            dirname = path.dirname(item.path);
        });
    }
    if (dirname) {
        const ccp = child_process.exec(config?.localScript, {
            cwd: dirname,
            maxBuffer: Math.pow(2, 20),
        });
        return ccp;
    }
};

module.exports = { ccp_start };
