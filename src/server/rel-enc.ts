"use strict";

import * as operativos from "operativos";
export * from "operativos";
export type Constructor<T> = new(...args: any[]) => T;

export function emergeAppRelEnc<T extends Constructor<operativos.AppOperativosType>>(Base:T){
    return class AppRelEnc extends Base{
        constructor(...args:any[]){ 
            super(args);    
        }
        clientIncludes(req:Request, hideBEPlusInclusions:boolean){
            return super.clientIncludes(req, hideBEPlusInclusions).concat([
                {type:'js', module: 'rel-enc', modPath: '../client', file: 'form-structure.js', path: 'client_modules'}
            ]);
        }
    }
}

export var AppRelEnc = emergeAppRelEnc(operativos.emergeAppOperativos(operativos.AppBackend));
export type AppRelEncType = InstanceType<typeof AppRelEnc>;