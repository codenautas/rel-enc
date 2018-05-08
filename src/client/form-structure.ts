"use strict";

import * as jsToHtml from "js-to-html"
import {html} from "js-to-html"
import * as likeAr from "like-ar"
import * as TypedControls from "typed-controls"
import "dialog-promise"

import * as my from "myOwn";

type HtmlAttrs={
    class?:string,
    colspan?:number
};

interface ExtendedHtmlAttrs extends HtmlAttrs{
    "for-value"?:string,
    "tipo-var"?:string,
    "longitud-var"?:string,
    "casillero-id"?:string,
};

export var formTypes:{
    [key:string]:{htmlType:'text'|'number'  , typeName:'bigint'|'text', validar:'texto'|'opciones'|'numerico', radio?:boolean}
}={
    si_no_nn: {htmlType:'number', typeName:'bigint' , validar:'opciones', radio:true},
    si_no   : {htmlType:'number', typeName:'bigint' , validar:'opciones', radio:true},
    numero  : {htmlType:'number', typeName:'bigint' , validar:'numerico',           },
    opciones: {htmlType:'number', typeName:'bigint' , validar:'opciones', radio:true},
    texto   : {htmlType:'text'  , typeName:'text'   , validar:'texto'   ,           },
    
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
    ver_id:string
    casillero:string
    tipovar:string
    longitud:number
    optativo:boolean
    salto:string
    despliegue:string
    nombre:string
    tipoe:string
    aclaracion:string
    padre:string
    unidad_analisis: string
    cantidad_resumen: number
    var_name: string
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
    salto:string
    saltoNsNr:string
    opciones?:{
        [key:string]:{
            salto:string
        }
    }
    tipo:string
    maximo:string
    minimo:string
    subordinadaVar:string
    subordinadaValor:any
}

export type NavigationStack = {
    formData: any
    formId: string
    analysisUnit:string
    iPosition:number
    scrollY: number
}

export type FormStructureState = {
    estados?:{[key:string]:string}
    siguientes?:any
    actual?:any
    primeraFalla?:any
};

export type analysisUnitStructure = {
    unidad_analisis: string
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
    data:InfoCasilleroRegistro
    inTable:boolean=false
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
        this.childs = childsInfo.map(function(childInfo){
            return this.myForm.newInstance(childInfo);
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
            optativa:this.data.optativo || /_esp/.test(this.var_name),
            salto:(this.data.salto||'').toLowerCase(),
            saltoNsNr:null && this.data.salto,
            tipo:formTypes[this.data.tipovar].validar, // numerico, hora
            maximo:null,
            minimo:null,
            calculada:this.data.despliegue=='calculada',
            subordinadaVar:null,
            subordinadaValor:null
        };
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
        var inputAttr:jsToHtml.Attr4HTMLInputElement={
            class:'typed-control-input-for-options',
            "type":formTypes[this.data.tipovar].htmlType,
            "enter-clicks":"internal"
        }
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
        var groupElement = html.div({class:'tipoc_'+this.data.tipoc},content).create();
        this.adaptOptionInput(groupElement);
        return [groupElement];
    }       
    createVariable(){
        if((formTypes[this.data.tipovar]||{radio:false}).radio){
            var opciones:{
                [key:string]:{salto:null|string}
            }={};
            this.childs.forEach(function(child){ opciones[child.data.casillero]={salto:(child.data.salto||'').toLowerCase()};});
            this.myForm.variables[this.var_name]={
                optativa:false,
                salto:(this.data.salto||'').toLowerCase(),
                saltoNsNr:null && this.data.salto,
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
                    myForm.irAlSiguiente(self.var_name, false);
                    event.preventDefault();
                }
            },false);
        }
        if(typedControlUpdateable!=null){
            typedControlUpdateable.addEventListener('update',function(event){
                myForm.irAlSiguiente(self.var_name, false);
            });
        }
    }
    connectControl(control:ExtendedHTMLElement){
        if(this.data.despliegue=='calculada'){
            control.disable(true);
        }
        var actualValue=this.myForm.formData[this.var_name];
        if(actualValue === undefined){
            actualValue=null;
            this.myForm.formData[this.var_name]=null;
        }
        this.myForm.controls[this.var_name] = control;
        control.setTypedValue(actualValue);
        control.myForm=this.myForm;
        control.addEventListener('update', function(var_name){
            return function(){
                var value = this.getTypedValue();
                this.myForm.formData[var_name] = value;
                this.myForm.validateDepot();
                this.myForm.refreshState();
                this.myForm.saveSurvey();
            }
        }(this.var_name));
    }
}

export class tipoc_F extends tipoc_Base{
    displayRef(opts:DisplayOpts={}):jsToHtml.ArrayContent{
        var button = this.createBackButton();
        return Array.prototype.concat.apply(super.displayRef(),button);
    };

    createBackButton():HTMLButtonElement[]{
        var myForm = this.myForm;
        if(myForm.stackLength()){
            var firstFromStack = myForm.getFirstFromStack();
            var button = html.button({class:'boton-formulario'}, "Volver al "+ firstFromStack.formId).create();
            button.onclick=function(){
                var mainForm=document.getElementById(myForm.mainFormHTMLId);
                myForm.removeFirstFromStack();
                var formManager = new FormManager(myForm.surveyManager, firstFromStack.formId, firstFromStack.formData, myForm.stack);
                var toDisplay = formManager.display();
                formManager.validateDepot();
                formManager.refreshState();
                mainForm.innerHTML='';
                mainForm.appendChild(toDisplay);
                window.scrollTo(0,firstFromStack.scrollY);
                
            };
            return [button];
        }
        return [];
    };

    displayBottomElement():jsToHtml.HtmlBase[]{
        var button = this.createBackButton();
        return Array.prototype.concat.apply(super.displayBottomElement(),[html.div({},button).create()]);
    } 
}

export class tipoc_B extends tipoc_Base{}
export class tipoc_MATRIZ extends tipoc_Base{}
export class tipoc_TEXTO extends tipoc_Base{}
export class tipoc_CONS extends tipoc_Base{}

export class tipoc_P extends tipoc_Base{
    displayTopElements(special=false){
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
        return html.tr({class:"tipoc_O"},content);
    }
}

export class tipoc_OM extends tipoc_Base{
    display(){
        var input = null;
        if(this.myForm.esModoIngreso){
            input = this.displayInputForOptions();
        }
        this.createVariable();
        var trOM=html.tr({class:"tipoc_OM"},[].concat(
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
        return [trOM].concat(
            Array.prototype.concat.apply([],this.childs.map(function(child){
                child.inTable=true;
                return child.display(true).slice(1);
            }))
        );
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
        var PuedeAgregarRenglones=true;
        var cantResumen=this.data.cantidad_resumen;
        var nombreFormulario=this.data.casillero;
        var myForm=this.myForm;
        var loadForm = function loadForm(formId: string, formData: any, formAnalysisUnit:string, iPosition:number, myForm:FormManager){
            myForm.addToStack({formData:myForm.formData,formId:myForm.formId, analysisUnit: formAnalysisUnit, iPosition: iPosition, scrollY:window.scrollY})
            var mainForm=document.getElementById(myForm.mainFormHTMLId);
            var formManager = new FormManager(myForm.surveyManager, formId, formData, myForm.stack);
            formManager.iPosition=iPosition
            var toDisplay = formManager.display();
            formManager.validateDepot();
            formManager.refreshState();
            mainForm.innerHTML='';
            mainForm.appendChild(toDisplay);
            window.scrollTo(0,0);
        }
        var createFormButton = function createFormButton(formName:string, buttonDescription:string, myForm:FormManager, rowHijo:any, formAnalysisUnit:string, iPosition:number):HTMLButtonElement{
            var button = html.button({class:'boton-formulario'}, buttonDescription).create();
            button.onclick=function(){
                loadForm(formName, rowHijo, formAnalysisUnit, iPosition, myForm);
            };
            return button;
        }
        var completarTablaResumen = function completarTablaResumen(table: HTMLTableElement, formData: any, navigationButton: HTMLButtonElement, maxFieldsCount: integer){
            var thArray:HTMLTableHeaderCellElement[]=[];
            thArray.push(html.th({class:'col'}, '').create());
            var tdArray:HTMLTableCellElement[]=[];
            tdArray.push(html.td({class:'col'}, [navigationButton]).create());
            var searchInfoCasilleroByUAInStructure = function searchInfoCasilleroByUAInStructure(mainStructure: SurveyStructure, UA:string):InfoCasillero{
                return Object.values(mainStructure).find(function (infoCasillero){
                    return infoCasillero.data.unidad_analisis === UA;
                });
            }
            Object.keys(formData).forEach(function(key) {
                if(Array.isArray(formData[key])){
                    var buttonsArray:HTMLButtonElement[] = [];
                    if(formData[key].length){
                        formData[key].forEach(function(childFormData:any, index:number){
                            var infoCasillero = searchInfoCasilleroByUAInStructure(myForm.surveyManager.surveyMetadata.structure, key)
                            var button = html.button({class:'boton-formulario'}, infoCasillero.data.casillero + ' ' + (index+1)).create();
                            button.onclick=function(){
                                loadForm(infoCasillero.data.casillero, childFormData, formAnalysisUnit, index, myForm);
                            };
                            buttonsArray.push(button);
                        })
                    }
                    thArray.push(html.th({class:'col'}, key).create());
                    tdArray.push(html.td({class:'col'}, buttonsArray).create());
                }else{
                    if(thArray.filter(function(th:HTMLTableHeaderCellElement){return th.getAttribute('element-type') === 'question'}).length < maxFieldsCount){
                        var infoCasillero = searchInfoCasilleroByUAInStructure(myForm.surveyManager.surveyMetadata.structure, formAnalysisUnit);
                        var var_name = key.toString();
                        var searchInfoCasilleroByVarName = function searchInfoCasilleroByVarName(infoCasillero: InfoCasillero, var_name:string): InfoCasillero{
                            for(var i = 0; i < infoCasillero.childs.length; i++) {
                                if (typeof infoCasillero.childs[i] !== "function"){
                                    var aux = infoCasillero.childs[i].data.var_name;
                                    if (aux && (var_name === aux || var_name === aux.toUpperCase())) {
                                        return infoCasillero.childs[i];
                                    }
                                }
                                var result = searchInfoCasilleroByVarName(infoCasillero.childs[i], var_name);
                                if(result){
                                    return result;
                                }
                            }
                            return null
                        }
                        var infoCasillero = searchInfoCasilleroByVarName(infoCasillero, var_name);
                        var respuesta:string;
                        if(infoCasillero.childs.length){
                            var result = infoCasillero.childs.find(function(option){
                                var var_name:string = (formData[key] || '').toString();
                                return option.data.casillero === var_name || option.data.casillero === var_name.toUpperCase();
                            });
                            respuesta = result?result.data.nombre:'';
                        }else{
                            respuesta = formData[key]?formData[key].toString():'';
                        }
                        var pregunta = infoCasillero.data.nombre;
                        thArray.push(html.th({class:'col', "element-type": "question"}, pregunta).create());
                        tdArray.push(html.td({class:'col'}, respuesta).create());
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
            return table
        }
        if(myForm.formData[formAnalysisUnit]){
            if(cantResumen){
                var table = html.table({class:'resumen'}).create();
            }
            myForm.formData[formAnalysisUnit].forEach(function(rowHijo:any, iPosition:number){
                var button = createFormButton(nombreFormulario, nombreFormulario + ' ' + (iPosition+1), myForm, rowHijo, formAnalysisUnit, iPosition+1);
                if(cantResumen){
                    table = completarTablaResumen(table, rowHijo, button, cantResumen);
                }else{
                    groupElement.appendChild(button);
                }
            });
            if(cantResumen){
                groupElement.appendChild(table);
            }
            if(PuedeAgregarRenglones){
                var button = html.button({class:'boton-nuevo-formulario'}, "Nuevo " + nombreFormulario).create();
                var div = html.div({class:'nuevo-formulario'}, [button]).create();
                groupElement.appendChild(div);
                button.onclick=function(){
                    var aUStructures = myForm.surveyManager.surveyMetadata.analysisUnitStructure;
                    var aUStructure = aUStructures.find(function(au){
                        return au.unidad_analisis === formAnalysisUnit;
                    })
                    var newRow:any = {};
                    aUStructure.preguntas.forEach(function(pregunta){
                        newRow[pregunta.var_name] = pregunta.es_unidad_analisis?[]:null;
                    });
                    myForm.formData[formAnalysisUnit].push(newRow);
                    myForm.saveSurvey();
                    var iPosition = myForm.formData[formAnalysisUnit].length-1;
                    loadForm(nombreFormulario, myForm.formData[formAnalysisUnit][iPosition],formAnalysisUnit, iPosition+1,  myForm);
                }
            }
        }else{ 
            groupElement.appendChild(createFormButton(nombreFormulario, nombreFormulario, myForm, myForm.formData, null, null));
        }
        myForm.formsButtonZone[this.data.casillero]=groupElement;
    }    
}

export type SurveyData=any;
export type FormData=any;
export type SurveyId=any;

export class SurveyManager{
    constructor(public surveyMetadata:SurveyMetadata, public surveyId:SurveyId, public surveyData:SurveyData){
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
}

export class FormManager{
    static controlRepetidos:{[key:string]:any}={};
    content:tipoc_Base; // el elemento raíz
    variables:{[key:string]:Variable}={}
    controls:{[key:string]:ExtendedHTMLElement}={}
    elements:{[key:string]:ExtendedHTMLElement}={}
    controlBox:{[key:string]:ExtendedHTMLElement}={}
    esModoIngreso: boolean=true
    formsButtonZone:{[key:string]:ExtendedHTMLElement}={}
    state:FormStructureState={}
    mainFormHTMLId = 'main-form'; //Quitar generalizacion
    iPosition:number=1
    constructor (public surveyManager:SurveyManager, public formId:string, public formData:FormData, public stack:NavigationStack[]){
        this.content = this.newInstance(surveyManager.surveyStructure[formId]);
        this.adaptStructure();
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
        return html.div({class:'form-content'}, this.content.display()).create()
    }

    saveSurvey():Promise<void>{
        return this.surveyManager.saveSurvey();
    }
    completeCalculatedVars(){
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
    validateDepot(){
        this.completeCalculatedVars();
        var estructura={variables:this.variables};
        var formData=this.formData;
        var rta:FormStructureState={estados:{}, siguientes:{}, actual:null, primeraFalla:null};
        var variableAnterior=null;
        var yaPasoLaActual=false;
        var enSaltoAVariable=null; // null si no estoy saltando y el destino del salto si estoy dentro de un salto. 
        var conOmitida=false;
        var miVariable:string=null; // variable actual del ciclo
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
                rta.estados[miVariable]='salteada';
            }else{
                // no estoy en una variable salteada y estoy dentro del flujo normal (no hubo omitidas hasta ahora). 
                enSaltoAVariable=null; // si estaba en un salto acá se acaba
                if(estructura.variables[miVariable].calculada){
                    apagada=true;
                    rta.estados[miVariable]='calculada';
                }else if(valor===null){
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
                    }else if(estructura.variables[miVariable].tipo=='hora'){
                        valor=this.completarHora(valor);
                        formData[miVariable]=valor;
                        var v1_item=document.getElementById('var_'+miVariable) as HTMLInputElement;
                        if(v1_item!=null){
                            v1_item.value=valor;
                        }
                        if(!(/^(1[3-9]|2[0-2])(:[0-5][0-9])?$/.test(valor))){
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
        var nuevaVariable=this.state.siguientes[variableActual];
        var control=this.controls[nuevaVariable];
        if(scrollScreen){
            this.posicionarVentanaVerticalmente(control,100);
        }
        control.focus();
    }
    completarHora(value:any){
        return value //TODO
    }
}
