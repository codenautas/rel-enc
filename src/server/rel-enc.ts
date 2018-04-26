import * as backendPlus from "backend-plus";

export * from "../client/form-types";

var x =  new backendPlus.AppBackend();

export class AppRelEnc extends backendPlus.AppBackend{
    getTables(){
        return super.getTables().concat([
            'usuarios',
        ]);
    }
}