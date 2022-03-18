const fs = require("fs");
const path = require("path");
const init = () => {
    const filePath = path.join(process.env.USERPROFILE, ".tmProxy.config.json");
    fs.stat(filePath, (err, stats) => {
        if (err?.code === "ENOENT") {
            fs.writeFileSync(filePath, JSON.stringify({}));
        }
    });
};
module.exports = {
    init,
};
