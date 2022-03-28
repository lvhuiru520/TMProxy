import { Button, message, Divider } from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    RedoOutlined,
} from "@ant-design/icons";
const { ipcRenderer } = window.require("electron");

const replaceChildren = ({ parent, arg, color }) => {
    const divDom = document.createElement("div");
    divDom.innerHTML = parent.lineNum + ": " + arg;
    if (color) {
        divDom.style.color = color;
    }
    if (parent.lineNum % 100 === 0) {
        parent.replaceChildren(divDom);
    } else {
        parent.appendChild(divDom);
    }
    parent.scrollTo(0, parent.scrollHeight);
    parent.lineNum++;
};

export default function Local(props) {
    const { config } = props;
    const contentRef = useRef();
    const [started, setStarted] = useState(false);
    const [portExist, setPortExist] = useState(false); // 端口号被占用
    useEffect(() => {
        if (contentRef) {
            contentRef.current.lineNum = 1;
            if (config.localAutoEnable) {
                onStart();
            }
            ipcRenderer.on("ccp-reply", (event, arg) => {
                switch (arg.message) {
                    case "connecting":
                        replaceChildren({
                            parent: contentRef.current,
                            arg: arg.params,
                        });
                        break;
                    case "connecting-error":
                        replaceChildren({
                            parent: contentRef.current,
                            arg: arg.params,
                            color: "red",
                        });
                        break;
                    case "connect-close":
                        replaceChildren({
                            parent: contentRef.current,
                            arg: arg.params,
                            color: "red",
                        });
                        setStarted(false);
                        break;
                    case "start-successful":
                        contentRef.current.lineNum = 1;
                        contentRef.current.innerHTML = "";
                        setStarted(true);
                        break;
                    case "pause-successful":
                        setStarted(false);
                        message.warn("停止成功!!!");
                        break;
                    case "restart-successful":
                        contentRef.current.lineNum = 1;
                        message.success("重启成功");
                        break;
                    case "stop-port-successful":
                        message.success(`${config.localPort}端口停止成功`);
                        setStarted(false);
                        setPortExist(false);
                        break;
                    case "port-in-use":
                        message.error(`${config.localPort}端口被占用`);
                        setPortExist(true);
                        break;
                }
            });
        }
    }, [contentRef]);

    const onStart = () => {
        ipcRenderer.send("ccp-service", { type: "start" });
    };
    const onPause = () => {
        ipcRenderer.send("ccp-service", { type: "pause" });
    };
    const onRestart = () => {
        ipcRenderer.send("ccp-service", { type: "restart" });
    };
    const onStopPort = () => {
        ipcRenderer.send("ccp-service", {
            type: "stop-port",
            params: config.localPort,
        });
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 56px)",
                padding: 20,
            }}
        >
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {started ? (
                    <Button
                        type="primary"
                        size="large"
                        danger
                        icon={<PauseCircleOutlined />}
                        onClick={onPause}
                    >
                        停止
                    </Button>
                ) : (
                    <Button
                        size="large"
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={onStart}
                    >
                        启动
                    </Button>
                )}
                {started && (
                    <>
                        <Button
                            size="large"
                            type="primary"
                            icon={<RedoOutlined />}
                            style={{
                                marginLeft: 10,
                            }}
                            onClick={onRestart}
                        >
                            重启
                        </Button>
                    </>
                )}
                {portExist && (
                    <Button
                        size="large"
                        type="primary"
                        icon={<RedoOutlined />}
                        style={{
                            marginLeft: 10,
                        }}
                        onClick={onStopPort}
                    >
                        {`停止${config.localPort}端口`}
                    </Button>
                )}
            </div>
            <Divider />
            <div
                ref={contentRef}
                style={{
                    overflow: "auto",
                    flex: 5,
                }}
            />
        </div>
    );
}
