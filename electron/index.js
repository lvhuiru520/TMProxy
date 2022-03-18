const { app, BrowserWindow, globalShortcut, screen } = require("electron");
const path = require("path");
const treeKill = require("tree-kill");
const nodeCliParams = require("node-cli-params");

const { createTray } = require("./tray");
const { ccp_connect } = require("./services/ccp-service");
const { ccp_proxy_connect } = require("./services/ccp-proxy-service");
const customShortcut = require("./globalShortcut");
const { main_connect } = require("./services/main-service");
const startup = require("./startup");
const { init } = require("./init");
function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname + "/preload"),
        },
        height,
        width,
        show: false,
        title: "TMProxy",
        icon: path.join(__dirname, "./static/logo.ico"),
        center: true,
        useContentSize: false,
    });

    win.focus();
    //最大化窗口
    win.maximize();
    const mode = nodeCliParams.getKey("mode");
    if (mode === "development") {
        win.loadURL("http://localhost:3000");
    } else {
        win.loadFile("./front-build/index.html");
    }

    win.once("ready-to-show", () => {
        win.show();
        customShortcut(); // 注册快捷键
    });

    // 点击关闭按钮让应用保存在托盘
    win.on("close", (e) => {
        if (win.isFocused()) {
            // 阻止窗口的关闭事件
            e.preventDefault();
            win.hide();
        }
    });
}
app.whenReady()
    .then(createWindow)
    .then(() => {
        init();
        // 设置是否开机自启
        startup();
        // 创建托盘
        createTray();
        ccp_connect();
        ccp_proxy_connect();
        main_connect();
    });

app.on("will-quit", () => {
    if (process.platform !== "darwin") {
        app?.ccp_process?.pid && treeKill(app?.ccp_process?.pid);
        globalShortcut.unregisterAll();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
