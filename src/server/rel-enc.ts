"use strict";
import * as operativos from "operativos";
import { Request, OptsClientPage } from "operativos";
export * from "./types-rel-enc";
export type Constructor<T> = new(...args: any[]) => T;
import {changing} from "best-globals";
import * as serveContent from "serve-content";
import * as Path from "path";

export function emergeAppRelEnc<T extends Constructor<operativos.AppOperativosType>>(Base:T){
    return class AppRelEnc extends Base{
        constructor(...args:any[]){ 
            super(args);    
        }
        clientIncludes(req:Request, hideBEPlusInclusions:OptsClientPage){
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                {type:'js', module: 'rel-enc', modPath: '../client', file: 'form-structure.js', path: 'client_modules'},
                { type: 'css', module:'rel-enc',  modPath: '../client/css', file: 'formularios.css', path:'rel-enc' },
                { type: 'css', module:'rel-enc',  modPath: '../client/css', file: 'estados.css', path:'rel-enc' },
                { type: 'css', module:'rel-enc',  modPath: '../client/css', file: 'my-things2.css', path:'rel-enc' }
            ]);
        }
        //REVISAR, a lo mejor se puede poner en backend-plus
        addLoggedServices(){
            var be = this;
            super.addLoggedServices();
            var optsGenericForImg=changing(be.optsGenericForAll,{
                allowedExts:be.exts.img,
            });
            be.app.use('/img',serveContent(Path.join(__dirname,'../client/img'), optsGenericForImg));
        }
    }
}

export var AppRelEnc = emergeAppRelEnc(operativos.emergeAppOperativos(operativos.AppBackend));
export type AppRelEncType = InstanceType<typeof AppRelEnc>;