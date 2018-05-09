"use strict";
//GENERALIZAR (sacar de BBDD desde meta-enc)
export var formTypes:{
    [key:string]:{htmlType:'text'|'number'  , typeName:'bigint'|'text'|'decimal', validar:'texto'|'opciones'|'numerico', radio?:boolean}
}={
    si_no_nn: {htmlType:'number', typeName:'bigint'   , validar:'opciones', radio:true},
    si_no   : {htmlType:'number', typeName:'bigint'   , validar:'opciones', radio:true},
    numero  : {htmlType:'number', typeName:'bigint'   , validar:'numerico',           },
    decimal : {htmlType:'number', typeName:'decimal'  , validar:'numerico',           },
    opciones: {htmlType:'number', typeName:'bigint'   , validar:'opciones', radio:true},
    texto   : {htmlType:'text'  , typeName:'text'     , validar:'texto'   ,           },
    fecha   : {htmlType:'text'  , typeName:'date'     , validar:'texto'   ,           },
    hora    : {htmlType:'text'  , typeName:'interval' , validar:'texto'   ,           },
};