import { Button, message, Form, Radio, Space, Divider, Tag } from "antd";
import React, { useEffect, useRef, useState } from "react";
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    RedoOutlined,
} from "@ant-design/icons";
import { appendChild, ccpProxySendFn as sendFn } from "./tools.js";
const { ipcRenderer } = window.require("electron");

export default function Proxy(props) {
    const { config } = props;
    console.log(props, "props");
    const [started, setStarted] = useState(false);
    const [selected, setSelected] = useState();
    const [current, setCurrent] = useState();
    const [portExist, setPortExist] = useState(false); // 端口号被占用
    const contentRef = useRef();

    useEffect(() => {
        if (contentRef) {
            contentRef.current.lineNum = 1;
            ipcRenderer.on("ccp-proxy-reply", (event, arg) => {
                console.log(arg, "error");
                switch (arg.message) {
                    case "start-successful":
                        console.log("start-successful");
                        setStarted(true);
                        setCurrent(arg.params);
                        setPortExist(false);
                        message.success("服务启动成功");
                        break;
                    case "server-connecting": {
                        appendChild({
                            parent: contentRef.current,
                            arg: arg.params,
                        });
                        break;
                    }
                    case "server-error":
                        appendChild({
                            parent: contentRef.current,
                            arg: arg.params,
                            color: "red",
                        });
                        break;
                    case "pause-successful":
                        console.log("pause-successful");
                        setStarted(false);
                        setCurrent();
                        message.warn("服务停止成功!!!");
                        break;
                    case "switch-successful":
                        contentRef.current.lineNum = 1;
                        contentRef.current.innerHTML = "";
                        console.log("switch-successful");
                        break;
                    case "stop-port-successful":
                        message.success(`${config.proxyPort}端口停止成功!!!`);
                        setStarted(false);
                        setCurrent();
                        setPortExist(false);
                        console.log("stop-port-successful");
                        break;
                    case "port-in-use":
                        message.error(`${config.proxyPort}端口被占用`);
                        setStarted(false);
                        setPortExist(true);
                        console.log("port-in-use");
                        break;
                    case "ccp-proxy-closed":
                        console.log("ccp-proxy-closed");
                        setStarted(false);
                        setCurrent();
                        break;
                }
            });
        }
        return () => {
            setStarted(false);
            setSelected();
            setCurrent();
            setPortExist(false);
        };
    }, [contentRef]);

    const onStart = () => {
        contentRef.current.lineNum = 1;
        contentRef.current.innerHTML = "";
        sendFn({
            type: "start",
            params: selected,
        });
    };
    const onPause = () => {
        sendFn({
            type: "pause",
        });
    };
    const onSwitch = () => {
        sendFn({
            type: "switch",
            params: selected,
        });
    };
    const onStopPort = () => {
        sendFn({
            type: "stop-port",
        });
    };

    return (
        <>
            {current && (
                <h3
                    style={{
                        paddingTop: 20,
                        width: "100%",
                        textAlign: "center",
                    }}
                >
                    {`当前运行于：`}
                    <Tag color="cyan">{current?.domain}</Tag>
                    <Tag color="blue">{current?.subdomain}</Tag>
                </h3>
            )}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "calc(100vh - 106px)",
                    padding: 20,
                    overflow: "auto",
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
                    <Form layout="inline">
                        {config.domainList.split(",").map((envItem) => {
                            return (
                                <Form.Item
                                    key={envItem}
                                    label={
                                        <Tag color={"geekblue"}>{envItem}</Tag>
                                    }
                                >
                                    <Radio.Group
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const arr =
                                                    e.target.value.split("-");
                                                setSelected({
                                                    domain: arr[0],
                                                    subdomain: arr[1],
                                                });
                                            }
                                        }}
                                        value={`${selected?.domain}-${selected?.subdomain}`}
                                    >
                                        <Space direction="vertical">
                                            {config.subdomainList
                                                .split(",")
                                                .map((item) => (
                                                    <Radio
                                                        key={item}
                                                        value={`${envItem}-${item}`}
                                                    >
                                                        {item}
                                                    </Radio>
                                                ))}
                                        </Space>
                                    </Radio.Group>
                                </Form.Item>
                            );
                        })}
                    </Form>
                    <div>
                        <div>
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
                                    disabled={!selected}
                                >
                                    启动
                                </Button>
                            )}
                            {(selected?.domain !== current?.domain ||
                                selected?.subdomain !== current?.subdomain) &&
                                current && (
                                    <Button
                                        size="large"
                                        type="primary"
                                        icon={<RedoOutlined />}
                                        style={{
                                            marginLeft: 10,
                                        }}
                                        onClick={onSwitch}
                                    >
                                        切换
                                    </Button>
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
                                    {`停止${config.proxyPort}服务`}
                                </Button>
                            )}
                        </div>
                    </div>
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
        </>
    );
}
