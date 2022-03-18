const { app, ipcMain, Notification } = require("electron");
const fs = require("fs");
const { allConfig, userProfileConfig } = require("../tools");

const main_connect = () => {
    ipcMain.handle("main-service", async (event, arg) => {
        switch (arg.type) {
            case "init":
                return {
                    config: require(userProfileConfig),
                    allConfig,
                };
            case "save":
                const res = await fs.writeFileSync(
                    userProfileConfig,
                    JSON.stringify(arg.params)
                );
                if (!res) {
                    return "success";
                }
            case "relaunch":
                app.exit();
                app.relaunch();
        }
    });
};

module.exports = { main_connect };
