const { BrowserWindow, globalShortcut, app } = require("electron");
const { allConfig } = require("./tools");
const onLoad = () => {
    const win = BrowserWindow.getFocusedWindow();
    if (!globalShortcut.isRegistered("Alt+F12")) {
        globalShortcut.register("Alt+F12", () => {
            if (win.webContents.isDevToolsOpened()) {
                win.webContents.closeDevTools();
            } else {
                win.webContents.openDevTools();
            }
        });
    }
    if (!globalShortcut.isRegistered(allConfig.switchTab)) {
        globalShortcut.register(allConfig.switchTab, () => {
            // 主进程向渲染进程发送消息
            win.webContents.send("switch-tab");
        });
    }
};
const unregisterFn = () => {
    globalShortcut.unregister(allConfig.switchTab);
    globalShortcut.unregister("Alt+F12");
};

module.exports = function () {
    const win = BrowserWindow.getFocusedWindow();
    app.whenReady().then(() => {
        globalShortcut.register(allConfig.openOrCloseWindow, () => {
            if (win.isVisible() && !win.isMinimized()) {
                win.hide();
            } else {
                win.show();
            }
        });
        onLoad();
        win.on("show", () => {
            onLoad();
        });

        win.on("focus", () => {
            onLoad();
        });
        win.on("hide", () => {
            unregisterFn();
        });
        win.on("minimize", () => {
            unregisterFn();
        });
        win.on("blur", () => {
            unregisterFn();
        });
    });
};
