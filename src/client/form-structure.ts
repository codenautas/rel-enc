"use strict";

import {html,HtmlAttrs} from "js-to-html"
import * as jsToHtml from "js-to-html"
import * as TypedControls from "typed-controls"
import {alertPromise, miniMenuPromise} from "dialog-promise"
import {my} from "my-things"

var formTypes={
    si_no_nn: {htmlType:'number', typeName:'bigint' , validar:'opciones', radio:true},
    si_no   : {htmlType:'number', typeName:'bigint' , validar:'opciones', radio:true},
    numero  : {htmlType:'number', typeName:'bigint' , validar:'numerico',           },
    opciones: {htmlType:'number', typeName:'bigint' , validar:'opciones', radio:true},
    texto   : {htmlType:'text'  , typeName:'text'   , validar:'texto'   ,           },
};

interface ExtendedHTMLElement extends jsToHtml.ExtendedHTMLElement{
    myForm?:FormStructure
}

type InfoCasilleroRegistro={
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
}

type InfoCasillero={
    data:InfoCasilleroRegistro,
    childs:InfoCasillero[]
}

type DisplayOpts={
    forValue?:any
}

type SurveyStructure={
    [key:string]:InfoCasillero
}

class tipoc_Base{ // clase base de los tipos de casilleros
    childs:tipoc_Base[]=[]
    data:InfoCasilleroRegistro
    inTable:boolean=false
    constructor(infoCasillero:InfoCasillero, public myForm:FormStructure){
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
    displayRef(opts:DisplayOpts={}):any[]{
        var opts = opts || {};
        var hasValue=this.data.ver_id!='-';
        var attr={class:hasValue?"casillero":"vacio"};
        if(opts.forValue){
            attr["for-value"]=opts.forValue;
        }
        return [html[opts.forValue?'label':(this.inTable?'td':'span')](attr,
            hasValue?this.data.ver_id||this.data.casillero:null
        )];
    }
    displayInput(direct=false){
        var attr:HtmlAttrs;
        if(this.inTable){
            attr.colspan=90;
        }
        if(!formTypes[this.data.tipovar]){
            throw new Error(this.data.tipovar+' no existe como tipo');
        }
        if(formTypes[this.data.tipovar].radio){
            return;
        }
        var control:ExtendedHTMLElement = html.input({
            "tipo-var":this.data.tipovar||'unknown', 
            "longitud-var":this.data.longitud||'unknown',
            "type":formTypes[this.data.tipovar].htmlType,
        }).create();
        TypedControls.adaptElement(control,formTypes[this.data.tipovar]);
        this.assignEnterKey(control);
        this.myForm.variables[this.var_name]={
            optativa:this.data.optativo || /_esp/.test(this.var_name),
            salto:(this.data.salto||'').toLowerCase(),
            saltoNsNr:null && this.data.salto,
            tipo:formTypes[this.data.tipovar].validar, // numerico, hora
            maximo:null,
            minimo:null,
            calculada:this.data.despliegue=='calculada'
        };
        this.connectControl(control);
        if(direct){
            return control;
        }
        return html[this.inTable?'td':'span'](attr,[control]).create();
    }
    displayMainText(opts:DisplayOpts={}){
        var attr={class:"nombre"};
        if(opts.forValue){
            attr["for-value"]=opts.forValue;
        }
        return [
            html[opts.forValue?'label':(this.inTable?'td':'span')](attr, [
                this.data.nombre,
                (this.data.tipoe?html.span({class:"tipoe"}, this.data.tipoe):null),
                (this.data.aclaracion?html.span({class:"aclaracion"}, this.data.aclaracion):null),
            ]),
            this.data.tipovar && !this.inTable?this.displayInput():null
        ]
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
        }
        if(formTypes[this.data.tipovar].htmlType == 'number'){
            inputAttr["min"]='1';
            inputAttr["max"]=this.childs.length.toString();
        }
        var input = html.input(inputAttr).create();
        this.assignEnterKey(input);
        // TypedControls.adaptElement(input,formTypes[this.data.tipovar]);
        return input;
    }
    displayChilds(){
        return html.div({class:"hijos"},[].concat(this.childs.map(function(child){
            return child.display();
        })));
    }
    displayBottomElement(){
        return [];
    } 
    display(special=false){
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
        return groupElement;
    }       
    createVariable(){
        if((formTypes[this.data.tipovar]||{}).radio){
            var opciones={};
            this.childs.forEach(function(child){
                opciones[child.data.casillero]={salto:(child.data.salto||'').toLowerCase(),};
            });
            this.myForm.variables[this.var_name]={
                optativa:false,
                salto:(this.data.salto||'').toLowerCase(),
                saltoNsNr:null && this.data.salto,
                tipo:formTypes[this.data.tipovar].validar, // numerico, hora
                maximo:null,
                minimo:null,
                opciones:opciones,
                calculada:this.data.despliegue=='calculada'
            };
        }
    }
    adaptOptionInput(group:ExtendedHTMLElement){
        var self = this;
        this.myForm.elements[this.data.casillero]=group;
        if(this.data.tipovar){
            this.myForm.controlBox[this.var_name]=group;
        }
        if((formTypes[this.data.tipovar]||{}).radio){
            var casillerosElement = group.querySelectorAll('.casillero');
            if(casillerosElement.length==0){
                if(!FormStructure.controlRepetidos['casillerosElement.length==0']){
                    FormStructure.controlRepetidos['casillerosElement.length==0']=true;
                    alertPromise("opciones sin id.casillero para "+this.var_name, {askForNoRepeat:'opciones_sin_id'});
                }
            }
            if(casillerosElement.length>1){
                if(false && !FormStructure.controlRepetidos['casillerosElement.length>1']){
                    FormStructure.controlRepetidos['casillerosElement.length>1']=true;
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
        }
    }    
    get var_name():string{
        if(!this.data.tipovar){
            throw new Error(this.data.tipovar+' no es un tipo');
        }
        if(this.data.tipoc=='OM'){
            return this.data.id_casillero.replace(/\//g,'_').toLowerCase()
        }
        return this.data.casillero.toLowerCase();
    }
    assignEnterKey(input:HTMLElement){
        var self = this;
        var myForm = this.myForm;
        input.setAttribute('special-enter','true');
        input.setAttribute('enter-clicks','true');
        input.addEventListener('keypress',function(event){
            var tecla = event.which;
            if(tecla==13 && !event.shiftKey && !event.ctrlKey && !event.altKey){
                myForm.irAlSiguiente(self.var_name, false);
                event.preventDefault();
            }
        });
    }
    connectControl(control:ExtendedHTMLElement){
        if(this.data.despliegue=='calculada'){
            control.disable(true);
        }
        if(this.myForm.depot){
            var actualValue=this.myForm.depot.row[this.var_name];
            if(actualValue === undefined){
                actualValue=null;
                this.myForm.depot.row[this.var_name]=null;
            }
            this.myForm.controls[this.var_name] = control;
            control.setTypedValue(actualValue);
            control.myForm=this.myForm;
            control.addEventListener('update', function(var_name){
                return function(){
                    var value = this.getTypedValue();
                    this.myForm.depot.row[var_name] = value;
                    this.myForm.validateDepot();
                    this.myForm.refreshState();
                    this.myForm.saveDepot();
                }
            }(this.var_name));
        }
    }
}

type Variable={

}

class FormStructure{
    static controlRepetidos:{[key:string]:any}={};
    content:tipoc_Base; // el elemento raíz
    variables:{[key:string]:Variable}={}
    controls:{[key:string]:ExtendedHTMLElement}={}
    elements:{[key:string]:ExtendedHTMLElement}={}
    controlBox:{[key:string]:ExtendedHTMLElement}={}
    back:{
        formId?: string,
        row?: any[]
        pilaDeRetroceso:{
            UAdelForm:string
            iPosicional:number
        }[]
    }={
        pilaDeRetroceso:[]
    }
    depot:{
        row:any[]
        surveyContent:any
        idCaso:string
    }
    surveyStructure: SurveyStructure
    esModoIngreso: boolean=true
    constructor (formStructureInfo:InfoCasillero){
        this.content = this.newInstance(formStructureInfo);
        /*
        this.controlBox={};
        this.formsButtonZone={};
        this.elements={};
        this.showShadow=true;
        this.back=false;
        this.formStructure = formStructure;
        */
    }
    get factory(){
        return {
            Base:tipoc_Base,
            F:tipoc_F,
            B:tipoc_B,
            TEXTO:tipoc_TEXTO,
            MATRIZ:tipoc_MATRIZ,
            CONS: tipoc_CONS,
            PMATRIZ: tipoc_PMATRIZ,
            P: tipoc_P,
            O:tipoc_O,
            OM: tipoc_OM
        }
    }
    newInstance(infoCasillero:InfoCasillero):tipoc_Base{
        let myForm=this;
        if(!this.factory[infoCasillero.data.tipoc]){
            throw new Error("No existe el tipo de casillero "+infoCasillero.data.tipoc);
        }
        var newStructure = new this.factory[infoCasillero.data.tipoc]();
        newStructure.myForm=myForm;
        return newStructure;
    }
    display(){
        return this.content.display();
    }
    irAlSiguiente(var_name:string, scrollScreen:boolean){

    }
    JsonConcatPath(object1,object2,UAPath){
        var JsonConcat = function(object1,object2,UAnalisis,posicion){
            var isArray = function(value) {
                return Object.prototype.toString.call(value) === '[object Array]';
            }
            var isObject = function(value) {
                return Object.prototype.toString.call(value) === '[object Object]';
            }
            var result = {};
            for (var key in object1) {
                if (key == UAnalisis && object1.hasOwnProperty(key)) {
                    if (isArray(object1[key])) {
                        result[key] = [];
                        for (var i in object1[key]) {
                            if(isObject(object1[key][i])){
                                if (i == posicion){
                                    result[key].push(object2)
                                }else{
                                    result[key].push(object1[key][i])
                                }
                            }
                        } 
                    }     
                /*else if (isObject(object1[key])) {
                    result[key] = {};
                    for (var key_inner in object1[key]) {
                        if (object1[key].hasOwnProperty(key_inner) && key_inner == UAnalisis) {
                            result[key][key_inner] =  object2[key][key_inner];
                        }
                    }
                } else {
                    result[key] = object1[key];
                }*/
                }else if (object1.hasOwnProperty(key)){
                    result[key] = object1[key];
                }
            }
            return result;
        }
        var UAPathLast = UAPath.slice(UAPath.length-1);
        var object1Porcion = object1;
        for (var keyUA=0; keyUA<UAPath.length-1; keyUA++){
            var UAnalisis = UAPath[keyUA][0];
            var posicion = UAPath[keyUA][1];
            object1Porcion = object1Porcion[UAnalisis][posicion];
        };
        var resultParcial = JsonConcat(object1Porcion,object2,UAPathLast[0][0],UAPathLast[0][1]);
        var UAPathFirst = UAPath.slice(0,UAPath.length-1);
        if(UAPathFirst.length>0){
            return this.JsonConcatPath(object1,resultParcial,UAPathFirst);
        }else{
            return resultParcial;
        }
    }
    saveDepot(){
        if(this.depot){
            var path = []
            var datosCaso = this.depot.surveyContent.datosCaso;
            var id = this.depot.surveyContent.id;
            var datosCasoParcial = datosCaso;
            if(this.back.pilaDeRetroceso.length){
                for(var i= this.back.pilaDeRetroceso.length -1; i>= 0;i--){
                    path.push([this.back.pilaDeRetroceso[i].UAdelForm, this.back.pilaDeRetroceso[i].iPosicional]);
                }
                datosCaso = this.JsonConcatPath(datosCaso,this.depot.row,path);
            }else{
                datosCaso = this.depot.row;
            }
            var operativo = sessionStorage.getItem('operativo');
            localStorage.setItem(operativo +'_survey_'+id, JSON.stringify({id:id, datosCaso:datosCaso}));
        }
        return true;
    }
}

class tipoc_F extends tipoc_Base{
    displayRef(opts:DisplayOpts={}):any[]{
        var myForm = this.myForm;
        if(myForm.back.pilaDeRetroceso.length){
            var button = html.button({class:'boton-formulario'}, "Volver al "+myForm.back.formId).create();
            button.onclick=function(){
                var mainForm=document.getElementById('main-form');
                mainForm.innerHTML='';
                mainForm.appendChild(my.displayForm(myForm.surveyStructure,myForm.back.row,myForm.back.formId,myForm.back.pilaDeRetroceso.slice(1)));
                window.scrollTo(0,0);
            };
        }
        return this.displayRef().concat(button);
    };
}

class tipoc_B extends tipoc_Base{}
class tipoc_MATRIZ extends tipoc_Base{}
class tipoc_TEXTO extends tipoc_Base{}
class tipoc_CONS extends tipoc_Base{}

class tipoc_P extends tipoc_Base{
    displayTopElements(special=false){
        var input = null;
        if(this.myForm.esModoIngreso && this.childs.length && this.childs[0].data.tipoc == 'O'){
            input = this.displayInputForOptions();
        }
        return html[this.inTable?'tr':'div']({class:"propios"},[].concat(
            this.displayRef(),
            this.displayMainText(),
            input,
            (this.data.tipovar && this.inTable?this.displayInput():null)
        ));
    }
    displayChilds(){
        return [this.childs?html.table({class:"hijos"},Array.prototype.concat.apply([],this.childs.map(function(child){
            return child.display();
        }))):null];
    }
    displayBottomElement(){
        return [this.data.salto?html.div({class:"salto"},this.data.salto):null];
    }
}

class tipoc_PMATRIZ extends tipoc_Base{
    displayChilds(){
        var nextColumn=2;
        var foundedColumns={};
        var foundedColumnsArray=[html.td(),html.td()];
        var dataRow=this.childs.map(function(opcion){
            var actualRow=html.tr([
                html.td({class:'casillero'} ,opcion.data.casillero),
                html.td({class:'nombre'}    ,opcion.data.nombre),
            ]).create();
            opcion.childs.forEach(function(pregunta){
                var actualPos;
                if(!foundedColumns[pregunta.data.nombre]){
                    foundedColumns[pregunta.data.nombre]={
                        ubicacion:nextColumn,
                        html:html.td({class:'pmatriz_titulo_columna', "casillero-id":pregunta.data.padre + '/' + pregunta.data.casillero}, pregunta.data.nombre)
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

class tipoc_O extends tipoc_Base{
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

class tipoc_OM extends tipoc_Base{
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
            Array.prototype.concat.apply([],this.childs.map(function(child){
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
        return [this.childs?html.table({class:"hijos"},Array.prototype.concat.apply([],this.childs.map(function(child){
            return child.display();
        }))):null];
    }
}
FormStructure.prototype.completeCalculatedVars=function(){
    var row=this.depot.row;
    var controls=this.controls;
    var calculatedVars=[];
    return;
    if(this.depot.formId=='F1'){

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
    },this)
}

FormStructure.prototype.validateDepot=function(){
    this.completeCalculatedVars();
    var estructura={variables:this.variables};
    var depot=this.depot;
    var rta={estados:{}, siguientes:{}, actual:null, primeraFalla:null};
    var variableAnterior=null;
    var yaPasoLaActual=false;
    var estadoAnterior=null;
    var enSaltoAVariable=null; // null si no estoy saltando y el destino del salto si estoy dentro de un salto. 
    var conOmitida=false;
    var miVariable=null; // variable actual del ciclo
    var falla=function(estado){
        rta.estados[miVariable]=estado;
        if(!rta.primeraFalla){
            rta.primeraFalla=miVariable;
        }
    };
    for(var miVariable in estructura.variables){
        var revisar_saltos_especiales= false;
        var valor=depot.row[miVariable];
        if(conOmitida){
            falla('fuera_de_flujo_por_omitida');
        }else if(enSaltoAVariable && miVariable!=enSaltoAVariable){
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
        }else{
            // no estoy en una variable salteada y estoy dentro del flujo normal (no hubo omitidas hasta ahora). 
            enSaltoAVariable=null; // si estaba en un salto acá se acaba
            if(estructura.variables[miVariable].calculada){
                rta.estados[miVariable]='calculada';
            }else if(valor===null){
                if(!estructura.variables[miVariable].optativa){
                    rta.estados[miVariable]='actual';
                    rta.actual=miVariable;
                    yaPasoLaActual=miVariable;
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
                    valor=completarHora(valor);
                    depot.row[miVariable]=valor;
                    var v1_item=document.getElementById('var_'+miVariable);
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
            this.lanzarExcepcion('No se pudo validar la variable '+miVariable);
        }
        if(!estructura.variables[miVariable].calculada){
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

FormStructure.prototype.consistencias=function(){
    var row=this.depot.row;
    var myForm=this;
    function consistir(consistencia, ultima_variable, precondicion, postcondicion){
        myForm.elements[consistencia].setAttribute(
            'status-consistencia',
            !precondicion() || postcondicion()?'consistente':'inconsistente'
        );
        // this.state.estados[ultima_variable]='inconsistente';
    }
    return;
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
    }
}

FormStructure.prototype.refreshState = function refreshState(){
    var rta = this.state;
    var myForm = this;
    likeAr(rta.estados).forEach(function(estado, variable){
        if(myForm.controlBox[variable]){
            myForm.controlBox[variable].setAttribute('state-var','ok');
            if(rta.estados[variable]){
                myForm.controlBox[variable].setAttribute('state-var',rta.estados[variable]);
            }
        }
    });
};
FormStructure.prototype.posicionarVentanaVerticalmente = function(control, y){
    var rect=getRect(control);
    if(rect.top){
        window.scrollTo(0,rect.top-y);
    }
    return rect.top;
};

FormStructure.prototype.irAlSiguiente=function(variableActual, scrollScreen){
    var nuevaVariable=this.state.siguientes[variableActual];
    var control=this.controls[nuevaVariable];
    if(scrollScreen){
        this.posicionarVentanaVerticalmente(control,100);
    }
    control.focus();
}

FormStructure.factory.BF = function tipoc_BF(){
    FormStructure.factory.Base.call(this);
}
FormStructure.factory.BF.prototype = Object.create(FormStructure.factory.Base.prototype);
FormStructure.factory.BF.constructor = FormStructure.factory.BF;

FormStructure.factory.BF.prototype.adaptOptionInput = function adaptOptionInput(groupElement){
    //groupElement.style='border:1px solid red; height:200px; width:400px;';
    var UAdelForm=this.data.unidad_analisis;
    var PuedeAgregarRenglones=true;
    var conResumen=this.data.con_resumen;
    var nombreFormulario=this.data.casillero;
    var myForm=this.myForm;
    var createFormButton = function createFormButton(formName, buttonDescription, myForm, rowHijo, UAdelForm, iPosicional){
        var button = html.button({class:'boton-formulario'}, buttonDescription).create();
        button.onclick=function(){
            loadForm(formName, rowHijo, UAdelForm, iPosicional);
        };
        return button;
    }
    var loadForm = function loadForm(formName, rowHijo, UAdelForm, iPosicional){
        var mainForm=document.getElementById('main-form');
        mainForm.innerHTML='';
        mainForm.appendChild(my.displayForm(myForm.surveyStructure,rowHijo,formName,
            [
                {datosCasoPadreParaRetroceder:myForm.depot.row,formIdParaRetroceder:myForm.depot.formId, UAdelForm: UAdelForm, iPosicional: iPosicional}
            ].concat(myForm.back?myForm.back.pilaDeRetroceso:[])
        ));
        window.scrollTo(0,0);
    }
    var completarTablaResumen = function completarTablaResumen(table, rowHijo, navigationButton){
        var thArray = [];
        thArray.push(html.th({class:'col'}, '').create());
        var tdArray = [];
        tdArray.push(html.td({class:'col'}, navigationButton).create());
        var searchStructureByUAInOtherStructure = function searchStructureByUAInOtherStructure(mainStructure, UA){
            return Object.values(mainStructure).find(function (structure){
                return structure.data.unidad_analisis === UA;
            });
        }
        Object.keys(rowHijo).forEach(function(key) {
            if(Array.isArray(rowHijo[key])){
                var buttonsArray = [];
                if(rowHijo[key].length){
                    rowHijo[key].forEach(function(child, index){
                        var structure = searchStructureByUAInOtherStructure(myForm.surveyStructure, key)
                        var button = html.button({class:'boton-formulario'}, structure.data.casillero + ' ' + (index+1)).create();
                        button.onclick=function(){
                            loadForm(structure.data.casillero, rowHijo[key][index], key, index);
                        };
                        buttonsArray.push(button);
                    })
                    thArray.push(html.th({class:'col'}, key).create());
                }
                tdArray.push(html.td({class:'col'}, buttonsArray).create());
            }else{
                var structure = searchStructureByUAInOtherStructure(myForm.surveyStructure, UAdelForm);
                var id_casillero = key.toString();
                var buscarCasilleroEnEstructura = function buscarCasilleroEnEstructura(structure, id_casillero){
                    for(var i = 0; i < structure.childs.length; i++) {
                        if (typeof structure.childs[i] !== "function"){
                            var casillero = structure.childs[i].data.id_casillero;
                            if (casillero === id_casillero || casillero === id_casillero.toUpperCase()) {
                                return structure.childs[i];
                            }
                        }
                        var result = buscarCasilleroEnEstructura(structure.childs[i], id_casillero);
                        if(result){
                            return result;
                        }
                    }
                }
                var val = buscarCasilleroEnEstructura(structure, id_casillero);
                if(val.childs.length){
                    var result = val.childs.find(function(option){
                        var casillero = (rowHijo[key] || '').toString();
                        return option.data.casillero ===  casillero || option.data.casillero === casillero.toUpperCase();
                    });
                    var respuesta = result?result.data.nombre:'';
                }else{
                    var respuesta = rowHijo[key]?rowHijo[key]:'';
                }
                var pregunta = val.data.nombre;
                thArray.push(html.th({class:'col'}, pregunta).create());
                tdArray.push(html.td({class:'col'}, respuesta).create());
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
    if(myForm.depot.row[UAdelForm]){
        if(PuedeAgregarRenglones){
            var button = html.button({class:'boton-nuevo-formulario'}, "Nuevo " + nombreFormulario).create();
            var div = html.div({class:'nuevo-formulario'}, button).create();
            groupElement.appendChild(div);
            button.onclick=function(){
                my.ajax.cargar.preguntas_ua({operativo: sessionStorage.getItem('operativo'), unidad_analisis: UAdelForm}).then(function(result){
                    var object = {};
                    result.forEach(function(question){
                        object[question.id_casillero] = question.unidad_analisis?[]:null;
                    });
                    myForm.depot.row[UAdelForm].push(object);
                    myForm.saveDepot();
                    var iPosicional = myForm.depot.row[UAdelForm].length-1;
                    loadForm(nombreFormulario, myForm.depot.row[UAdelForm][iPosicional], UAdelForm, iPosicional);
                }).catch(function(error){ 
                    console.log("error: ", error);
                });
            }
        }
        if(conResumen){
            var table = html.table({class:'resumen'}).create();
        }
        myForm.depot.row[UAdelForm].forEach(function(rowHijo, iPosicional){
            var button = createFormButton(nombreFormulario, nombreFormulario + ' ' + (iPosicional+1), myForm, rowHijo, UAdelForm, iPosicional);
            if(conResumen){
                table = completarTablaResumen(table, rowHijo, button);
            }else{
                groupElement.appendChild(button);
            }
        });
        if(conResumen){
            groupElement.appendChild(table);
        }
    }else{ 
        groupElement.appendChild(createFormButton(nombreFormulario, nombreFormulario, myForm, myForm.depot.row, null, null));
    }
    myForm.formsButtonZone[this.data.casillero]=groupElement;
};

