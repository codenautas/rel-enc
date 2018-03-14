"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backendPlus = require("backend-plus");
var x = new backendPlus.AppBackend();
class AppRelEnc extends backendPlus.AppBackend {
    getTables() {
        return super.getTables().concat([
            'usuarios',
        ]);
    }
}
exports.AppRelEnc = AppRelEnc;
//# sourceMappingURL=rel-enc.js.map