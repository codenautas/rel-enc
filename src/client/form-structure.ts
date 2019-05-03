"use strict";

const OPEN_IN_OTHER_SCREEN=true;
const PUEDE_AGREGAR_RENGLONES=true;
const PUEDE_AGREGAR_OTRO_IGUAL=true;
var mostrarUnidadesAnalisisEnResumen=true;

import * as jsToHtml from "js-to-html"
import {html} from "js-to-html"
import * as likeAr from "like-ar"
import * as TypedControls from "typed-controls"
import * as TypeStore from "type-store"
import { URL } from "url";
// import "dialog-promise"

type HtmlAttrs={
    class?:string,
    colspan?:number
};

export var globalSaltosABotones={};

interface ExtendedHtmlAttrs extends HtmlAttrs{
    "for-value"?:string,
    "tipo-var"?:string,
    "longitud-var"?:string,
    "casillero-id"?:string,
};
//GENERALIZAR (sacar de BBDD desde meta-enc)
export var formTypes:{
    [key:string]:{htmlType:'text'|'number'|'tel'  , typeName:'bigint'|'text'|'decimal'|'date'|'interval', validar:'texto'|'opciones'|'numerico', radio?:boolean}
}={
    si_no_nn: {htmlType:'number', typeName:'bigint'   , validar:'opciones', radio:true},
    si_no   : {htmlType:'number', typeName:'bigint'   , validar:'opciones', radio:true},
    numero  : {htmlType:'number', typeName:'bigint'   , validar:'numerico',           },
    decimal : {htmlType:'number', typeName:'decimal'  , validar:'numerico',           },
    opciones: {htmlType:'number', typeName:'bigint'   , validar:'opciones', radio:true},
    texto   : {htmlType:'text'  , typeName:'text'     , validar:'texto'   ,           },
    fecha   : {htmlType:'tel'   , typeName:'date'     , validar:'texto'   ,           },
    hora    : {htmlType:'tel'   , typeName:'interval' , validar:'texto'   ,           },
};

export interface ExtendedHTMLElement extends HTMLElement{
    myForm?:FormManager,
    getTypedValue?:()=>any,
    setTypedValue?:(value:any, fromUserInteraction?:boolean)=>void,
    disable?:(disabled?:boolean)=>void,
}

export type InfoCasilleroRegistro={
    tipoc:string
    id_casillero:string
    ver_id:string|null
    casillero:string
    tipovar:string|null
    longitud:number|null
    optativo:boolean
    salto:string|null
    despliegue:string|null
    nombre:string
    tipoe:string
    aclaracion:string|null
    padre:string|null
    unidad_analisis: string
    cantidad_resumen: number|null
    var_name: string|null
    ultimo_ancestro: string|null
}

export type InfoCasillero={
    data:InfoCasilleroRegistro,
    childs:InfoCasillero[]
}

export type DisplayOpts={
    forValue?:any
}

export type SurveyMetadata={
    operative:string
    structure:SurveyStructure
    analysisUnitStructure:analysisUnitStructure[]
    mainForm:string
}

export type SurveyStructure={
    [key:string]:InfoCasillero
}

export type Variable={
    calculada:boolean
    optativa:boolean
    salto:string|null
    saltoNsNr:string|null
    opciones?:{
        [key:string]:{
            salto:string
        }
    }
    tipo:string
    maximo:string|null
    minimo:string|null
    subordinadaVar:string|null
    subordinadaValor:any|null
}

export type URLNavigationStack = {
    formName: string
    formId: string
    analysisUnit:string
    iPosition:number
    scrollY: number
    varname: string
}

export type NavigationStack = URLNavigationStack & {
    formData: any
    callerElement: HTMLButtonElement|null;
}

export type LastLoadedForm = {
    nombreFormulario: string,
    idFormulario: string,
    unidadAnalisis: string
}

export type FormStructureState = {
    estados?:{[key:string]:string}
    siguientes?:any
    actual?:any
    primeraVacia?:any
    primeraFalla?:any
};

export type analysisUnitStructure = {
    unidad_analisis: string
    id_casillero_formulario: string
    casillero_formulario: string
    unidad_analisis_principal: boolean
    unidad_analisis_padre: string
    preguntas: {
        orden: number
        var_name: string
        es_unidad_analisis: boolean
    }[]
}

export class tipoc_Base{ // clase base de los tipos de casilleros
    childs:tipoc_Base[]=[]
    public data:InfoCasilleroRegistro
    inTable:boolean=false
    parent:tipoc_Base|null=null
    constructor(infoCasillero:InfoCasillero, public myForm:FormManager){
        this.data=infoCasillero.data;
        this.setChilds(infoCasillero.childs)
        for(var attrName in infoCasillero) if(infoCasillero.hasOwnProperty(attrName)){
            if(!(attrName in this)){
                throw new Error("falta copiar attrName");
            }
        }
    }
    setChilds(childsInfo:InfoCasillero[]){
        var base=this;
        this.childs = childsInfo.map(function(childInfo){
            var child = base.myForm.newInstance(childInfo);
            child.parent = base;
            return child;
        },this);
    }
    displayRef(opts:DisplayOpts={}):jsToHtml.ArrayContent{
        var opts = opts || {};
        var hasValue=this.data.ver_id!='-';
        var attr:jsToHtml.Attr4HTMLElement={class:hasValue?"casillero":"vacio"};
        var value = hasValue?this.data.ver_id||this.data.casillero:null;
        if(opts.forValue){
            (attr as ExtendedHtmlAttrs)["for-value"]=opts.forValue;
            return [html.label(attr,value)];
        }
        if(this.inTable){
            return [html.td(attr,value)];
        }
        return [html.span(attr,value)];
    }
    displayInput(direct=false){
        var attr:HtmlAttrs={};
        if(this.inTable){
            attr.colspan=90;
        }
        if(!formTypes[this.data.tipovar]){
            throw new Error(this.data.tipovar+' no existe como tipo');
        }
        if(formTypes[this.data.tipovar].radio){
            return undefined;
        }
        var control = html.input({
            "tipo-var":this.data.tipovar||'unknown', 
            "longitud-var":this.data.longitud||'unknown',
            "type":formTypes[this.data.tipovar].htmlType,
        } as ExtendedHtmlAttrs).create();
        TypedControls.adaptElement(control,formTypes[this.data.tipovar]);
        this.myForm.variables[this.var_name]={
            optativa:this.data.optativo/* || /_esp/.test(this.var_name)*/,
            salto:this.myForm.searchCasilleroByIdCasillero(this.data.salto).data.var_name,
            saltoNsNr:this.myForm.searchCasilleroByIdCasillero(this.data.salto).data.var_name,
            tipo:formTypes[this.data.tipovar].validar, // numerico, hora
            maximo:null,
            minimo:null,
            calculada:this.data.despliegue=='calculada',
            subordinadaVar:null,
            subordinadaValor:null
        };
        if(this.parent && this.parent.data.tipoc=='O'){
            if(this.parent.parent && this.parent.parent.data.var_name){
                this.myForm.variables[this.var_name].subordinadaVar=this.parent.parent.data.var_name;
                this.myForm.variables[this.var_name].subordinadaValor=this.parent.data.casillero;
            }
        }
        this.connectControl(control as ExtendedHTMLElement);
        this.assignEnterKeyAndUpdateEvents(control, control);
        if(direct){
            return control;
        }
        if(this.inTable){
            return html.td(attr,[control]).create();
        }else{
            return html.span(attr,[control]).create();
        }
    }
    displayMainText(opts:DisplayOpts={}){
        var attr:jsToHtml.Attr4HTMLElement={class:"nombre"};
        if(opts.forValue){
            (attr as ExtendedHtmlAttrs)["for-value"]=opts.forValue;
        }
        var content = [
            this.data.nombre,
            (this.data.tipoe?html.span({class:"tipoe"}, this.data.tipoe):null),
            (this.data.aclaracion?html.span({class:"aclaracion"}, this.data.aclaracion):null),
        ]
        var firstElement;
        if(opts.forValue){
            firstElement = html.label(attr,content)
        }else if(this.inTable){
            firstElement = html.td(attr,content)
        }else{
            firstElement = html.span(attr,content)
        }
        return [
            firstElement,
            this.data.tipovar && !this.inTable?this.displayInput():null
        ];
    }
    displayTopElements(special=false){
        return html[this.inTable?'tr':'div']({class:"propios"},[].concat(
            this.displayRef(),
            this.displayMainText(),
            (this.data.tipovar && this.inTable?this.displayInput():null)
        ));
    }
    displayInputForOptions(){
        var inputAttr={
            class:'typed-control-input-for-options',
            "type":formTypes[this.data.tipovar].htmlType,
            "enter-clicks":"internal",
            "is-mobile":myOwn.config.useragent.isMobile.toString()
        } as jsToHtml.Attr4HTMLInputElement; 
        if(formTypes[this.data.tipovar].htmlType == 'number'){
            inputAttr["min"]='1';
            inputAttr["max"]=this.childs.length.toString();
        }
        var input = html.input(inputAttr).create();
        this.assignEnterKeyAndUpdateEvents(input, null);
        // TypedControls.adaptElement(input,formTypes[this.data.tipovar]);
        return input;
    }
    displayChilds():jsToHtml.ArrayContent{
        return [html.div({class:"hijos"},Array.prototype.concat.apply([],this.childs.map(function(child){
            return child.display();
        })))];
    }
    displayBottomElement():jsToHtml.HtmlBase[]{
        return [];
    } 
    display(special:boolean=false):jsToHtml.ArrayContent{
        this.createVariable();
        var content=[].concat(
            this.displayTopElements(),
            this.displayChilds(),
            this.displayBottomElement()
        );
        if(this.inTable){
            return content;
        }
        var groupElement = html.div({id:this.data.id_casillero, class:'tipoc_'+this.data.tipoc},content).create();
        this.myForm.elementsByIdCasillero[this.data.id_casillero]=groupElement;
        this.adaptOptionInput(groupElement);
        return [groupElement];
    }
    primerVariableDeDestino(){
        // fijarse el varname del destino, devolverlo
        // si no hay ir al primer hijo, agotados todos los hijos se sigue con los hermanos. 
        // si el primogénito más 
    }
    createVariable(){
        var base = this;
        if((formTypes[this.data.tipovar]||{radio:false}).radio){
            var opciones:{
                [key:string]:{salto:null|string}
            }={};
            this.childs.forEach(function(child){ 
                opciones[child.data.casillero]={salto:base.myForm.searchCasilleroByIdCasillero(child.data.salto).data.var_name};
            });
            this.myForm.variables[this.var_name]={
                optativa:false,
                salto:this.myForm.searchCasilleroByIdCasillero(this.data.salto).data.var_name,
                saltoNsNr:this.myForm.searchCasilleroByIdCasillero(this.data.salto).data.var_name,
                tipo:formTypes[this.data.tipovar].validar, // numerico, hora
                maximo:null,
                minimo:null,
                opciones:opciones,
                calculada:this.data.despliegue=='calculada',
                subordinadaVar:null,
                subordinadaValor:null
            };
        }
    }
    adaptOptionInput(group:ExtendedHTMLElement){
        var self = this;
        this.myForm.elements[this.data.casillero]=group;
        if(this.data.tipovar){
            this.myForm.controlBox[this.var_name]=group;
        }
        if((formTypes[this.data.tipovar]||{radio:false}).radio){
            var casillerosElement = group.querySelectorAll('.casillero');
            if(casillerosElement.length==0){
                if(!FormManager.controlRepetidos['casillerosElement.length==0']){
                    FormManager.controlRepetidos['casillerosElement.length==0']=true;
                    alertPromise("opciones sin id.casillero para "+this.var_name, {askForNoRepeat:'opciones_sin_id'});
                }
            }
            if(casillerosElement.length>1){
                if(false && !FormManager.controlRepetidos['casillerosElement.length>1']){
                    FormManager.controlRepetidos['casillerosElement.length>1']=true;
                    alertPromise("opciones con muchos id.casillero para "+this.var_name, {askForNoRepeat:'opciones_sin_id'});
                }
            }
            if(casillerosElement.length>0){
                casillerosElement[0].addEventListener('click', function(){
                    miniMenuPromise([
                        {value:'next'  , img:my.path.img+'next.png'  , label:'próxima pregunta', doneFun:function(){
                            self.myForm.irAlSiguiente(self.var_name, true);
                        }},
                        {value:'delete', img:my.path.img+'delete.png', label:'borrar respuesta', doneFun:function(){
                            group.setTypedValue(null, true);
                        }},
                    ],{reject:false, underElement:casillerosElement[0]});
                });
            }
            group.setAttribute('typed-controls-option-group','simple-option');
            var typeInfo = {typeName:'bigint', options:this.childs.map(function(child){
                return {option: Number(child.data.casillero)};
            })};
            TypedControls.adaptElement(group, typeInfo);
            this.connectControl(group);
            this.assignEnterKeyAndUpdateEvents(null, group);
        }
    }    
    get var_name():string{
        if(!this.data.tipovar){
            throw new Error(this.data.tipovar+' no es un tipo');
        }
        return this.data.var_name;
    }
    assignEnterKeyAndUpdateEvents(inputEntereable:HTMLElement, typedControlUpdateable:HTMLElement){
        var self = this;
        var myForm = this.myForm;
        if(inputEntereable!=null){
            inputEntereable.setAttribute('special-enter','true');
            inputEntereable.setAttribute('enter-clicks','true');
            inputEntereable.addEventListener('keypress',function(event){
                var tecla = event.which;
                if(tecla==13 && !event.shiftKey && !event.ctrlKey && !event.altKey){
                    //REVISAR
                    this.dispatchEvent(new Event('update'));
                    setTimeout(function(){
                        myForm.validateDepot();
                        myForm.irAlSiguiente(self.var_name, false);
                    },20);
                }
            },false);
        }
    }
    connectControl(control:ExtendedHTMLElement){
        var myForm = this.myForm;
        if(this.data.despliegue=='calculada'){
            control.disable(true);
        }
        var actualValue=myForm.formData[this.var_name];
        if(actualValue === undefined){
            actualValue=null;
            myForm.formData[this.var_name]=null;
        }
        myForm.controls[this.var_name] = control;
        if(!control.controledType.isValidTypedData(actualValue)){
            actualValue = control.controledType.fromPlainJson(actualValue);
        }
        control.setTypedValue(actualValue);
        control.myForm=myForm;
        control.addEventListener('update', function(var_name){
            return function(){
                var value = this.getTypedValue();
                value = value != null?control.controledType.toPlainJson(value):null;
                myForm.formData[var_name] = value;
                myForm.validateDepot();
                myForm.refreshState();
                myForm.saveSurvey();
                if(myForm.iPosition){
                    var resumenRowElement = document.getElementById('resumen-'+myForm.formId+'-'+myForm.iPosition.toString()+'-'+var_name);
                    if(resumenRowElement){
                        var respuesta: string = '';
                        var infoCasillero = myForm.surveyManager.surveyMetadata.structure[myForm.formId];
                        infoCasillero = myForm.searchInfoCasilleroByVarName(infoCasillero, var_name);
                        if(infoCasillero){
                            respuesta = myForm.searchAnswerForInfoCasillero(infoCasillero, myForm.formData, var_name);
                        }
                        resumenRowElement.textContent=respuesta;
                    }
                }
            }
        }(this.var_name));
    }
    createFormButton(formName:string, buttonDescription:string, myForm:FormManager, rowHijo:any, formAnalysisUnit:string, iPosition:number):HTMLButtonElement{
        var self = this;
        var button = html.button({id:'ver-'+formName+'-'+iPosition, class:'boton-formulario'}, buttonDescription).create();
        button.onclick=function(){
            FormManager.loadForm(formName, rowHijo, formAnalysisUnit, iPosition, myForm, button, self.data.var_name);
        };
        return button;
    }
    createRowView(element:HTMLElement, nombreFormulario:string, row:any, iPosition: number, formAnalysisUnit:string):HTMLElement|null{
        var myForm = this.myForm;
        var cantResumen=this.data.cantidad_resumen;
        var completarTablaResumen = function completarTablaResumen(table: HTMLTableElement, nombreFormulario:string, formData: any, navigationButton: HTMLButtonElement, maxFieldsCount: number, formId: string, iPosition:number){
            if(table){
                var thArray:HTMLTableHeaderCellElement[]=[];
                thArray.push(html.th({class:'col'}, '').create());
                var tdArray:HTMLTableCellElement[]=[];
                tdArray.push(html.td({class:'col'}, [navigationButton]).create());
                
                var aUStructure = myForm.surveyManager.searchUaStructureByFormName(formId);
                aUStructure.preguntas.forEach(function(pregunta) {
                    if(pregunta.es_unidad_analisis){
                        if(mostrarUnidadesAnalisisEnResumen){
                            var buttonsArray:HTMLButtonElement[] = [];
                            if(formData[pregunta.var_name].length){
                                formData[pregunta.var_name].forEach(function(childFormData:any, index:number){
                                    var infoCasillero = myForm.surveyManager.surveyMetadata.structure[aUStructure.id_casillero_formulario];
                                    var formIdForUa = myForm.searchFormIdForUaInForm(infoCasillero, infoCasillero.data.id_casillero, pregunta.var_name)
                                    if(formIdForUa){
                                        var button = html.button({id:'ver-'+formIdForUa+'-'+(index+1).toString(), class:'boton-formulario'}, formIdForUa + ' ' + (index+1)).create();
                                        button.onclick=function(){
                                            FormManager.loadForm(formIdForUa, childFormData, pregunta.var_name, index, myForm, button, self.data.var_name);
                                        };
                                        buttonsArray.push(button);
                                    }else{
                                        throw new Error("Falta BF hacia UA '" + pregunta.var_name + "' dentro de F '"+ infoCasillero.data.casillero + "'");
                                    }
                                })
                            }
                            thArray.push(html.th({class:'col'}, pregunta.var_name).create());
                            tdArray.push(html.td({class:'col'}, buttonsArray).create());
                        }
                    }else{
                        if(thArray.filter(function(th:HTMLTableHeaderCellElement){return th.getAttribute('element-type') === 'question'}).length < maxFieldsCount){
                            var infoCasillero = myForm.surveyManager.surveyMetadata.structure[aUStructure.id_casillero_formulario];
                            var var_name = pregunta.var_name;
                            var infoCasillero = myForm.searchInfoCasilleroByVarName(infoCasillero, var_name);
                            if(infoCasillero){
                                var respuesta = myForm.searchAnswerForInfoCasillero(infoCasillero, formData, var_name);
                                thArray.push(html.th({class:'col', "element-type": "question"}, infoCasillero.data.nombre).create());
                                tdArray.push(html.td({id:'resumen-'+formId+'-'+(iPosition+1).toString()+'-'+var_name, class:'col'}, respuesta).create());
                            }
                        }
                    }
                });
                var tr;
                if(table.children.length === 0){
                    tr = html.tr({class:'row'}, thArray).create();
                    table.appendChild(tr);
                }
                tr = html.tr({class:'row'}, tdArray).create();
                table.appendChild(tr);
                if(!OPEN_IN_OTHER_SCREEN){
                    var auColumns = aUStructure.preguntas.filter(function(pregunta){return pregunta.es_unidad_analisis === true;}).length;
                    var trChild:HTMLTableDataCellElement = html.td({id:'despliegue-formulario-'+nombreFormulario+'-'+(iPosition+1).toString(), colspan:(cantResumen+1+auColumns)}).create();
                    tr = html.tr({class:'row'},[trChild]).create();
                    table.appendChild(tr);
                }
                return table
            }
            return null
        }
        var button = this.createFormButton(nombreFormulario, nombreFormulario + ' ' + (iPosition+1), myForm, row, formAnalysisUnit, iPosition+1);
        if(cantResumen){
            element = completarTablaResumen(element as HTMLTableElement, nombreFormulario, row, button, cantResumen, nombreFormulario, iPosition);
            return element;
        }else{
            var spanChild:HTMLSpanElement = OPEN_IN_OTHER_SCREEN?null:html.span({id:'despliegue-formulario-'+nombreFormulario+'-'+(iPosition+1).toString()},[]).create();
            var span = html.span({id:'despliegue-row-hijo-'+nombreFormulario+'-'+(iPosition+1).toString()},[
                button,
                spanChild,
            ]).create();
            return span
        }
    }
    updateSummary(newRow: any, formAnalysisUnit: string, iPosition: number){
        var myForm = this.myForm;
        var self = this;
        var estructurasAactualizar = myForm.surveyManager.surveyMetadata.analysisUnitStructure.filter(function(auStructure){
            return auStructure.unidad_analisis === formAnalysisUnit;
        });
        estructurasAactualizar.forEach(function(estructuraAactualizar){
            var element = document.getElementById('resumen-'+estructuraAactualizar.id_casillero_formulario);
            self.createRowView(element, estructuraAactualizar.id_casillero_formulario, newRow, iPosition, formAnalysisUnit);
        });
    }
}

export class tipoc_F extends tipoc_Base{
    displayRef(opts:DisplayOpts={}):jsToHtml.ArrayContent{
        var div = html.div({},).create();
        var backButton = this.createBackButton('top');
        backButton?div.appendChild(backButton):null;
        var newButton = this.createNewButton();
        newButton?div.appendChild(newButton):null;
        return Array.prototype.concat.apply(super.displayBottomElement(),[div]);
    };
    createNewButton():HTMLButtonElement|null{
        var myForm = this.myForm;
        var self = this;
        var ultimoFormCargado:LastLoadedForm = JSON.parse(sessionStorage.getItem('ultimo-formulario-cargado'));
        if(ultimoFormCargado && PUEDE_AGREGAR_OTRO_IGUAL){
            var newbutton = html.button({class:'boton-formulario', "enter-clicks":true}, "Crear otro igual").create();
            newbutton.onclick=function(){
                var firstFromStack = myForm.getFirstFromStack();
                //instancio un form manager con el form padre agregarle otra unidad de analisis
                var formManager = new FormManager(myForm.surveyManager, firstFromStack.formId, firstFromStack.formData, myForm.stack);
                if(firstFromStack.varname){
                    formManager.formData[firstFromStack.varname]=null;
                }
                var newRow = formManager.createAndAddAnalysisUnit(ultimoFormCargado.unidadAnalisis);
                var iPosition = formManager.formData[ultimoFormCargado.unidadAnalisis].length-1;
                var pushInNavigationStack = false;
                var varname = myForm.searchCasilleroByIdCasillero(self.data.casillero).data.var_name;
                FormManager.loadForm(ultimoFormCargado.nombreFormulario, newRow,ultimoFormCargado.unidadAnalisis, iPosition+1,  formManager, firstFromStack.callerElement, varname, pushInNavigationStack);
                self.updateSummary(newRow, ultimoFormCargado.unidadAnalisis, iPosition);
            };
            return newbutton;
        }
        return null;
    }
    createBackButton(position:string):HTMLButtonElement|null{
        var myForm = this.myForm;
        if(myForm.stackLength()){
            var firstFromStack = myForm.getFirstFromStack();
            var button = html.button({id:'volver-a-'+firstFromStack.formName+'-'+position+'-from-'+myForm.formId, class:'boton-formulario', "enter-clicks":true}, "Volver al "+ firstFromStack.formName).create();
            button.onclick=function(){
                var mainForm=document.getElementById(myForm.mainFormHTMLId);
                myForm.removeFirstFromStack();
                if(myForm.stackLength()){
                    var ultimoFormularioCargado:LastLoadedForm = {
                        nombreFormulario: firstFromStack.formName,
                        idFormulario: firstFromStack.formId,
                        unidadAnalisis: firstFromStack.analysisUnit
                    }
                    sessionStorage.setItem('ultimo-formulario-cargado', JSON.stringify(ultimoFormularioCargado));
                }else{
                    sessionStorage.removeItem('ultimo-formulario-cargado');
                }
                var formManager = new FormManager(myForm.surveyManager, firstFromStack.formId, firstFromStack.formData, myForm.stack);
                var toDisplay = formManager.display();
                formManager.validateDepot();
                formManager.refreshState();
                mainForm.innerHTML='';
                mainForm.appendChild(toDisplay);
                var operativo = sessionStorage.getItem('operativo');
                var idCaso = sessionStorage.getItem('surveyId');
                var parameters = '&operativo='+operativo+'&idCaso='+idCaso+'&formId='+firstFromStack.formId+'&navigationStack='+JSON.stringify(formManager.getURLNavigationStack())+'&unidadAnalisis='+firstFromStack.analysisUnit+'&iPosition='+firstFromStack.iPosition;
                history.replaceState(null, null, location.origin+location.pathname+my.menuSeparator+'w=loadForm'+parameters);
                SurveyManager.performCustomActionForLoadedFormManager(formManager);
                window.scrollTo(0,firstFromStack.scrollY);
                if(firstFromStack.callerElement){
                    var caller = document.getElementById(firstFromStack.callerElement.id);
                    if(caller){
                        caller.focus();
                    }
                }
            };
            return button;
        }
        return null
    };
    displayBottomElement():jsToHtml.HtmlBase[]{
        var div = html.div({},).create();
        var backButton = this.createBackButton('bottom');
        backButton?div.appendChild(backButton):null;
        var newButton = this.createNewButton();
        newButton?div.appendChild(newButton):null;
        return Array.prototype.concat.apply(super.displayBottomElement(),[div]);
    } 
}

export class tipoc_B extends tipoc_Base{}
export class tipoc_MATRIZ extends tipoc_Base{}
export class tipoc_TEXTO extends tipoc_Base{}
export class tipoc_CONS extends tipoc_Base{}

export class tipoc_P extends tipoc_Base{
    displayTopElements(special=false):any{
        var input = null;
        if(this.myForm.esModoIngreso && this.childs.length && this.childs[0].data.tipoc == 'O'){
            input = this.displayInputForOptions();
        }
        var trOrDiv=html[this.inTable?'tr':'div']({class:"propios"},[].concat(
            this.displayRef(),
            this.displayMainText(),
            input,
            (this.data.tipovar && this.inTable?this.displayInput():null)
        )).create();
        if(this.inTable){
            this.adaptOptionInput(trOrDiv);
        }
        return trOrDiv;
    }
    displayChilds():jsToHtml.ArrayContent{
        return this.childs?[html.table({class:"hijos"},Array.prototype.concat.apply([],this.childs.map(function(child){
            return child.display();
        })))]:[];
    }
    displayBottomElement(){
        return [this.data.salto?html.div({class:"salto"},this.data.salto):null];
    }
}

export class tipoc_PMATRIZ extends tipoc_Base{
    displayChilds(){
        var nextColumn=2;
        var foundedColumns:{
            [key:string]:any
        }={};
        var foundedColumnsArray=[html.td(),html.td()];
        var dataRow=this.childs.map(function(opcion){
            var actualRow=html.tr([
                html.td({class:'casillero'} ,opcion.data.casillero),
                html.td({class:'nombre'}    ,opcion.data.nombre),
            ]).create();
            opcion.childs.forEach(function(pregunta){
                var actualPos;
                var attrs:ExtendedHtmlAttrs={class:'pmatriz_titulo_columna', "casillero-id":pregunta.data.padre + '/' + pregunta.data.casillero};
                if(!foundedColumns[pregunta.data.nombre]){
                    foundedColumns[pregunta.data.nombre]={
                        ubicacion:nextColumn,
                        html:html.td(attrs as jsToHtml.Attr4HTMLElement, pregunta.data.nombre)
                    };
                    foundedColumnsArray.push(foundedColumns[pregunta.data.nombre].html);
                    nextColumn++;
                }
                actualPos=foundedColumns[pregunta.data.nombre].ubicacion;
                while(actualRow.cells.length<=actualPos){
                    actualRow.insertCell(-1); 
                }
                actualRow.cells[actualPos].className='pmatriz_variable';
                actualRow.cells[actualPos].appendChild(pregunta.displayInput(true));
            });
            return actualRow;
        });
        dataRow.unshift(html.tr(foundedColumnsArray).create());
        return [html.table(dataRow)];
    }
}

export class tipoc_O extends tipoc_Base{
    display(special=false){
        return [this.displayTopElements(special)].concat(
            Array.prototype.concat.apply([],this.childs.map(function(child){
                child.inTable=true;
                return child.display(special);
            }))
        );
    }
    displayTopElements(special=false):any{
        var content=[].concat(
            html.td({class:'casillero'},this.displayRef({forValue:this.data.casillero})),
            html.td([html.input({type:'radio', value:this.data.casillero,tabindex:'-1'})]),
            html.td({class:'nombre'},this.displayMainText({forValue:this.data.casillero})),
            (this.data.salto?html.td({class:"salto"},this.data.salto):null)
        );
        if(special){
            return {tds:content};
        }
        var tr = html.tr({id:this.data.id_casillero, class:"tipoc_O"},content).create();
        this.myForm.elementsByIdCasillero[this.data.id_casillero]=tr;
        return tr;
    }
}

export class tipoc_OM extends tipoc_Base{
    display(){
        var input = null;
        if(this.myForm.esModoIngreso){
            input = this.displayInputForOptions();
        }
        this.createVariable();
        var trOM=html.tr({id:this.data.id_casillero, class:"tipoc_OM"},[].concat(
            html.td({class:'casillero'},this.displayRef()),
            html.td({class:'vacio'}),
            html.td({class:'nombre'},this.displayMainText())
        ).concat(
            input,
            Array.prototype.concat.apply([],this.childs.map(function(child:tipoc_O){
                return child.display(true)[0].tds;
            }))
        )).create();
        this.adaptOptionInput(trOM);
        var element = [trOM].concat(
            Array.prototype.concat.apply([],this.childs.map(function(child){
                child.inTable=true;
                return child.display(true).slice(1);
            }))
        );
        this.myForm.elementsByIdCasillero[this.data.id_casillero]=trOM;
        return element
    }
    displayChilds(){
        return this.childs?[html.table({class:"hijos"},Array.prototype.concat.apply([],this.childs.map(function(child){
            return child.display();
        })))]:[];
    }
}

export class tipoc_BF extends tipoc_Base{
    adaptOptionInput(groupElement:ExtendedHTMLElement){
        var formAnalysisUnit=this.data.unidad_analisis;
        var PuedeAgregarRenglones=PUEDE_AGREGAR_RENGLONES;
        var openInOtherScreen=OPEN_IN_OTHER_SCREEN;
        var cantResumen=this.data.cantidad_resumen;
        var nombreFormulario=this.data.casillero;
        var myForm=this.myForm;
        var self = this;
        var despliegueDiv = html.div({id:'despliegue-rows-'+nombreFormulario},[]).create();
        groupElement.appendChild(despliegueDiv);
        var ua = myForm.surveyManager.searchUaStructureByFormName(nombreFormulario);
        var uaPadre = myForm.surveyManager.searchUaStructureByFormId(myForm.formId).unidad_analisis;
        if(!formAnalysisUnit){
            if(ua && ua.unidad_analisis_padre === uaPadre){
                formAnalysisUnit = ua.unidad_analisis;
                mostrarUnidadesAnalisisEnResumen = false;
            }
        }
        if(myForm.formData[formAnalysisUnit]){
            var htmlElement: HTMLElement = null;
            if(cantResumen){
                var table = html.table({id:'resumen-'+nombreFormulario, class:'resumen'}).create();
                groupElement.appendChild(table);
                htmlElement = table;
            }
            myForm.formData[formAnalysisUnit].forEach(function(rowHijo:any, iPosition:number){
                var element = self.createRowView(htmlElement, nombreFormulario, rowHijo, iPosition, formAnalysisUnit);
                if(element){
                    groupElement.appendChild(element);
                }
            });
            if(!openInOtherScreen && mostrarUnidadesAnalisisEnResumen && cantResumen){
                var trChild:HTMLTableDataCellElement = html.td({id:'despliegue-formulario-'+nombreFormulario+'-ua-children', colspan:(cantResumen+1)}).create();
                var tr = html.tr({class:'row'},[trChild]).create();
                table.appendChild(tr);
            }
            if(PuedeAgregarRenglones){
                var newButton = html.button({id:'boton-nuevo-'+nombreFormulario, class:'boton-nuevo-formulario', "enter-clicks":true}, "Nuevo " + nombreFormulario).create();
                var self = this;
                newButton.onclick=function(){
                    var newRow = myForm.createAndAddAnalysisUnit(formAnalysisUnit);
                    var control = myForm.controls[self.data.var_name];
                    if(control){
                        control.setTypedValue(null, true);
                    }
                    var iPosition = myForm.formData[formAnalysisUnit].length-1;
                    self.createRowView(document.getElementById('resumen-'+nombreFormulario), nombreFormulario, newRow, iPosition, formAnalysisUnit);
                    self.updateSummary(newRow, formAnalysisUnit, iPosition);
                    FormManager.loadForm(nombreFormulario, myForm.formData[formAnalysisUnit][iPosition],formAnalysisUnit, iPosition+1,  myForm, newButton, self.data.var_name);
                }
                var readybutton = html.button({class:'boton-listo-formulario'}, "Listo ").create();
                readybutton.onclick=function(){
                    if(!openInOtherScreen){
                        myForm.clearAllOpenForms(nombreFormulario,formAnalysisUnit);
                    }
                    var control = myForm.controls[self.data.var_name];
                    if(control){
                        control.setTypedValue(1, true);
                    }
                }
                var div = html.div({id:'boton-listo-'+nombreFormulario, class:'nuevo-formulario'}, [newButton, readybutton]).create();
                groupElement.appendChild(div);
            }
        }else{
            if(ua && ua.unidad_analisis === uaPadre){
                groupElement.appendChild(this.createFormButton(nombreFormulario, nombreFormulario, myForm, myForm.formData, null, null));
            }else{
                throw new Error('Casillero BF mal definido en ' + this.data.padre);
            }
        }
        myForm.formsButtonZone[this.data.casillero]=groupElement;
    }
    displayInput(){
        var span = super.displayInput();
        if(span){
            span.setAttribute('hide-input','true');
        }
        return span
    }
}

export type SurveyData=any;
export type FormData=any;
export type SurveyId=any;

export class SurveyManager{
    constructor(public surveyMetadata:SurveyMetadata, public surveyId:SurveyId, public surveyData:SurveyData){
    }
    static performCustomActionForNewFormManager(formManager:FormManager){
        //Implementar en appFinal
    }
    static performCustomActionForLoadedFormManager(formManager:FormManager){
        //Implementar en appFinal
    }
    async displayMainForm():Promise<FormManager>{
        return new FormManager(this, this.surveyMetadata.mainForm, this.surveyData, []);
    }
    get surveyStructure(){
        return this.surveyMetadata.structure;
    }
    async saveSurvey():Promise<void>{
        localStorage.setItem(
            this.surveyMetadata.operative +'_survey_'+this.surveyId, 
            JSON.stringify(this.surveyData)
        );
        return;
    }
    searchUaStructureByUa(ua:string):analysisUnitStructure|undefined{
        return this.surveyMetadata.analysisUnitStructure.find(function(au){
            return au.unidad_analisis === ua;
        })
    }
    searchUaStructureByFormId(formId:string):analysisUnitStructure|undefined{
        return this.surveyMetadata.analysisUnitStructure.find(function(au){
            return au.id_casillero_formulario === formId;
        })
    }
    searchUaStructureByFormName(formName:string):analysisUnitStructure|undefined{
        return this.surveyMetadata.analysisUnitStructure.find(function(au){
            return au.casillero_formulario === formName;
        })
    }
}

export class FormManager{
    static controlRepetidos:{[key:string]:any}={};
    content:tipoc_Base; // el elemento raíz
    variables:{[key:string]:Variable}={}
    controls:{[key:string]:ExtendedHTMLElement}={}
    elements:{[key:string]:ExtendedHTMLElement}={}
    elementsByIdCasillero:{[key:string]:ExtendedHTMLElement}={}
    controlBox:{[key:string]:ExtendedHTMLElement}={}
    esModoIngreso: boolean=true
    formsButtonZone:{[key:string]:ExtendedHTMLElement}={}
    state:FormStructureState={}
    mainFormHTMLId = 'main-form'; //Quitar generalizacion
    iPosition:number=1
    
    static loadForm(targetFormName: string, targetFormData: any, targetAnalysisUnit:string, targetIPosition:number, sourceFormManager:FormManager, callerButton:HTMLButtonElement, sourceListoVarname:string, pushInNavigationStack: boolean= true){
        var mostrarUnidadesAnalisisEnResumen=true;
        var formDisplayElement;
        var aUStructure = sourceFormManager.surveyManager.searchUaStructureByFormName(targetFormName);
        var ultimoFormularioCargado:LastLoadedForm = {
            nombreFormulario: targetFormName,
            idFormulario: aUStructure.id_casillero_formulario,
            unidadAnalisis: targetAnalysisUnit
        }
        if(OPEN_IN_OTHER_SCREEN){
            var searchResult:analysisUnitStructure = sourceFormManager.surveyManager.searchUaStructureByFormId(sourceFormManager.formId);
            var formName = searchResult.casillero_formulario;
            var analysisUnit = searchResult.unidad_analisis;
            if(pushInNavigationStack){
                sourceFormManager.addToStack({formData:sourceFormManager.formData,formName:formName, formId:sourceFormManager.formId, analysisUnit: analysisUnit, iPosition: targetIPosition, scrollY:window.scrollY, callerElement:callerButton, varname:sourceListoVarname});
            }
            formDisplayElement=document.getElementById(sourceFormManager.mainFormHTMLId);
            var operativo = sessionStorage.getItem('operativo');
            var idCaso = sessionStorage.getItem('surveyId');
            var parameters = '&operativo='+operativo+'&idCaso='+idCaso+'&formId='+aUStructure.id_casillero_formulario+'&navigationStack='+JSON.stringify(sourceFormManager.getURLNavigationStack())+'&unidadAnalisis='+targetAnalysisUnit+'&iPosition='+targetIPosition;
            history.replaceState(null, null, location.origin+location.pathname+my.menuSeparator+'w=loadForm'+parameters);
            window.scrollTo(0,0);
        }else{
            this.clearAllOpenForms(targetFormName, targetAnalysisUnit);
            formDisplayElement = document.getElementById('despliegue-formulario-'+targetFormName+'-'+(targetIPosition).toString());
            if(!formDisplayElement && mostrarUnidadesAnalisisEnResumen){
                formDisplayElement = document.getElementById('despliegue-formulario-'+targetFormName+'-ua-children');
            }
        }
        sessionStorage.setItem('ultimo-formulario-cargado', JSON.stringify(ultimoFormularioCargado));
        var formManager = new FormManager(sourceFormManager.surveyManager, aUStructure.id_casillero_formulario, targetFormData, sourceFormManager.stack);
        formManager.iPosition=targetIPosition
        var toDisplay = formManager.display();
        formManager.validateDepot();
        formManager.refreshState();
        formDisplayElement.innerHTML='';
        formDisplayElement.appendChild(toDisplay);
        formManager.irAlSiguienteDespliegue(formManager.state.primeraVacia);
        SurveyManager.performCustomActionForLoadedFormManager(formManager);
    }
    constructor (public surveyManager:SurveyManager, public formId:string, public formData:FormData, public stack:NavigationStack[]){
        this.content = this.newInstance(surveyManager.surveyStructure[formId]);
        this.adaptStructure();
        SurveyManager.performCustomActionForNewFormManager(this);
    }
    adaptStructure():void{}
    get factory():{[key:string]:typeof tipoc_Base}{
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
        }
    }
    newInstance(infoCasillero:InfoCasillero):tipoc_Base{
        let myForm:FormManager=this;
        if(!this.factory[infoCasillero.data.tipoc]){
            throw new Error("No existe el tipo de casillero "+infoCasillero.data.tipoc);
        }
        return new this.factory[infoCasillero.data.tipoc](infoCasillero, myForm);
        //newStructure.myForm=myForm;
        //return newStructure;
    }
    getFirstFromStack(){
        return this.stack[0];
    }
    getURLNavigationStack():URLNavigationStack[]{
        return this.stack.map(function(element){
            return {
                formName: element.formName,
                formId: element.formId,
                analysisUnit: element.analysisUnit,
                iPosition: element.iPosition,
                scrollY: element.scrollY,
                varname: element.varname
            }
        })
    }
    addToStack(navigationStack:NavigationStack){
        this.stack = [navigationStack].concat(this.stack);
    }
    removeFirstFromStack(){
        this.stack = this.stack.slice(1);
    }
    stackLength(){
        return this.stack.length;
    }
    display(){
        if(this.stackLength()==0){
            sessionStorage.removeItem('ultimo-formulario-cargado');
        }
        return html.div({class:'form-content'}, this.content.display()).create()
    }
    clearAllOpenForms(nombreFormulario:string, formAnalysisUnit:string){
        var myForm = this;
        myForm.formData[formAnalysisUnit].forEach(function(rowHijo:any, iPosition:number){
            var element = document.getElementById('despliegue-formulario-'+nombreFormulario+'-'+(iPosition+1).toString());
            if(element){
                element.innerHTML='';
            }
        });
    }
    createAndAddAnalysisUnit(analysisUnit:string):any{
        var myForm = this;
        var aUStructure =  myForm.surveyManager.searchUaStructureByUa(analysisUnit);
        var newRow:any = {};
        aUStructure.preguntas.forEach(function(pregunta){
            newRow[pregunta.var_name] = pregunta.es_unidad_analisis?[]:null;
        });
        myForm.formData[analysisUnit].push(newRow);
        myForm.saveSurvey();
        return newRow;
    }
    infoCasilleroVacio():InfoCasillero{
        return {data:{salto:null}}
    }
    searchCasilleroByIdCasillero(id_casillero:string|null, insider?:boolean, infoCasillero?: InfoCasillero): InfoCasillero{
        infoCasillero = insider?infoCasillero:this.surveyManager.surveyMetadata.structure[this.formId];
        if(!infoCasillero || !id_casillero){
            return this.infoCasilleroVacio();
        }
        for(var i = 0; i < infoCasillero.childs.length; i++) {
            if (typeof infoCasillero.childs[i] !== "function"){
                var aux = infoCasillero.childs[i].data.id_casillero;
                if (aux && (id_casillero === aux || id_casillero === aux.toUpperCase())) {
                    return infoCasillero.childs[i];
                }
            }
            var result = this.searchCasilleroByIdCasillero(id_casillero, true, infoCasillero.childs[i]);
            if(result.data.id_casillero){
                return result;
            }
        }
        return this.infoCasilleroVacio();
    }
    searchInfoCasilleroByVarName(infoCasillero: InfoCasillero, var_name:string): InfoCasillero|null{
        for(var i = 0; i < infoCasillero.childs.length; i++) {
            if (typeof infoCasillero.childs[i] !== "function"){
                var aux = infoCasillero.childs[i].data.var_name;
                if (aux && (var_name === aux || var_name === aux.toUpperCase())) {
                    return infoCasillero.childs[i];
                }
            }
            var result = this.searchInfoCasilleroByVarName(infoCasillero.childs[i], var_name);
            if(result){
                return result;
            }
        }
        return null
    }
    searchAnswerForInfoCasillero(infoCasillero:InfoCasillero, formData:any, var_name:string):string{
        var respuesta:string;
        if(infoCasillero.childs.length){
            var result = infoCasillero.childs.find(function(option){
                var aux:string = (formData[var_name] || '').toString();
                return option.data.casillero === aux || option.data.casillero === aux.toUpperCase();
            });
            respuesta = result?result.data.nombre:'';
        }else{
            respuesta = formData[var_name]?formData[var_name]:null;
            if(respuesta !== null || respuesta !== undefined){
                var typeInfo = formTypes[infoCasillero.data.tipovar];
                var typedValue = respuesta?TypeStore.typerFrom(typeInfo).fromPlainJson(respuesta):null;
                respuesta = typedValue?TypeStore.typerFrom(typeInfo).toLocalString(typedValue):null;
            }
        }
        return respuesta;
    }
    //COMPLETAR
    searchFormIdForUaInForm(infoCasillero:InfoCasillero, formId:string, analysisUnit:string):string|null{
        for(var i = 0; i < infoCasillero.childs.length; i++) {
            if (typeof infoCasillero.childs[i] !== "function"){
                var data = infoCasillero.childs[i].data;
                if(data.tipoc === 'BF' && data.ultimo_ancestro === formId){
                    var ua:string|null = null; 
                    if(data.unidad_analisis){
                        ua = data.unidad_analisis;
                    }else{
                        var formUA = this.surveyManager.surveyMetadata.structure[data.id_casillero].data.unidad_analisis;
                        if(formUA === analysisUnit){
                            ua=analysisUnit;
                        }else{
                            throw new Error("Error con la UA '"+ analysisUnit +"' en formulario '" + formId +"'");
                        }
                    }
                    if(ua === analysisUnit) {
                        return data.casillero;
                    }
                }
            }
            var result = this.searchFormIdForUaInForm(infoCasillero.childs[i], formId, analysisUnit);
            if(result){
                return result;
            }
        }
        return null
    }
    saveSurvey():Promise<void>{
        return this.surveyManager.saveSurvey();
    }
    completeCalculatedVars(){
        return;
    }
    validateDepot(){
        this.completeCalculatedVars();
        var estructura={variables:this.variables};
        var formData=this.formData;
        var rta:FormStructureState={estados:{}, siguientes:{}, actual:null, primeraFalla:null};
        var variableAnterior=null;
        var yaPasoLaActual=false;
        var enSaltoAVariable=null; // null si no estoy saltando y el destino del salto si estoy dentro de un salto. 
        var conOmitida=false;
        var miVariable:string|null=null; // variable actual del ciclo
        var falla=function(estado:string){
            rta.estados[miVariable]=estado;
            if(!rta.primeraFalla){
                rta.primeraFalla=miVariable;
            }
        };
        for(var miVariable in estructura.variables){
            let apagada:boolean=false;
            var revisar_saltos_especiales= false;
            var valor=formData[miVariable];
            if(conOmitida){
                falla('fuera_de_flujo_por_omitida');
            }else if(enSaltoAVariable && miVariable!=enSaltoAVariable){
                apagada=true;
                // estoy dentro de un salto válido, no debería haber datos ingresados.
                if(valor===null){
                    rta.estados[miVariable]='salteada';
                }else{
                    falla('fuera_de_flujo_por_salto');
                }
            }else if(yaPasoLaActual){
                if(valor===null){
                    rta.estados[miVariable]='todavia_no';
                }else{
                    conOmitida=true;
                    if(!rta.primeraFalla){
                        rta.primeraFalla=rta.actual;
                    }
                    falla('fuera_de_flujo_por_omitida');
                }
            }else if(estructura.variables[miVariable].subordinadaVar!=null 
                && formData[estructura.variables[miVariable].subordinadaVar]!=estructura.variables[miVariable].subordinadaValor
            ){
                apagada=true;
                if(valor===null){
                    rta.estados[miVariable]='salteada';
                }else{
                    falla('fuera_de_flujo_por_salto');
                }
            }else{
                // no estoy en una variable salteada y estoy dentro del flujo normal (no hubo omitidas hasta ahora). 
                enSaltoAVariable=null; // si estaba en un salto acá se acaba
                if(estructura.variables[miVariable].calculada){
                    apagada=true;
                    rta.estados[miVariable]='calculada';
                }else if(valor===null){
                    if(!rta.primeraVacia){
                        rta.primeraVacia=miVariable;
                    }
                    if(!estructura.variables[miVariable].optativa){
                        rta.estados[miVariable]='actual';
                        rta.actual=miVariable;
                        yaPasoLaActual=miVariable!==null;
                    }else{
                        rta.estados[miVariable]='optativa_sd';
                        if(estructura.variables[miVariable].salto){
                            enSaltoAVariable=estructura.variables[miVariable].salto;
                        }
                    }
                }else if(valor==-9){
                    rta.estados[miVariable]='valida';
                    if(estructura.variables[miVariable].saltoNsNr){
                        enSaltoAVariable=estructura.variables[miVariable].saltoNsNr;
                    }
                    revisar_saltos_especiales=true;
                }else{
                    // hay algo ingresado hay que validarlo
                    if(estructura.variables[miVariable].tipo=='opciones'){
                        if(estructura.variables[miVariable].opciones[valor]){
                            rta.estados[miVariable]='valida'; 
                            if(estructura.variables[miVariable].opciones[valor].salto){
                                enSaltoAVariable=estructura.variables[miVariable].opciones[valor].salto;
                            }
                        }else{
                            falla('invalida'); 
                        }
                    }else if(estructura.variables[miVariable].tipo=='numerico'){
                        valor=Number(valor);
                        if(estructura.variables[miVariable].maximo && valor > estructura.variables[miVariable].maximo
                            || 'minimo' in estructura.variables[miVariable] && valor < estructura.variables[miVariable].minimo){
                            falla('fuera_de_rango'); 
                        }else{
                            rta.estados[miVariable]='valida'; 
                        }
                    }else{
                        // las de texto o de ingreso libre son válidas si no se invalidaron antes por problemas de flujo
                        rta.estados[miVariable]='valida'; 
                    }
                    if(estructura.variables[miVariable].salto){
                        enSaltoAVariable=estructura.variables[miVariable].salto;
                    }
                    revisar_saltos_especiales=true;
                }
                if (revisar_saltos_especiales){
                }    
            }
            if(rta.estados[miVariable]==null){
                throw ('No se pudo validar la variable '+miVariable);
            }
            if(!apagada){
                if(variableAnterior && !rta.siguientes[variableAnterior]){
                    rta.siguientes[variableAnterior]=miVariable;
                }
                variableAnterior=miVariable;
            }
            rta.siguientes[miVariable]=enSaltoAVariable; // es null si no hay salto (o sea sigue con la próxima o es la última)
        }
        if(conOmitida){
            for(miVariable in rta.estados){
                if(rta.estados[miVariable]=='actual'){
                    rta.estados[miVariable]='omitida';
                }else if(rta.estados[miVariable]=='todavia_no'){
                    rta.estados[miVariable]='fuera_de_flujo_por_omitida';
                }else if(rta.estados[miVariable]=='fuera_de_flujo_por_omitida'){
                    break;
                }
            }
        }
        this.state = rta;
        this.consistencias();
    }
    consistencias(){
    }
    refreshState(){
        var rta = this.state;
        var myForm = this;
        likeAr(rta.estados).forEach(function(estado, variable){
            if(myForm.controlBox[variable]){
                myForm.controlBox[variable].setAttribute('state-var','ok');
                if(estado){
                    myForm.controlBox[variable].setAttribute('state-var',estado);
                }
            }
        });
    }
    posicionarVentanaVerticalmente(control:HTMLElement, y:number){
        var rect=my.getRect(control);
        if(rect.top){
            window.scrollTo(0,rect.top-y);
        }
        return rect.top;
    }

    irAlSiguiente(variableActual: string, scrollScreen:boolean){
        var control;
        if(globalSaltosABotones[variableActual] && (
            globalSaltosABotones[variableActual][this.formData[variableActual]] ||
            globalSaltosABotones[variableActual].siempre
        )){
            var id=globalSaltosABotones[variableActual][this.formData[variableActual]] ||
            globalSaltosABotones[variableActual].siempre;
            control=document.getElementById(id);
        }else{
            var nuevaVariable=this.state.siguientes[variableActual];
            control=this.controls[nuevaVariable];
        }
        if(control){
            if(scrollScreen){
                this.posicionarVentanaVerticalmente(control,100);
            }
            control.focus();
        }
    }
    irAlSiguienteDespliegue(primeraVariable, elementToFocusIfNotActual?:ExtendedHTMLElement){
        var actual = primeraVariable;
        if(actual){
            var controles = this.controls;
            var formManager = this;
            var tieneSiguienteObligatoriaVacia = function tieneSiguienteObligatoriaVacia(variable:string, controles:ExtendedHTMLElement[]){
                var seguir =true;
                while(formManager.state.siguientes[variable] && seguir){
                    var variable=formManager.state.siguientes[variable];
                    var control=controles[variable];
                    if(formManager.variables[variable] && !formManager.variables[variable].optativa && !control.getTypedValue()){
                        seguir = false;
                    }
                }
                return !seguir;
            }
            var todasLasVariablesVacias = function todasLasVariablesVacias(variable:string, controles:ExtendedHTMLElement[]){
                var seguir =true;
                while(formManager.state.siguientes[variable] && seguir){
                    var variable=formManager.state.siguientes[variable];
                    var control=controles[variable];
                    if(formManager.variables[variable] && control.getTypedValue()){
                        seguir = false;
                    }
                }
                return seguir;
            }
            var control=formManager.controls[actual];
            if(todasLasVariablesVacias(actual, controles) || !formManager.variables[actual].optativa && !control.getTypedValue()){ 
                var focusElement;
                focusElement = controles[actual];
                if(focusElement){
                    focusElement.focus();
                    this.posicionarVentanaVerticalmente(focusElement,100);
                }
            }else{
                if(formManager.variables[actual].optativa && !tieneSiguienteObligatoriaVacia(actual, controles)){
                    if(elementToFocusIfNotActual){
                        focusElement = elementToFocusIfNotActual;
                        if(focusElement){
                            focusElement.focus();
                            this.posicionarVentanaVerticalmente(focusElement,100);
                        }
                    }
                }else{
                    this.irAlSiguienteDespliegue(this.state.siguientes[actual],elementToFocusIfNotActual);
                }
            }
        }
    }
    completarHora(value:any){
        return value //TODO
    }
}