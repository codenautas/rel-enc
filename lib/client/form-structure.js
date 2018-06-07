"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OPEN_IN_OTHER_SCREEN = true;
const PUEDE_AGREGAR_RENGLONES = true;
const js_to_html_1 = require("js-to-html");
const likeAr = require("like-ar");
const TypedControls = require("typed-controls");
const TypeStore = require("type-store");
require("dialog-promise");
const my = require("myOwn");
;
//GENERALIZAR (sacar de BBDD desde meta-enc)
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
class tipoc_Base {
    constructor(infoCasillero, myForm) {
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
    setChilds(childsInfo) {
        this.childs = childsInfo.map(function (childInfo) {
            return this.myForm.newInstance(childInfo);
        }, this);
    }
    displayRef(opts = {}) {
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
    }
    displayInput(direct = false) {
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
    }
    displayMainText(opts = {}) {
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
    }
    displayTopElements(special = false) {
        return js_to_html_1.html[this.inTable ? 'tr' : 'div']({ class: "propios" }, [].concat(this.displayRef(), this.displayMainText(), (this.data.tipovar && this.inTable ? this.displayInput() : null)));
    }
    displayInputForOptions() {
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
    }
    displayChilds() {
        return [js_to_html_1.html.div({ class: "hijos" }, Array.prototype.concat.apply([], this.childs.map(function (child) {
                return child.display();
            })))];
    }
    displayBottomElement() {
        return [];
    }
    display(special = false) {
        this.createVariable();
        var content = [].concat(this.displayTopElements(), this.displayChilds(), this.displayBottomElement());
        if (this.inTable) {
            return content;
        }
        var groupElement = js_to_html_1.html.div({ class: 'tipoc_' + this.data.tipoc }, content).create();
        this.adaptOptionInput(groupElement);
        return [groupElement];
    }
    primerVariableDeDestino() {
        // fijarse el varname del destino, devolverlo
        // si no hay ir al primer hijo, agotados todos los hijos se sigue con los hermanos. 
        // si el primogénito más 
    }
    createVariable() {
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
    }
    adaptOptionInput(group) {
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
    }
    get var_name() {
        if (!this.data.tipovar) {
            throw new Error(this.data.tipovar + ' no es un tipo');
        }
        return this.data.var_name;
    }
    assignEnterKeyAndUpdateEvents(inputEntereable, typedControlUpdateable) {
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
    }
    connectControl(control) {
        var myForm = this.myForm;
        if (this.data.despliegue == 'calculada') {
            control.disable(true);
        }
        var actualValue = myForm.formData[this.var_name];
        if (actualValue === undefined) {
            actualValue = null;
            myForm.formData[this.var_name] = null;
        }
        myForm.controls[this.var_name] = control;
        if (!control.controledType.isValidTypedData(actualValue)) {
            actualValue = control.controledType.fromPlainJson(actualValue);
        }
        control.setTypedValue(actualValue);
        control.myForm = myForm;
        control.addEventListener('update', function (var_name) {
            return function () {
                var value = this.getTypedValue();
                value = value != null ? control.controledType.toPlainJson(value) : null;
                myForm.formData[var_name] = value;
                myForm.validateDepot();
                myForm.refreshState();
                myForm.saveSurvey();
                var resumenRowElement = document.getElementById('resumen-' + myForm.formId + '-' + myForm.iPosition.toString() + '-' + var_name);
                if (resumenRowElement) {
                    var respuesta = '';
                    var infoCasillero = myForm.surveyManager.surveyMetadata.structure[myForm.formId];
                    infoCasillero = myForm.searchInfoCasilleroByVarName(infoCasillero, var_name);
                    if (infoCasillero) {
                        respuesta = myForm.searchAnswerForInfoCasillero(infoCasillero, myForm.formData, var_name);
                    }
                    resumenRowElement.textContent = respuesta;
                }
            };
        }(this.var_name));
    }
}
exports.tipoc_Base = tipoc_Base;
class tipoc_F extends tipoc_Base {
    displayRef(opts = {}) {
        var button = this.createBackButton();
        return Array.prototype.concat.apply(super.displayRef(), button);
    }
    ;
    createBackButton() {
        var myForm = this.myForm;
        if (myForm.stackLength()) {
            var firstFromStack = myForm.getFirstFromStack();
            var button = js_to_html_1.html.button({ class: 'boton-formulario' }, "Volver al " + firstFromStack.formName).create();
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
    }
    ;
    displayBottomElement() {
        var button = this.createBackButton();
        return Array.prototype.concat.apply(super.displayBottomElement(), [js_to_html_1.html.div({}, button).create()]);
    }
}
exports.tipoc_F = tipoc_F;
class tipoc_B extends tipoc_Base {
}
exports.tipoc_B = tipoc_B;
class tipoc_MATRIZ extends tipoc_Base {
}
exports.tipoc_MATRIZ = tipoc_MATRIZ;
class tipoc_TEXTO extends tipoc_Base {
}
exports.tipoc_TEXTO = tipoc_TEXTO;
class tipoc_CONS extends tipoc_Base {
}
exports.tipoc_CONS = tipoc_CONS;
class tipoc_P extends tipoc_Base {
    displayTopElements(special = false) {
        var input = null;
        if (this.myForm.esModoIngreso && this.childs.length && this.childs[0].data.tipoc == 'O') {
            input = this.displayInputForOptions();
        }
        var trOrDiv = js_to_html_1.html[this.inTable ? 'tr' : 'div']({ class: "propios" }, [].concat(this.displayRef(), this.displayMainText(), input, (this.data.tipovar && this.inTable ? this.displayInput() : null))).create();
        if (this.inTable) {
            this.adaptOptionInput(trOrDiv);
        }
        return trOrDiv;
    }
    displayChilds() {
        return this.childs ? [js_to_html_1.html.table({ class: "hijos" }, Array.prototype.concat.apply([], this.childs.map(function (child) {
                return child.display();
            })))] : [];
    }
    displayBottomElement() {
        return [this.data.salto ? js_to_html_1.html.div({ class: "salto" }, this.data.salto) : null];
    }
}
exports.tipoc_P = tipoc_P;
class tipoc_PMATRIZ extends tipoc_Base {
    displayChilds() {
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
    }
}
exports.tipoc_PMATRIZ = tipoc_PMATRIZ;
class tipoc_O extends tipoc_Base {
    display(special = false) {
        return [this.displayTopElements(special)].concat(Array.prototype.concat.apply([], this.childs.map(function (child) {
            child.inTable = true;
            return child.display(special);
        })));
    }
    displayTopElements(special = false) {
        var content = [].concat(js_to_html_1.html.td({ class: 'casillero' }, this.displayRef({ forValue: this.data.casillero })), js_to_html_1.html.td([js_to_html_1.html.input({ type: 'radio', value: this.data.casillero, tabindex: '-1' })]), js_to_html_1.html.td({ class: 'nombre' }, this.displayMainText({ forValue: this.data.casillero })), (this.data.salto ? js_to_html_1.html.td({ class: "salto" }, this.data.salto) : null));
        if (special) {
            return { tds: content };
        }
        return js_to_html_1.html.tr({ class: "tipoc_O" }, content);
    }
}
exports.tipoc_O = tipoc_O;
class tipoc_OM extends tipoc_Base {
    display() {
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
    }
    displayChilds() {
        return this.childs ? [js_to_html_1.html.table({ class: "hijos" }, Array.prototype.concat.apply([], this.childs.map(function (child) {
                return child.display();
            })))] : [];
    }
}
exports.tipoc_OM = tipoc_OM;
class tipoc_BF extends tipoc_Base {
    adaptOptionInput(groupElement) {
        var formAnalysisUnit = this.data.unidad_analisis;
        var PuedeAgregarRenglones = PUEDE_AGREGAR_RENGLONES;
        var openInOtherScreen = OPEN_IN_OTHER_SCREEN;
        var cantResumen = this.data.cantidad_resumen;
        var mostrarUnidadesAnalisisEnResumen = true;
        var nombreFormulario = this.data.casillero;
        var myForm = this.myForm;
        var clearAllOpenForms = function clearAllOpenForms(nombreFormulario) {
            myForm.formData[formAnalysisUnit].forEach(function (rowHijo, iPosition) {
                var element = document.getElementById('despliegue-formulario-' + nombreFormulario + '-' + (iPosition + 1).toString());
                if (element) {
                    element.innerHTML = '';
                }
            });
            groupElement.scrollIntoView();
        };
        var loadForm = function loadForm(nombreFormulario, formData, formAnalysisUnit, iPosition, myForm) {
            var formDisplayElement;
            if (openInOtherScreen) {
                var formName = myForm.surveyManager.searchUaStructureByFormId(myForm.formId).casillero_formulario;
                myForm.addToStack({ formData: myForm.formData, formName: formName, formId: myForm.formId, analysisUnit: formAnalysisUnit, iPosition: iPosition, scrollY: window.scrollY });
                formDisplayElement = document.getElementById(myForm.mainFormHTMLId);
                window.scrollTo(0, 0);
            }
            else {
                clearAllOpenForms(nombreFormulario);
                formDisplayElement = document.getElementById('despliegue-formulario-' + nombreFormulario + '-' + (iPosition).toString());
                if (!formDisplayElement && mostrarUnidadesAnalisisEnResumen) {
                    formDisplayElement = document.getElementById('despliegue-formulario-' + nombreFormulario + '-ua-children');
                }
            }
            var aUStructure = myForm.surveyManager.searchUaStructureByFormName(nombreFormulario);
            var formManager = new FormManager(myForm.surveyManager, aUStructure.id_casillero_formulario, formData, myForm.stack);
            formManager.iPosition = iPosition;
            var toDisplay = formManager.display();
            formManager.validateDepot();
            formManager.refreshState();
            formDisplayElement.innerHTML = '';
            formDisplayElement.appendChild(toDisplay);
        };
        var createFormButton = function createFormButton(formName, buttonDescription, myForm, rowHijo, formAnalysisUnit, iPosition) {
            var button = js_to_html_1.html.button({ class: 'boton-formulario' }, buttonDescription).create();
            button.onclick = function () {
                loadForm(formName, rowHijo, formAnalysisUnit, iPosition, myForm);
            };
            return button;
        };
        var completarTablaResumen = function completarTablaResumen(table, nombreFormulario, formData, navigationButton, maxFieldsCount, mostrarUnidadesAnalisisEnResumen, formId, iPosition) {
            if (table) {
                var thArray = [];
                thArray.push(js_to_html_1.html.th({ class: 'col' }, '').create());
                var tdArray = [];
                tdArray.push(js_to_html_1.html.td({ class: 'col' }, [navigationButton]).create());
                var aUStructure = myForm.surveyManager.searchUaStructureByFormName(formId);
                aUStructure.preguntas.forEach(function (pregunta) {
                    if (pregunta.es_unidad_analisis) {
                        if (mostrarUnidadesAnalisisEnResumen) {
                            var buttonsArray = [];
                            if (formData[pregunta.var_name].length) {
                                formData[pregunta.var_name].forEach(function (childFormData, index) {
                                    var infoCasillero = myForm.surveyManager.surveyMetadata.structure[aUStructure.id_casillero_formulario];
                                    var formIdForUa = myForm.searchFormIdForUaInForm(infoCasillero, infoCasillero.data.casillero, pregunta.var_name);
                                    if (formIdForUa) {
                                        var button = js_to_html_1.html.button({ class: 'boton-formulario' }, formIdForUa + ' ' + (index + 1)).create();
                                        button.onclick = function () {
                                            loadForm(formIdForUa, childFormData, pregunta.var_name, index, myForm);
                                        };
                                        buttonsArray.push(button);
                                    }
                                    else {
                                        throw new Error("Falta BF hacia UA '" + pregunta.var_name + "' dentro de F '" + infoCasillero.data.casillero + "'");
                                    }
                                });
                            }
                            thArray.push(js_to_html_1.html.th({ class: 'col' }, pregunta.var_name).create());
                            tdArray.push(js_to_html_1.html.td({ class: 'col' }, buttonsArray).create());
                        }
                    }
                    else {
                        if (thArray.filter(function (th) { return th.getAttribute('element-type') === 'question'; }).length < maxFieldsCount) {
                            var infoCasillero = myForm.surveyManager.surveyMetadata.structure[aUStructure.id_casillero_formulario];
                            var var_name = pregunta.var_name;
                            var infoCasillero = myForm.searchInfoCasilleroByVarName(infoCasillero, var_name);
                            if (infoCasillero) {
                                var respuesta = myForm.searchAnswerForInfoCasillero(infoCasillero, formData, var_name);
                                thArray.push(js_to_html_1.html.th({ class: 'col', "element-type": "question" }, infoCasillero.data.nombre).create());
                                tdArray.push(js_to_html_1.html.td({ id: 'resumen-' + formId + '-' + (iPosition + 1).toString() + '-' + var_name, class: 'col' }, respuesta).create());
                            }
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
                if (!openInOtherScreen) {
                    var auColumns = aUStructure.preguntas.filter(function (pregunta) { return pregunta.es_unidad_analisis === true; }).length;
                    var trChild = js_to_html_1.html.td({ id: 'despliegue-formulario-' + nombreFormulario + '-' + (iPosition + 1).toString(), colspan: (cantResumen + 1 + auColumns) }).create();
                    tr = js_to_html_1.html.tr({ class: 'row' }, [trChild]).create();
                    table.appendChild(tr);
                }
                return table;
            }
            return null;
        };
        var createRowView = function createRowView(element, nombreFormulario, row, iPosition) {
            var button = createFormButton(nombreFormulario, nombreFormulario + ' ' + (iPosition + 1), myForm, row, formAnalysisUnit, iPosition + 1);
            if (cantResumen) {
                element = completarTablaResumen(element, nombreFormulario, row, button, cantResumen, mostrarUnidadesAnalisisEnResumen, nombreFormulario, iPosition);
            }
            else {
                var spanChild = openInOtherScreen ? null : js_to_html_1.html.span({ id: 'despliegue-formulario-' + nombreFormulario + '-' + (iPosition + 1).toString() }, []).create();
                var span = js_to_html_1.html.span({ id: 'despliegue-row-hijo-' + nombreFormulario + '-' + (iPosition + 1).toString() }, [
                    button,
                    spanChild,
                ]).create();
                despliegueDiv.appendChild(span);
            }
        };
        var despliegueDiv = (js_to_html_1.html.div({ id: 'despliegue-rows-' + nombreFormulario }, []).create());
        groupElement.appendChild(despliegueDiv);
        var ua = myForm.surveyManager.searchUaStructureByFormName(nombreFormulario);
        var uaPadre = myForm.surveyManager.searchUaStructureByFormId(myForm.formId).unidad_analisis;
        if (!formAnalysisUnit) {
            if (ua && ua.unidad_analisis_padre === uaPadre) {
                formAnalysisUnit = ua.unidad_analisis;
                mostrarUnidadesAnalisisEnResumen = false;
            }
        }
        if (myForm.formData[formAnalysisUnit]) {
            var htmlElement = null;
            if (cantResumen) {
                var table = js_to_html_1.html.table({ id: 'resumen-' + nombreFormulario, class: 'resumen' }).create();
                groupElement.appendChild(table);
                htmlElement = table;
            }
            myForm.formData[formAnalysisUnit].forEach(function (rowHijo, iPosition) {
                createRowView(htmlElement, nombreFormulario, rowHijo, iPosition);
            });
            if (!openInOtherScreen && mostrarUnidadesAnalisisEnResumen && cantResumen) {
                var trChild = js_to_html_1.html.td({ id: 'despliegue-formulario-' + nombreFormulario + '-ua-children', colspan: (cantResumen + 1) }).create();
                var tr = js_to_html_1.html.tr({ class: 'row' }, [trChild]).create();
                table.appendChild(tr);
            }
            if (PuedeAgregarRenglones) {
                var newButton = js_to_html_1.html.button({ class: 'boton-nuevo-formulario' }, "Nuevo " + nombreFormulario).create();
                newButton.onclick = function () {
                    var control = myForm.controls[self.data.var_name];
                    control.setTypedValue(null, true);
                    var aUStructure = myForm.surveyManager.searchUaStructureByUa(formAnalysisUnit);
                    var newRow = {};
                    aUStructure.preguntas.forEach(function (pregunta) {
                        newRow[pregunta.var_name] = pregunta.es_unidad_analisis ? [] : null;
                    });
                    myForm.formData[formAnalysisUnit].push(newRow);
                    myForm.saveSurvey();
                    var iPosition = myForm.formData[formAnalysisUnit].length - 1;
                    var estructurasAactualizar = myForm.surveyManager.surveyMetadata.analysisUnitStructure.filter(function (auStructure) {
                        return auStructure.unidad_analisis === formAnalysisUnit;
                    });
                    estructurasAactualizar.forEach(function (estructuraAactualizar) {
                        var element = document.getElementById('resumen-' + estructuraAactualizar.id_casillero_formulario);
                        createRowView(element, estructuraAactualizar.id_casillero_formulario, newRow, iPosition);
                    });
                    loadForm(nombreFormulario, myForm.formData[formAnalysisUnit][iPosition], formAnalysisUnit, iPosition + 1, myForm);
                };
                var readybutton = js_to_html_1.html.button({ class: 'boton-listo-formulario' }, "Listo ").create();
                var self = this;
                readybutton.onclick = function () {
                    if (!openInOtherScreen) {
                        clearAllOpenForms(nombreFormulario);
                    }
                    var control = myForm.controls[self.data.var_name];
                    control.setTypedValue(1, true);
                };
                var div = js_to_html_1.html.div({ class: 'nuevo-formulario' }, [newButton, readybutton]).create();
                groupElement.appendChild(div);
            }
        }
        else {
            if (ua && ua.unidad_analisis_padre === uaPadre) {
                groupElement.appendChild(createFormButton(nombreFormulario, nombreFormulario, myForm, myForm.formData, null, null));
            }
            else {
                throw new Error('Casillero BF mal definido en ' + this.data.padre);
            }
        }
        myForm.formsButtonZone[this.data.casillero] = groupElement;
    }
}
exports.tipoc_BF = tipoc_BF;
class SurveyManager {
    constructor(surveyMetadata, surveyId, surveyData) {
        this.surveyMetadata = surveyMetadata;
        this.surveyId = surveyId;
        this.surveyData = surveyData;
    }
    async displayMainForm() {
        return new FormManager(this, this.surveyMetadata.mainForm, this.surveyData, []);
    }
    get surveyStructure() {
        return this.surveyMetadata.structure;
    }
    async saveSurvey() {
        localStorage.setItem(this.surveyMetadata.operative + '_survey_' + this.surveyId, JSON.stringify(this.surveyData));
        return;
    }
    searchUaStructureByUa(ua) {
        return this.surveyMetadata.analysisUnitStructure.find(function (au) {
            return au.unidad_analisis === ua;
        });
    }
    searchUaStructureByFormId(formId) {
        return this.surveyMetadata.analysisUnitStructure.find(function (au) {
            return au.id_casillero_formulario === formId;
        });
    }
    searchUaStructureByFormName(formName) {
        return this.surveyMetadata.analysisUnitStructure.find(function (au) {
            return au.casillero_formulario === formName;
        });
    }
}
exports.SurveyManager = SurveyManager;
class FormManager {
    constructor(surveyManager, formId, formData, stack) {
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
    adaptStructure() { }
    get factory() {
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
    }
    newInstance(infoCasillero) {
        let myForm = this;
        if (!this.factory[infoCasillero.data.tipoc]) {
            throw new Error("No existe el tipo de casillero " + infoCasillero.data.tipoc);
        }
        return new this.factory[infoCasillero.data.tipoc](infoCasillero, myForm);
        //newStructure.myForm=myForm;
        //return newStructure;
    }
    getFirstFromStack() {
        return this.stack[0];
    }
    addToStack(navigationStack) {
        this.stack = [navigationStack].concat(this.stack);
    }
    removeFirstFromStack() {
        this.stack = this.stack.slice(1);
    }
    stackLength() {
        return this.stack.length;
    }
    display() {
        return js_to_html_1.html.div({ class: 'form-content' }, this.content.display()).create();
    }
    searchInfoCasilleroByVarName(infoCasillero, var_name) {
        for (var i = 0; i < infoCasillero.childs.length; i++) {
            if (typeof infoCasillero.childs[i] !== "function") {
                var aux = infoCasillero.childs[i].data.var_name;
                if (aux && (var_name === aux || var_name === aux.toUpperCase())) {
                    return infoCasillero.childs[i];
                }
            }
            var result = this.searchInfoCasilleroByVarName(infoCasillero.childs[i], var_name);
            if (result) {
                return result;
            }
        }
        return null;
    }
    searchAnswerForInfoCasillero(infoCasillero, formData, var_name) {
        var respuesta;
        if (infoCasillero.childs.length) {
            var result = infoCasillero.childs.find(function (option) {
                var aux = (formData[var_name] || '').toString();
                return option.data.casillero === aux || option.data.casillero === aux.toUpperCase();
            });
            respuesta = result ? result.data.nombre : '';
        }
        else {
            respuesta = formData[var_name] ? formData[var_name] : null;
            if (respuesta !== null || respuesta !== undefined) {
                var typeInfo = exports.formTypes[infoCasillero.data.tipovar];
                var typedValue = respuesta ? TypeStore.typerFrom(typeInfo).fromPlainJson(respuesta) : null;
                respuesta = typedValue ? TypeStore.typerFrom(typeInfo).toLocalString(typedValue) : null;
            }
        }
        return respuesta;
    }
    //COMPLETAR
    searchFormIdForUaInForm(infoCasillero, formId, analysisUnit) {
        for (var i = 0; i < infoCasillero.childs.length; i++) {
            if (typeof infoCasillero.childs[i] !== "function") {
                var data = infoCasillero.childs[i].data;
                if (data.tipoc === 'BF' && data.ultimo_ancestro === formId) {
                    var ua = null;
                    if (data.unidad_analisis) {
                        ua = data.unidad_analisis;
                    }
                    else {
                        var formUA = this.surveyManager.surveyMetadata.structure[data.casillero].data.unidad_analisis;
                        if (formUA === analysisUnit) {
                            ua = analysisUnit;
                        }
                        else {
                            throw new Error("Error con la UA '" + analysisUnit + "' en formulario '" + formId + "'");
                        }
                    }
                    if (ua === analysisUnit) {
                        return data.casillero;
                    }
                }
            }
            var result = this.searchFormIdForUaInForm(infoCasillero.childs[i], formId, analysisUnit);
            if (result) {
                return result;
            }
        }
        return null;
    }
    saveSurvey() {
        return this.surveyManager.saveSurvey();
    }
    completeCalculatedVars() {
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
    }
    validateDepot() {
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
            let apagada = false;
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
                        //}else if(!tiposComunes[estructura.variables[miVariable].tipo]){
                        //    if(!control.controledType.isDataValid(actualValue)){
                        //        actualValue = control.controledType.fromPlainJson(actualValue);
                        //    }
                        //}else if(estructura.variables[miVariable].tipo=='fecha'){
                        //    try{
                        //        if(!(valor instanceof Date)){
                        //            valor=bestGlobals.date.iso(valor);
                        //        }
                        //        formData[miVariable]=valor;
                        //        rta.estados[miVariable]='valida'; 
                        //    }catch(err){
                        //        falla('fuera_de_rango'); 
                        //    }
                        //}else if(estructura.variables[miVariable].tipo=='hora'){
                        //    //REVISAR
                        //    if(!(valor instanceof bestGlobals.timeInterval)){
                        //        valor = valor?TypeStore.typerFrom(formTypes['hora']).fromString(valor):null;
                        //    }
                        //    valor=this.completarHora(valor);
                        //    formData[miVariable]=valor;
                        //    var v1_item=document.getElementById('var_'+miVariable) as HTMLInputElement;
                        //    if(v1_item!=null){
                        //        v1_item.value=valor;
                        //    }
                        //    if(!(/^(1[3-9]|2[0-2])(:[0-5][0-9])?$/.test(valor))){
                        //        falla('fuera_de_rango'); 
                        //    }else{
                        //        rta.estados[miVariable]='valida'; 
                        //    }
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
    }
    consistencias() {
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
    }
    refreshState() {
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
    }
    posicionarVentanaVerticalmente(control, y) {
        var rect = my.getRect(control);
        if (rect.top) {
            window.scrollTo(0, rect.top - y);
        }
        return rect.top;
    }
    irAlSiguiente(variableActual, scrollScreen) {
        var nuevaVariable = this.state.siguientes[variableActual];
        var control = this.controls[nuevaVariable];
        if (scrollScreen) {
            this.posicionarVentanaVerticalmente(control, 100);
        }
        control.focus();
    }
    completarHora(value) {
        return value; //TODO
    }
}
FormManager.controlRepetidos = {};
exports.FormManager = FormManager;
//# sourceMappingURL=form-structure.js.map