const { ipcRenderer } = window.require("electron");
const appendChild = ({ parent, arg, color }) => {
    const divDom = document.createElement("div");
    divDom.innerHTML = parent.lineNum + ": " + arg;
    // contentRef.current.replaceChildren(divDom);
    if (color) {
        divDom.style.color = color;
    }
    parent.appendChild(divDom);
    parent.scrollTo(0, parent.scrollHeight);
    parent.lineNum++;
};
const sendFn = ({ channel, type, params }) => {
    ipcRenderer.send(channel, {
        type,
        params,
    });
};

const ccpProxySendFn = ({ type, params }) => {
    sendFn({
        channel: "ccp-proxy-listening",
        type,
        params,
    });
};
export { appendChild, ccpProxySendFn };
