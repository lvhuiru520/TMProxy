import React, { useEffect, useState } from "react";
import { Tabs } from "antd";

import "./App.less";
import Local from "./Local";
import Proxy from "./Proxy";
import Config from "./Config";
const { ipcRenderer } = window.require("electron");
const { TabPane } = Tabs;

function App() {
    const [activeKey, setActiveKey] = useState("local");
    const [flag, setFlag] = useState(false);
    const [config, setConfig] = useState({});
    useEffect(() => {
        ipcRenderer.on("switch-tab", () => {
            setFlag(true);
        });
        ipcRenderer.invoke("main-service", { type: "init" }).then((res) => {
            setConfig(res || {});
            if (!res?.config?.localEnable) {
                setActiveKey("proxy");
            }
        });
    }, [""]);
    console.log(config, "config");
    useEffect(() => {
        if (flag) {
            if (config?.allConfig?.localEnable) {
                if (activeKey === "local") {
                    setActiveKey("proxy");
                } else if (activeKey === "proxy") {
                    setActiveKey("config");
                } else if (activeKey === "config") {
                    setActiveKey("local");
                }
            } else {
                if (activeKey === "proxy") {
                    setActiveKey("config");
                } else if (activeKey === "config") {
                    setActiveKey("proxy");
                }
            }
            setFlag(false);
        }
    }, [flag]);

    return (
        <div className="App">
            <Tabs
                activeKey={activeKey}
                onChange={(e) => {
                    setActiveKey(e);
                }}
                type="card"
            >
                {config?.config?.localEnable && (
                    <TabPane tab="本地项目" key={"local"}>
                        <Local config={config?.allConfig} />
                    </TabPane>
                )}
                <TabPane tab="Proxy" key={"proxy"}>
                    <Proxy config={config?.allConfig} />
                </TabPane>
                <TabPane tab="配置" key={"config"}>
                    <Config config={config?.config} />
                </TabPane>
            </Tabs>
        </div>
    );
}

export default App;
