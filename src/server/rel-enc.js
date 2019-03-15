"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
var operativos = require("operativos");
__export(require("operativos"));
function emergeAppRelEnc(Base) {
    return /** @class */ (function (_super) {
        __extends(AppRelEnc, _super);
        function AppRelEnc() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = _super.call(this, args) || this;
            _this.allClientFileNames.push({ type: 'js', module: 'rel-enc', modPath: '../client', file: 'form-structure.js', path: 'client_modules', ts: { url: 'client', path: 'client' } });
            return _this;
        }
        return AppRelEnc;
    }(Base));
}
exports.emergeAppRelEnc = emergeAppRelEnc;
exports.AppRelEnc = emergeAppRelEnc(operativos.emergeAppOperativos(operativos.AppBackend));
