(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formTypes = {
        si_no_nn: { htmlType: 'number', typeName: 'bigint', validar: 'opciones', radio: true },
        si_no: { htmlType: 'number', typeName: 'bigint', validar: 'opciones', radio: true },
        numero: { htmlType: 'number', typeName: 'bigint', validar: 'numerico', },
        opciones: { htmlType: 'number', typeName: 'bigint', validar: 'opciones', radio: true },
        texto: { htmlType: 'text', typeName: 'text', validar: 'texto', },
    };
});
//# sourceMappingURL=form-types.js.map