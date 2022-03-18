import React, { useEffect, useState } from "react";
import {
    Button,
    Divider,
    Form,
    Switch,
    Upload,
    Input,
    InputNumber,
    Space,
    Modal,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useForm } from "antd/lib/form/Form";
const { ipcRenderer } = window.require("electron");
import "./Config.less";
export default function Config(props) {
    const { config } = props;
    const [form] = useForm();
    const [localEnable, setLocalEnable] = useState();
    useEffect(() => {
        setLocalEnable(config?.localEnable);
    }, [config]);

    const onSave = () => {
        form.validateFields().then((values) => {
            console.log(values, "values");
            ipcRenderer
                .invoke("main-service", {
                    type: "save",
                    params: {
                        ...values,
                        localPath: values?.localPath
                            ? JSON.stringify(values.localPath)
                            : null,
                    },
                })
                .then((res) => {
                    if (res === "success") {
                        Modal.confirm({
                            title: "保存成功",
                            content: "需要重启程序才能生效",
                            okText: "重启",
                            cancelText: "手动重启",
                            onOk: () => {
                                ipcRenderer.invoke("main-service", {
                                    type: "relaunch",
                                });
                            },
                        });
                    }
                });
        });
    };
    return (
        <div
            className="config"
            style={{
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 56px)",
                padding: "0 20px",
                overflow: "auto",
            }}
        >
            <Form form={form}>
                <Form.Item
                    label="开机自启"
                    name="startup"
                    valuePropName="checked"
                    initialValue={config?.startup}
                >
                    <Switch />
                </Form.Item>
                <Divider orientation="left">本地项目</Divider>
                <Form.Item
                    label="开启本地项目tab页"
                    name="localEnable"
                    valuePropName="checked"
                    initialValue={config?.localEnable}
                >
                    <Switch
                        onChange={(checked) => {
                            setLocalEnable(checked);
                        }}
                    />
                </Form.Item>
                <Form.Item
                    label="本地项目自启"
                    name="localAutoEnable"
                    valuePropName="checked"
                    initialValue={config?.localAutoEnable}
                >
                    <Switch />
                </Form.Item>
                <Form.Item
                    label="项目地址"
                    name="localPath"
                    wrapperCol={{ span: 8 }}
                    initialValue={
                        (config?.localPath && JSON.parse(config?.localPath)) ||
                        []
                    }
                    rules={[{ required: localEnable, message: "项目地址必填" }]}
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                        return (
                            (e &&
                                e.fileList.map((item) => ({
                                    ...item,
                                    path: item.originFileObj.path,
                                }))) ||
                            []
                        );
                    }}
                >
                    <Upload
                        disabled={!localEnable}
                        beforeUpload={(file) => {
                            return false;
                        }}
                        accept="json"
                        maxCount={1}
                    >
                        <Button
                            disabled={!localEnable}
                            icon={<UploadOutlined />}
                        >
                            选择本地项目json文件
                        </Button>
                    </Upload>
                </Form.Item>
                <Form.Item
                    label="端口号"
                    name="localPort"
                    initialValue={config?.localPort}
                    rules={[
                        { required: localEnable, message: "项目端口号必填" },
                    ]}
                >
                    <InputNumber
                        disabled={!localEnable}
                        min={1024}
                        max={65535}
                    />
                </Form.Item>
                <Form.Item
                    label="项目执行命令"
                    name="localScript"
                    initialValue={config?.localScript}
                    wrapperCol={{ span: 8 }}
                >
                    <Input
                        disabled={!localEnable}
                        placeholder="npm start"
                        allowClear
                    />
                </Form.Item>
                <Divider orientation="left">代理项目</Divider>
                <Form.Item
                    label="端口号"
                    name="proxyPort"
                    initialValue={config?.proxyPort}
                >
                    <InputNumber placeholder="8080" min={1024} max={65535} />
                </Form.Item>
                <Form.Item
                    label="domain列表"
                    name="domainList"
                    initialValue={config?.domainList}
                    wrapperCol={{ span: 8 }}
                >
                    <Input placeholder="dev,test" allowClear />
                </Form.Item>
                <Form.Item
                    label="subdomain列表"
                    name="subdomainList"
                    initialValue={config?.subdomainList}
                    wrapperCol={{ span: 8 }}
                >
                    <Input
                        placeholder="master,master1,master2,master3,tenant,trialos"
                        allowClear
                    />
                </Form.Item>
                <Divider orientation="left">快捷键</Divider>
                <Form.Item
                    wrapperCol={{ span: 5 }}
                    label="打开/关闭窗口"
                    name="openOrCloseWindow"
                    initialValue={config?.openOrCloseWindow}
                >
                    <Input placeholder="Alt+Q" allowClear />
                </Form.Item>
                <Form.Item
                    wrapperCol={{ span: 5 }}
                    label="切换tab页"
                    name="switchTab"
                    initialValue={config?.switchTab}
                >
                    <Input placeholder="Tab" allowClear />
                </Form.Item>
                <Form.Item
                    wrapperCol={{ span: 5 }}
                    label="打开/关闭控制台"
                    name="openOrCloseConsole"
                    initialValue={config?.openOrCloseConsole}
                >
                    <Input placeholder="Alt+F12" allowClear />
                </Form.Item>
                <Divider />
                <Form.Item wrapperCol={{ span: 5, offset: 3 }}>
                    <Space>
                        <Button type="primary" onClick={onSave}>
                            保存
                        </Button>
                        <Button
                            onClick={() => {
                                form.resetFields();
                            }}
                        >
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
}
