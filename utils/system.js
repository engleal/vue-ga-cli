const os = require("os")

function isMac() {
    let sysType = os.type();
    return sysType === "Darwin"
}
exports.isMac = isMac
function isWindow() {
    let sysType = os.type();
    return sysType === "Windows_NT"
}
exports.isWindow = isWindow