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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "js-to-html", "like-ar", "typed-controls", "dialog-promise", "myOwn"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var js_to_html_1 = require("js-to-html");
    var likeAr = require("like-ar");
    var TypedControls = require("typed-controls");
    require("dialog-promise");
    var my = require("myOwn");
    ;
    exports.formTypes = {
        si_no_nn: { htmlType: 'number', typeName: 'bigint', validar: 'opciones', radio: true },
        si_no: { htmlType: 'number', typeName: 'bigint', validar: 'opciones', radio: true },
        numero: { htmlType: 'number', typeName: 'bigint', validar: 'numerico', },
        decimal: { htmlType: 'number', typeName: 'decimal', validar: 'numerico', },
        opciones: { htmlType: 'number', typeName: 'bigint', validar: 'opciones', radio: true },
        texto: { htmlType: 'text', typeName: 'text', validar: 'texto', },
        fecha: { htmlType: 'text', typeName: 'date', validar: 'texto', },
        hora: { htmlType: 'text', typeName: 'interval', validar: 'texto', },
    };
    var tipoc_Base = /** @class */ (function () {
        function tipoc_Base(infoCasillero, myForm) {
            this.myForm = myForm;
            this.childs = [];
            this.inTable = false;
            this.data = infoCasillero.data;
            this.setChilds(infoCasillero.childs);
            for (var attrName in infoCasillero)
                if (infoCasillero.hasOwnProperty(attrName)) {
                    if (!(attrName in this)) {
                        throw new Error("falta copiar attrName");
                    }
                }
        }
        tipoc_Base.prototype.setChilds = function (childsInfo) {
            this.childs = childsInfo.map(function (childInfo) {
                return this.myForm.newInstance(childInfo);
            }, this);
        };
        tipoc_Base.prototype.displayRef = function (opts) {
            if (opts === void 0) { opts = {}; }
            var opts = opts || {};
            var hasValue = this.data.ver_id != '-';
            var attr = { class: hasValue ? "casillero" : "vacio" };
            var value = hasValue ? this.data.ver_id || this.data.casillero : null;
            if (opts.forValue) {
                attr["for-value"] = opts.forValue;
                return [js_to_html_1.html.label(attr, value)];
            }
            if (this.inTable) {
                return [js_to_html_1.html.td(attr, value)];
            }
            return [js_to_html_1.html.span(attr, value)];
        };
        tipoc_Base.prototype.displayInput = function (direct) {
            if (direct === void 0) { direct = false; }
            var attr = {};
            if (this.inTable) {
                attr.colspan = 90;
            }
            if (!exports.formTypes[this.data.tipovar]) {
                throw new Error(this.data.tipovar + ' no existe como tipo');
            }
            if (exports.formTypes[this.data.tipovar].radio) {
                return undefined;
            }
            var control = js_to_html_1.html.input({
                "tipo-var": this.data.tipovar || 'unknown',
                "longitud-var": this.data.longitud || 'unknown',
                "type": exports.formTypes[this.data.tipovar].htmlType,
            }).create();
            TypedControls.adaptElement(control, exports.formTypes[this.data.tipovar]);
            this.myForm.variables[this.var_name] = {
                optativa: this.data.optativo || /_esp/.test(this.var_name),
                salto: (this.data.salto || '').toLowerCase(),
                saltoNsNr: null && this.data.salto,
                tipo: exports.formTypes[this.data.tipovar].validar,
                maximo: null,
                minimo: null,
                calculada: this.data.despliegue == 'calculada',
                subordinadaVar: null,
                subordinadaValor: null
            };
            this.connectControl(control);
            this.assignEnterKeyAndUpdateEvents(control, control);
            if (direct) {
                return control;
            }
            if (this.inTable) {
                return js_to_html_1.html.td(attr, [control]).create();
            }
            else {
                return js_to_html_1.html.span(attr, [control]).create();
            }
        };
        tipoc_Base.prototype.displayMainText = function (opts) {
            if (opts === void 0) { opts = {}; }
            var attr = { class: "nombre" };
            if (opts.forValue) {
                attr["for-value"] = opts.forValue;
            }
            var content = [
                this.data.nombre,
                (this.data.tipoe ? js_to_html_1.html.span({ class: "tipoe" }, this.data.tipoe) : null),
                (this.data.aclaracion ? js_to_html_1.html.span({ class: "aclaracion" }, this.data.aclaracion) : null),
            ];
            var firstElement;
            if (opts.forValue) {
                firstElement = js_to_html_1.html.label(attr, content);
            }
            else if (this.inTable) {
                firstElement = js_to_html_1.html.td(attr, content);
            }
            else {
                firstElement = js_to_html_1.html.span(attr, content);
            }
            return [
                firstElement,
                this.data.tipovar && !this.inTable ? this.displayInput() : null
            ];
        };
        tipoc_Base.prototype.displayTopElements = function (special) {
            if (special === void 0) { special = false; }
            return js_to_html_1.html[this.inTable ? 'tr' : 'div']({ class: "propios" }, [].concat(this.displayRef(), this.displayMainText(), (this.data.tipovar && this.inTable ? this.displayInput() : null)));
        };
        tipoc_Base.prototype.displayInputForOptions = function () {
            var inputAttr = {
                class: 'typed-control-input-for-options',
                "type": exports.formTypes[this.data.tipovar].htmlType,
                "enter-clicks": "internal"
            };
            if (exports.formTypes[this.data.tipovar].htmlType == 'number') {
                inputAttr["min"] = '1';
                inputAttr["max"] = this.childs.length.toString();
            }
            var input = js_to_html_1.html.input(inputAttr).create();
            this.assignEnterKeyAndUpdateEvents(input, null);
            // TypedControls.adaptElement(input,formTypes[this.data.tipovar]);
            return input;
        };
        tipoc_Base.prototype.displayChilds = function () {
            return [js_to_html_1.html.div({ class: "hijos" }, Array.prototype.concat.apply([], this.childs.map(function (child) {
                    return child.display();
                })))];
        };
        tipoc_Base.prototype.displayBottomElement = function () {
            return [];
        };
        tipoc_Base.prototype.display = function (special) {
            if (special === void 0) { special = false; }
            this.createVariable();
            var content = [].concat(this.displayTopElements(), this.displayChilds(), this.displayBottomElement());
            if (this.inTable) {
                return content;
            }
            var groupElement = js_to_html_1.html.div({ class: 'tipoc_' + this.data.tipoc }, content).create();
            this.adaptOptionInput(groupElement);
            return [groupElement];
        };
        tipoc_Base.prototype.createVariable = function () {
            if ((exports.formTypes[this.data.tipovar] || { radio: false }).radio) {
                var opciones = {};
                this.childs.forEach(function (child) { opciones[child.data.casillero] = { salto: (child.data.salto || '').toLowerCase() }; });
                this.myForm.variables[this.var_name] = {
                    optativa: false,
                    salto: (this.data.salto || '').toLowerCase(),
                    saltoNsNr: null && this.data.salto,
                    tipo: exports.formTypes[this.data.tipovar].validar,
                    maximo: null,
                    minimo: null,
                    opciones: opciones,
                    calculada: this.data.despliegue == 'calculada',
                    subordinadaVar: null,
                    subordinadaValor: null
                };
            }
        };
        tipoc_Base.prototype.adaptOptionInput = function (group) {
            var self = this;
            this.myForm.elements[this.data.casillero] = group;
            if (this.data.tipovar) {
                this.myForm.controlBox[this.var_name] = group;
            }
            if ((exports.formTypes[this.data.tipovar] || { radio: false }).radio) {
                var casillerosElement = group.querySelectorAll('.casillero');
                if (casillerosElement.length == 0) {
                    if (!FormManager.controlRepetidos['casillerosElement.length==0']) {
                        FormManager.controlRepetidos['casillerosElement.length==0'] = true;
                        alertPromise("opciones sin id.casillero para " + this.var_name, { askForNoRepeat: 'opciones_sin_id' });
                    }
                }
                if (casillerosElement.length > 1) {
                    if (false && !FormManager.controlRepetidos['casillerosElement.length>1']) {
                        FormManager.controlRepetidos['casillerosElement.length>1'] = true;
                        alertPromise("opciones con muchos id.casillero para " + this.var_name, { askForNoRepeat: 'opciones_sin_id' });
                    }
                }
                if (casillerosElement.length > 0) {
                    casillerosElement[0].addEventListener('click', function () {
                        miniMenuPromise([
                            { value: 'next', img: my.path.img + 'next.png', label: 'próxima pregunta', doneFun: function () {
                                    self.myForm.irAlSiguiente(self.var_name, true);
                                } },
                            { value: 'delete', img: my.path.img + 'delete.png', label: 'borrar respuesta', doneFun: function () {
                                    group.setTypedValue(null, true);
                                } },
                        ], { reject: false, underElement: casillerosElement[0] });
                    });
                }
                group.setAttribute('typed-controls-option-group', 'simple-option');
                var typeInfo = { typeName: 'bigint', options: this.childs.map(function (child) {
                        return { option: Number(child.data.casillero) };
                    }) };
                TypedControls.adaptElement(group, typeInfo);
                this.connectControl(group);
                this.assignEnterKeyAndUpdateEvents(null, group);
            }
        };
        Object.defineProperty(tipoc_Base.prototype, "var_name", {
            get: function () {
                if (!this.data.tipovar) {
                    throw new Error(this.data.tipovar + ' no es un tipo');
                }
                return this.data.var_name;
            },
            enumerable: true,
            configurable: true
        });
        tipoc_Base.prototype.assignEnterKeyAndUpdateEvents = function (inputEntereable, typedControlUpdateable) {
            var self = this;
            var myForm = this.myForm;
            if (inputEntereable != null) {
                inputEntereable.setAttribute('special-enter', 'true');
                inputEntereable.setAttribute('enter-clicks', 'true');
                inputEntereable.addEventListener('keypress', function (event) {
                    var tecla = event.which;
                    if (tecla == 13 && !event.shiftKey && !event.ctrlKey && !event.altKey) {
                        myForm.irAlSiguiente(self.var_name, false);
                        event.preventDefault();
                    }
                }, false);
            }
            if (typedControlUpdateable != null) {
                typedControlUpdateable.addEventListener('update', function (event) {
                    myForm.irAlSiguiente(self.var_name, false);
                });
            }
        };
        tipoc_Base.prototype.connectControl = function (control) {
            if (this.data.despliegue == 'calculada') {
                control.disable(true);
            }
            var actualValue = this.myForm.formData[this.var_name];
            if (actualValue === undefined) {
                actualValue = null;
                this.myForm.formData[this.var_name] = null;
            }
            this.myForm.controls[this.var_name] = control;
            control.setTypedValue(actualValue);
            control.myForm = this.myForm;
            control.addEventListener('update', function (var_name) {
                return function () {
                    var value = this.getTypedValue();
                    this.myForm.formData[var_name] = value;
                    this.myForm.validateDepot();
                    this.myForm.refreshState();
                    this.myForm.saveSurvey();
                };
            }(this.var_name));
        };
        return tipoc_Base;
    }());
    exports.tipoc_Base = tipoc_Base;
    var tipoc_F = /** @class */ (function (_super) {
        __extends(tipoc_F, _super);
        function tipoc_F() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        tipoc_F.prototype.displayRef = function (opts) {
            if (opts === void 0) { opts = {}; }
            var button = this.createBackButton();
            return Array.prototype.concat.apply(_super.prototype.displayRef.call(this), button);
        };
        ;
        tipoc_F.prototype.createBackButton = function () {
            var myForm = this.myForm;
            if (myForm.stackLength()) {
                var firstFromStack = myForm.getFirstFromStack();
                var button = js_to_html_1.html.button({ class: 'boton-formulario' }, "Volver al " + firstFromStack.formId).create();
                button.onclick = function () {
                    var mainForm = document.getElementById(myForm.mainFormHTMLId);
                    myForm.removeFirstFromStack();
                    var formManager = new FormManager(myForm.surveyManager, firstFromStack.formId, firstFromStack.formData, myForm.stack);
                    var toDisplay = formManager.display();
                    formManager.validateDepot();
                    formManager.refreshState();
                    mainForm.innerHTML = '';
                    mainForm.appendChild(toDisplay);
                    window.scrollTo(0, firstFromStack.scrollY);
                };
                return [button];
            }
            return [];
        };
        ;
        tipoc_F.prototype.displayBottomElement = function () {
            var button = this.createBackButton();
            return Array.prototype.concat.apply(_super.prototype.displayBottomElement.call(this), [js_to_html_1.html.div({}, button).create()]);
        };
        return tipoc_F;
    }(tipoc_Base));
    exports.tipoc_F = tipoc_F;
    var tipoc_B = /** @class */ (function (_super) {
        __extends(tipoc_B, _super);
        function tipoc_B() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return tipoc_B;
    }(tipoc_Base));
    exports.tipoc_B = tipoc_B;
    var tipoc_MATRIZ = /** @class */ (function (_super) {
        __extends(tipoc_MATRIZ, _super);
        function tipoc_MATRIZ() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return tipoc_MATRIZ;
    }(tipoc_Base));
    exports.tipoc_MATRIZ = tipoc_MATRIZ;
    var tipoc_TEXTO = /** @class */ (function (_super) {
        __extends(tipoc_TEXTO, _super);
        function tipoc_TEXTO() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return tipoc_TEXTO;
    }(tipoc_Base));
    exports.tipoc_TEXTO = tipoc_TEXTO;
    var tipoc_CONS = /** @class */ (function (_super) {
        __extends(tipoc_CONS, _super);
        function tipoc_CONS() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return tipoc_CONS;
    }(tipoc_Base));
    exports.tipoc_CONS = tipoc_CONS;
    var tipoc_P = /** @class */ (function (_super) {
        __extends(tipoc_P, _super);
        function tipoc_P() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        tipoc_P.prototype.displayTopElements = function (special) {
            if (special === void 0) { special = false; }
            var input = null;
            if (this.myForm.esModoIngreso && this.childs.length && this.childs[0].data.tipoc == 'O') {
                input = this.displayInputForOptions();
            }
            var trOrDiv = js_to_html_1.html[this.inTable ? 'tr' : 'div']({ class: "propios" }, [].concat(this.displayRef(), this.displayMainText(), input, (this.data.tipovar && this.inTable ? this.displayInput() : null))).create();
            if (this.inTable) {
                this.adaptOptionInput(trOrDiv);
            }
            return trOrDiv;
        };
        tipoc_P.prototype.displayChilds = function () {
            return this.childs ? [js_to_html_1.html.table({ class: "hijos" }, Array.prototype.concat.apply([], this.childs.map(function (child) {
                    return child.display();
                })))] : [];
        };
        tipoc_P.prototype.displayBottomElement = function () {
            return [this.data.salto ? js_to_html_1.html.div({ class: "salto" }, this.data.salto) : null];
        };
        return tipoc_P;
    }(tipoc_Base));
    exports.tipoc_P = tipoc_P;
    var tipoc_PMATRIZ = /** @class */ (function (_super) {
        __extends(tipoc_PMATRIZ, _super);
        function tipoc_PMATRIZ() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        tipoc_PMATRIZ.prototype.displayChilds = function () {
            var nextColumn = 2;
            var foundedColumns = {};
            var foundedColumnsArray = [js_to_html_1.html.td(), js_to_html_1.html.td()];
            var dataRow = this.childs.map(function (opcion) {
                var actualRow = js_to_html_1.html.tr([
                    js_to_html_1.html.td({ class: 'casillero' }, opcion.data.casillero),
                    js_to_html_1.html.td({ class: 'nombre' }, opcion.data.nombre),
                ]).create();
                opcion.childs.forEach(function (pregunta) {
                    var actualPos;
                    var attrs = { class: 'pmatriz_titulo_columna', "casillero-id": pregunta.data.padre + '/' + pregunta.data.casillero };
                    if (!foundedColumns[pregunta.data.nombre]) {
                        foundedColumns[pregunta.data.nombre] = {
                            ubicacion: nextColumn,
                            html: js_to_html_1.html.td(attrs, pregunta.data.nombre)
                        };
                        foundedColumnsArray.push(foundedColumns[pregunta.data.nombre].html);
                        nextColumn++;
                    }
                    actualPos = foundedColumns[pregunta.data.nombre].ubicacion;
                    while (actualRow.cells.length <= actualPos) {
                        actualRow.insertCell(-1);
                    }
                    actualRow.cells[actualPos].className = 'pmatriz_variable';
                    actualRow.cells[actualPos].appendChild(pregunta.displayInput(true));
                });
                return actualRow;
            });
            dataRow.unshift(js_to_html_1.html.tr(foundedColumnsArray).create());
            return [js_to_html_1.html.table(dataRow)];
        };
        return tipoc_PMATRIZ;
    }(tipoc_Base));
    exports.tipoc_PMATRIZ = tipoc_PMATRIZ;
    var tipoc_O = /** @class */ (function (_super) {
        __extends(tipoc_O, _super);
        function tipoc_O() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        tipoc_O.prototype.display = function (special) {
            if (special === void 0) { special = false; }
            return [this.displayTopElements(special)].concat(Array.prototype.concat.apply([], this.childs.map(function (child) {
                child.inTable = true;
                return child.display(special);
            })));
        };
        tipoc_O.prototype.displayTopElements = function (special) {
            if (special === void 0) { special = false; }
            var content = [].concat(js_to_html_1.html.td({ class: 'casillero' }, this.displayRef({ forValue: this.data.casillero })), js_to_html_1.html.td([js_to_html_1.html.input({ type: 'radio', value: this.data.casillero, tabindex: '-1' })]), js_to_html_1.html.td({ class: 'nombre' }, this.displayMainText({ forValue: this.data.casillero })), (this.data.salto ? js_to_html_1.html.td({ class: "salto" }, this.data.salto) : null));
            if (special) {
                return { tds: content };
            }
            return js_to_html_1.html.tr({ class: "tipoc_O" }, content);
        };
        return tipoc_O;
    }(tipoc_Base));
    exports.tipoc_O = tipoc_O;
    var tipoc_OM = /** @class */ (function (_super) {
        __extends(tipoc_OM, _super);
        function tipoc_OM() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        tipoc_OM.prototype.display = function () {
            var input = null;
            if (this.myForm.esModoIngreso) {
                input = this.displayInputForOptions();
            }
            this.createVariable();
            var trOM = js_to_html_1.html.tr({ class: "tipoc_OM" }, [].concat(js_to_html_1.html.td({ class: 'casillero' }, this.displayRef()), js_to_html_1.html.td({ class: 'vacio' }), js_to_html_1.html.td({ class: 'nombre' }, this.displayMainText())).concat(input, Array.prototype.concat.apply([], this.childs.map(function (child) {
                return child.display(true)[0].tds;
            })))).create();
            this.adaptOptionInput(trOM);
            return [trOM].concat(Array.prototype.concat.apply([], this.childs.map(function (child) {
                child.inTable = true;
                return child.display(true).slice(1);
            })));
        };
        tipoc_OM.prototype.displayChilds = function () {
            return this.childs ? [js_to_html_1.html.table({ class: "hijos" }, Array.prototype.concat.apply([], this.childs.map(function (child) {
                    return child.display();
                })))] : [];
        };
        return tipoc_OM;
    }(tipoc_Base));
    exports.tipoc_OM = tipoc_OM;
    var tipoc_BF = /** @class */ (function (_super) {
        __extends(tipoc_BF, _super);
        function tipoc_BF() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        tipoc_BF.prototype.adaptOptionInput = function (groupElement) {
            var formAnalysisUnit = this.data.unidad_analisis;
            var PuedeAgregarRenglones = true;
            var cantResumen = this.data.cantidad_resumen;
            var nombreFormulario = this.data.casillero;
            var myForm = this.myForm;
            var loadForm = function loadForm(formId, formData, formAnalysisUnit, iPosition, myForm) {
                myForm.addToStack({ formData: myForm.formData, formId: myForm.formId, analysisUnit: formAnalysisUnit, iPosition: iPosition, scrollY: window.scrollY });
                var mainForm = document.getElementById(myForm.mainFormHTMLId);
                var formManager = new FormManager(myForm.surveyManager, formId, formData, myForm.stack);
                formManager.iPosition = iPosition;
                var toDisplay = formManager.display();
                formManager.validateDepot();
                formManager.refreshState();
                mainForm.innerHTML = '';
                mainForm.appendChild(toDisplay);
                window.scrollTo(0, 0);
            };
            var createFormButton = function createFormButton(formName, buttonDescription, myForm, rowHijo, formAnalysisUnit, iPosition) {
                var button = js_to_html_1.html.button({ class: 'boton-formulario' }, buttonDescription).create();
                button.onclick = function () {
                    loadForm(formName, rowHijo, formAnalysisUnit, iPosition, myForm);
                };
                return button;
            };
            var completarTablaResumen = function completarTablaResumen(table, formData, navigationButton, maxFieldsCount) {
                var thArray = [];
                thArray.push(js_to_html_1.html.th({ class: 'col' }, '').create());
                var tdArray = [];
                tdArray.push(js_to_html_1.html.td({ class: 'col' }, [navigationButton]).create());
                var searchInfoCasilleroByUAInStructure = function searchInfoCasilleroByUAInStructure(mainStructure, UA) {
                    return Object.values(mainStructure).find(function (infoCasillero) {
                        return infoCasillero.data.unidad_analisis === UA;
                    });
                };
                Object.keys(formData).forEach(function (key) {
                    if (Array.isArray(formData[key])) {
                        var buttonsArray = [];
                        if (formData[key].length) {
                            formData[key].forEach(function (childFormData, index) {
                                var infoCasillero = searchInfoCasilleroByUAInStructure(myForm.surveyManager.surveyMetadata.structure, key);
                                var button = js_to_html_1.html.button({ class: 'boton-formulario' }, infoCasillero.data.casillero + ' ' + (index + 1)).create();
                                button.onclick = function () {
                                    loadForm(infoCasillero.data.casillero, childFormData, formAnalysisUnit, index, myForm);
                                };
                                buttonsArray.push(button);
                            });
                        }
                        thArray.push(js_to_html_1.html.th({ class: 'col' }, key).create());
                        tdArray.push(js_to_html_1.html.td({ class: 'col' }, buttonsArray).create());
                    }
                    else {
                        if (thArray.filter(function (th) { return th.getAttribute('element-type') === 'question'; }).length < maxFieldsCount) {
                            var infoCasillero = searchInfoCasilleroByUAInStructure(myForm.surveyManager.surveyMetadata.structure, formAnalysisUnit);
                            var var_name = key.toString();
                            var searchInfoCasilleroByVarName = function searchInfoCasilleroByVarName(infoCasillero, var_name) {
                                for (var i = 0; i < infoCasillero.childs.length; i++) {
                                    if (typeof infoCasillero.childs[i] !== "function") {
                                        var aux = infoCasillero.childs[i].data.var_name;
                                        if (aux && (var_name === aux || var_name === aux.toUpperCase())) {
                                            return infoCasillero.childs[i];
                                        }
                                    }
                                    var result = searchInfoCasilleroByVarName(infoCasillero.childs[i], var_name);
                                    if (result) {
                                        return result;
                                    }
                                }
                                return null;
                            };
                            var infoCasillero = searchInfoCasilleroByVarName(infoCasillero, var_name);
                            var respuesta;
                            if (infoCasillero.childs.length) {
                                var result = infoCasillero.childs.find(function (option) {
                                    var var_name = (formData[key] || '').toString();
                                    return option.data.casillero === var_name || option.data.casillero === var_name.toUpperCase();
                                });
                                respuesta = result ? result.data.nombre : '';
                            }
                            else {
                                respuesta = formData[key] ? formData[key].toString() : '';
                            }
                            var pregunta = infoCasillero.data.nombre;
                            thArray.push(js_to_html_1.html.th({ class: 'col', "element-type": "question" }, pregunta).create());
                            tdArray.push(js_to_html_1.html.td({ class: 'col' }, respuesta).create());
                        }
                    }
                });
                var tr;
                if (table.children.length === 0) {
                    tr = js_to_html_1.html.tr({ class: 'row' }, thArray).create();
                    table.appendChild(tr);
                }
                tr = js_to_html_1.html.tr({ class: 'row' }, tdArray).create();
                table.appendChild(tr);
                return table;
            };
            if (myForm.formData[formAnalysisUnit]) {
                if (cantResumen) {
                    var table = js_to_html_1.html.table({ class: 'resumen' }).create();
                }
                myForm.formData[formAnalysisUnit].forEach(function (rowHijo, iPosition) {
                    var button = createFormButton(nombreFormulario, nombreFormulario + ' ' + (iPosition + 1), myForm, rowHijo, formAnalysisUnit, iPosition + 1);
                    if (cantResumen) {
                        table = completarTablaResumen(table, rowHijo, button, cantResumen);
                    }
                    else {
                        groupElement.appendChild(button);
                    }
                });
                if (cantResumen) {
                    groupElement.appendChild(table);
                }
                if (PuedeAgregarRenglones) {
                    var button = js_to_html_1.html.button({ class: 'boton-nuevo-formulario' }, "Nuevo " + nombreFormulario).create();
                    var div = js_to_html_1.html.div({ class: 'nuevo-formulario' }, [button]).create();
                    groupElement.appendChild(div);
                    button.onclick = function () {
                        var aUStructures = myForm.surveyManager.surveyMetadata.analysisUnitStructure;
                        var aUStructure = aUStructures.find(function (au) {
                            return au.unidad_analisis === formAnalysisUnit;
                        });
                        var newRow = {};
                        aUStructure.preguntas.forEach(function (pregunta) {
                            newRow[pregunta.var_name] = pregunta.es_unidad_analisis ? [] : null;
                        });
                        myForm.formData[formAnalysisUnit].push(newRow);
                        myForm.saveSurvey();
                        var iPosition = myForm.formData[formAnalysisUnit].length - 1;
                        loadForm(nombreFormulario, myForm.formData[formAnalysisUnit][iPosition], formAnalysisUnit, iPosition + 1, myForm);
                    };
                }
            }
            else {
                groupElement.appendChild(createFormButton(nombreFormulario, nombreFormulario, myForm, myForm.formData, null, null));
            }
            myForm.formsButtonZone[this.data.casillero] = groupElement;
        };
        return tipoc_BF;
    }(tipoc_Base));
    exports.tipoc_BF = tipoc_BF;
    var SurveyManager = /** @class */ (function () {
        function SurveyManager(surveyMetadata, surveyId, surveyData) {
            this.surveyMetadata = surveyMetadata;
            this.surveyId = surveyId;
            this.surveyData = surveyData;
        }
        SurveyManager.prototype.displayMainForm = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new FormManager(this, this.surveyMetadata.mainForm, this.surveyData, [])];
                });
            });
        };
        Object.defineProperty(SurveyManager.prototype, "surveyStructure", {
            get: function () {
                return this.surveyMetadata.structure;
            },
            enumerable: true,
            configurable: true
        });
        SurveyManager.prototype.saveSurvey = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    localStorage.setItem(this.surveyMetadata.operative + '_survey_' + this.surveyId, JSON.stringify(this.surveyData));
                    return [2 /*return*/];
                });
            });
        };
        return SurveyManager;
    }());
    exports.SurveyManager = SurveyManager;
    var FormManager = /** @class */ (function () {
        function FormManager(surveyManager, formId, formData, stack) {
            this.surveyManager = surveyManager;
            this.formId = formId;
            this.formData = formData;
            this.stack = stack;
            this.variables = {};
            this.controls = {};
            this.elements = {};
            this.controlBox = {};
            this.esModoIngreso = true;
            this.formsButtonZone = {};
            this.state = {};
            this.mainFormHTMLId = 'main-form'; //Quitar generalizacion
            this.iPosition = 1;
            this.content = this.newInstance(surveyManager.surveyStructure[formId]);
            this.adaptStructure();
        }
        FormManager.prototype.adaptStructure = function () { };
        Object.defineProperty(FormManager.prototype, "factory", {
            get: function () {
                return {
                    Base: tipoc_Base,
                    F: tipoc_F,
                    B: tipoc_B,
                    TEXTO: tipoc_TEXTO,
                    MATRIZ: tipoc_MATRIZ,
                    CONS: tipoc_CONS,
                    PMATRIZ: tipoc_PMATRIZ,
                    P: tipoc_P,
                    O: tipoc_O,
                    OM: tipoc_OM,
                    CP: tipoc_P,
                    BF: tipoc_BF
                };
            },
            enumerable: true,
            configurable: true
        });
        FormManager.prototype.newInstance = function (infoCasillero) {
            var myForm = this;
            if (!this.factory[infoCasillero.data.tipoc]) {
                throw new Error("No existe el tipo de casillero " + infoCasillero.data.tipoc);
            }
            return new this.factory[infoCasillero.data.tipoc](infoCasillero, myForm);
            //newStructure.myForm=myForm;
            //return newStructure;
        };
        FormManager.prototype.getFirstFromStack = function () {
            return this.stack[0];
        };
        FormManager.prototype.addToStack = function (navigationStack) {
            this.stack = [navigationStack].concat(this.stack);
        };
        FormManager.prototype.removeFirstFromStack = function () {
            this.stack = this.stack.slice(1);
        };
        FormManager.prototype.stackLength = function () {
            return this.stack.length;
        };
        FormManager.prototype.display = function () {
            return js_to_html_1.html.div({ class: 'form-content' }, this.content.display()).create();
        };
        FormManager.prototype.saveSurvey = function () {
            return this.surveyManager.saveSurvey();
        };
        FormManager.prototype.completeCalculatedVars = function () {
            /*
            var row=this.depot.row;
            var controls=this.controls;
            var calculatedVars=[];*/
            return;
            /*if(this.depot.formId=='F1'){
    
                // si no hay datos de la encuesta actual entonces se pone u1 y u2 con los valores por defecto (sacados de 'verveySetup')
                var surveyId = sessionStorage.getItem('surveyId');
                var operativo = sessionStorage.getItem('operativo');
                var currentSurvey = localStorage.getItem(operativo + '_survey_' + surveyId);
                if (!currentSurvey){
                    var surveySetup = JSON.parse(localStorage.getItem('surveySetup'));
                    row.u1 = surveySetup.recorrido;
                    row.u2 = surveySetup.tipo_recorrido;
                }
    
                var recordables=[
                    {variable: 'u3' },
                    {variable: 'u4' },
                    {variable: 'u21', previa:'u8'},
                    {variable: 'u22', previa:'u8'},
                ];
                recordables.forEach(function(recordableDef){
                    var varName=recordableDef.variable;
                    var recordableStorage = localStorage.getItem('recordable_'+varName);
                    if(recordableStorage && !row[varName] && (!recordableDef.previa || row[recordableDef.previa])){
                        row[varName] = JSON.parse(recordableStorage);
                    }
                    controls[varName].addEventListener('update',function(){
                        localStorage.setItem('recordable_'+varName, JSON.stringify(this.getTypedValue()));
                    });
                });
                row.cant14 = Number(row.cant11)+Number(row.cant12)+Number(row.cant13)||null;
                row.cant24 = Number(row.cant21)+Number(row.cant22)+Number(row.cant23)||null;
                row.cant34 = Number(row.cant31)+Number(row.cant32)+Number(row.cant33)||null;
                row.cant44 = Number(row.cant41)+Number(row.cant42)+Number(row.cant43)||null;
                row.cant51 = Number(row.cant11)+Number(row.cant21)+Number(row.cant31)+Number(row.cant41)||null;
                row.cant52 = Number(row.cant12)+Number(row.cant22)+Number(row.cant32)+Number(row.cant42)||null;
                row.cant53 = Number(row.cant13)+Number(row.cant23)+Number(row.cant33)+Number(row.cant43)||null;
                row.cant54 = Number(row.cant51)+Number(row.cant52)+Number(row.cant53)||null;
                calculatedVars = [
                    'cant14',
                    'cant24',
                    'cant34',
                    'cant44',
                    'cant51',
                    'cant52',
                    'cant53',
                    'cant54',
                    'gps',
                    'u1',
                    'u2',
                    'u3',
                    'u4',
                    'u21',
                    'u22'
                ];
            }
            if(this.depot.formId=='F2'){
                row.p0 = this.depot.innerPk.persona+1;
                if(this.depot.innerPk.persona == 0){
                    row.p1 = 1;
                }
                calculatedVars = [ 'p0', 'p1' ];
            }
            if(!"gps habilitado"){
                if(row.u8 != null && (row.gps == null || !(row.gps.charAt(0) == "{"))){
                    row.gps = "Buscando coordenadas...";
                    if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(function(position) {
                                row.gps = JSON.stringify({'Lat': position.coords.latitude, ' Long':position.coords.longitude});
                                controls.gps.setTypedValue(row.gps);
                            },
                            function(){
                                row.gps = "Error al obtener el punto";
                                controls.gps.setTypedValue(row.gps);
                            },
                            {enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
                    }else{
                        row.gps = "GPS inactivo";
                    }
                }
            }
            calculatedVars.forEach(function(varName){
                this.controls[varName].setTypedValue(row[varName]);
            },this)*/
        };
        FormManager.prototype.validateDepot = function () {
            this.completeCalculatedVars();
            var estructura = { variables: this.variables };
            var formData = this.formData;
            var rta = { estados: {}, siguientes: {}, actual: null, primeraFalla: null };
            var variableAnterior = null;
            var yaPasoLaActual = false;
            var enSaltoAVariable = null; // null si no estoy saltando y el destino del salto si estoy dentro de un salto. 
            var conOmitida = false;
            var miVariable = null; // variable actual del ciclo
            var falla = function (estado) {
                rta.estados[miVariable] = estado;
                if (!rta.primeraFalla) {
                    rta.primeraFalla = miVariable;
                }
            };
            for (var miVariable in estructura.variables) {
                var apagada = false;
                var revisar_saltos_especiales = false;
                var valor = formData[miVariable];
                if (conOmitida) {
                    falla('fuera_de_flujo_por_omitida');
                }
                else if (enSaltoAVariable && miVariable != enSaltoAVariable) {
                    apagada = true;
                    // estoy dentro de un salto válido, no debería haber datos ingresados.
                    if (valor === null) {
                        rta.estados[miVariable] = 'salteada';
                    }
                    else {
                        falla('fuera_de_flujo_por_salto');
                    }
                }
                else if (yaPasoLaActual) {
                    if (valor === null) {
                        rta.estados[miVariable] = 'todavia_no';
                    }
                    else {
                        conOmitida = true;
                        if (!rta.primeraFalla) {
                            rta.primeraFalla = rta.actual;
                        }
                        falla('fuera_de_flujo_por_omitida');
                    }
                }
                else if (estructura.variables[miVariable].subordinadaVar != null
                    && formData[estructura.variables[miVariable].subordinadaVar] != estructura.variables[miVariable].subordinadaValor) {
                    apagada = true;
                    rta.estados[miVariable] = 'salteada';
                }
                else {
                    // no estoy en una variable salteada y estoy dentro del flujo normal (no hubo omitidas hasta ahora). 
                    enSaltoAVariable = null; // si estaba en un salto acá se acaba
                    if (estructura.variables[miVariable].calculada) {
                        apagada = true;
                        rta.estados[miVariable] = 'calculada';
                    }
                    else if (valor === null) {
                        if (!estructura.variables[miVariable].optativa) {
                            rta.estados[miVariable] = 'actual';
                            rta.actual = miVariable;
                            yaPasoLaActual = miVariable !== null;
                        }
                        else {
                            rta.estados[miVariable] = 'optativa_sd';
                            if (estructura.variables[miVariable].salto) {
                                enSaltoAVariable = estructura.variables[miVariable].salto;
                            }
                        }
                    }
                    else if (valor == -9) {
                        rta.estados[miVariable] = 'valida';
                        if (estructura.variables[miVariable].saltoNsNr) {
                            enSaltoAVariable = estructura.variables[miVariable].saltoNsNr;
                        }
                        revisar_saltos_especiales = true;
                    }
                    else {
                        // hay algo ingresado hay que validarlo
                        if (estructura.variables[miVariable].tipo == 'opciones') {
                            if (estructura.variables[miVariable].opciones[valor]) {
                                rta.estados[miVariable] = 'valida';
                                if (estructura.variables[miVariable].opciones[valor].salto) {
                                    enSaltoAVariable = estructura.variables[miVariable].opciones[valor].salto;
                                }
                            }
                            else {
                                falla('invalida');
                            }
                        }
                        else if (estructura.variables[miVariable].tipo == 'numerico') {
                            valor = Number(valor);
                            if (estructura.variables[miVariable].maximo && valor > estructura.variables[miVariable].maximo
                                || 'minimo' in estructura.variables[miVariable] && valor < estructura.variables[miVariable].minimo) {
                                falla('fuera_de_rango');
                            }
                            else {
                                rta.estados[miVariable] = 'valida';
                            }
                        }
                        else if (estructura.variables[miVariable].tipo == 'hora') {
                            valor = this.completarHora(valor);
                            formData[miVariable] = valor;
                            var v1_item = document.getElementById('var_' + miVariable);
                            if (v1_item != null) {
                                v1_item.value = valor;
                            }
                            if (!(/^(1[3-9]|2[0-2])(:[0-5][0-9])?$/.test(valor))) {
                                falla('fuera_de_rango');
                            }
                            else {
                                rta.estados[miVariable] = 'valida';
                            }
                        }
                        else {
                            // las de texto o de ingreso libre son válidas si no se invalidaron antes por problemas de flujo
                            rta.estados[miVariable] = 'valida';
                        }
                        if (estructura.variables[miVariable].salto) {
                            enSaltoAVariable = estructura.variables[miVariable].salto;
                        }
                        revisar_saltos_especiales = true;
                    }
                    if (revisar_saltos_especiales) {
                    }
                }
                if (rta.estados[miVariable] == null) {
                    throw ('No se pudo validar la variable ' + miVariable);
                }
                if (!apagada) {
                    if (variableAnterior && !rta.siguientes[variableAnterior]) {
                        rta.siguientes[variableAnterior] = miVariable;
                    }
                    variableAnterior = miVariable;
                }
                rta.siguientes[miVariable] = enSaltoAVariable; // es null si no hay salto (o sea sigue con la próxima o es la última)
            }
            if (conOmitida) {
                for (miVariable in rta.estados) {
                    if (rta.estados[miVariable] == 'actual') {
                        rta.estados[miVariable] = 'omitida';
                    }
                    else if (rta.estados[miVariable] == 'todavia_no') {
                        rta.estados[miVariable] = 'fuera_de_flujo_por_omitida';
                    }
                    else if (rta.estados[miVariable] == 'fuera_de_flujo_por_omitida') {
                        break;
                    }
                }
            }
            this.state = rta;
            this.consistencias();
        };
        FormManager.prototype.consistencias = function () {
            /*
            var row=this.depot.row;
            var myForm=this;
            function consistir(consistencia, ultima_variable, precondicion, postcondicion){
                myForm.elements[consistencia].setAttribute(
                    'status-consistencia',
                    !precondicion() || postcondicion()?'consistente':'inconsistente'
                );
                // this.state.estados[ultima_variable]='inconsistente';
            }
            if(myForm.depot.formId=='F1'){
                consistir('cant_per','cant54',function(){
                    return row.o3_1;
                },function(){
                    return row.cant54 === row.u8;
                });
                consistir('u6_o_u7','u7',function(){
                    return row.u8 != null;
                },function(){
                    return row.u6 != null || row.u7 != null;
                });
            }
            if(myForm.depot.formId=='F2'){
                consistir('referente1','p1',function(){
                    return row.p2 && myForm.depot.innerPk.persona;
                },function(){
                    return row.p1 > 1;
                });
            }*/
        };
        FormManager.prototype.refreshState = function () {
            var rta = this.state;
            var myForm = this;
            likeAr(rta.estados).forEach(function (estado, variable) {
                if (myForm.controlBox[variable]) {
                    myForm.controlBox[variable].setAttribute('state-var', 'ok');
                    if (estado) {
                        myForm.controlBox[variable].setAttribute('state-var', estado);
                    }
                }
            });
        };
        FormManager.prototype.posicionarVentanaVerticalmente = function (control, y) {
            var rect = my.getRect(control);
            if (rect.top) {
                window.scrollTo(0, rect.top - y);
            }
            return rect.top;
        };
        FormManager.prototype.irAlSiguiente = function (variableActual, scrollScreen) {
            var nuevaVariable = this.state.siguientes[variableActual];
            var control = this.controls[nuevaVariable];
            if (scrollScreen) {
                this.posicionarVentanaVerticalmente(control, 100);
            }
            control.focus();
        };
        FormManager.prototype.completarHora = function (value) {
            return value; //TODO
        };
        FormManager.controlRepetidos = {};
        return FormManager;
    }());
    exports.FormManager = FormManager;
});
//# sourceMappingURL=form-structure.js.map