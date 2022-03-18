const { BrowserWindow, Tray, Menu, nativeImage, app } = require("electron");
const path = require("path");

const createTray = () => {
    const icon = nativeImage.createFromPath(
        path.join(__dirname, "./static/logo.png")
    );
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "主界面",
            click: () => {
                win.show();
            },
        },
        {
            label: "重启",
            click: () => {
                app.exit();
                app.relaunch();
            },
        },
        {
            label: "退出",
            role: "quit",
        },
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip("CCP");
    tray.setTitle("CCP");
    const win = BrowserWindow.getFocusedWindow();
    tray.on("double-click", function () {
        win.show();
    });
};
module.exports = {
    createTray,
};
