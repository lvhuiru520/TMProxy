const { app } = require("electron");
const path = require("path");
const { allConfig } = require("./tools");

const startup = () => {
    const appFolder = path.dirname(process.execPath);
    const updateExe = path.resolve(appFolder, "TMProxy.exe");
    const exeName = path.basename(process.execPath);

    app.setLoginItemSettings({
        openAtLogin: allConfig?.startup,
        path: updateExe,
        args: [
            "--processStart",
            `"${exeName}"`,
            "--process-start-args",
            `"--hidden"`,
        ],
    });
};

module.exports = startup;
