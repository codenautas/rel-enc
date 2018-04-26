var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "backend-plus", "../client/form-types"], factory);
    }
})(function (require, exports) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    var backendPlus = require("backend-plus");
    __export(require("../client/form-types"));
    var x = new backendPlus.AppBackend();
    var AppRelEnc = /** @class */ (function (_super) {
        __extends(AppRelEnc, _super);
        function AppRelEnc() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AppRelEnc.prototype.getTables = function () {
            return _super.prototype.getTables.call(this).concat([
                'usuarios',
            ]);
        };
        return AppRelEnc;
    }(backendPlus.AppBackend));
    exports.AppRelEnc = AppRelEnc;
});
//# sourceMappingURL=rel-enc.js.map