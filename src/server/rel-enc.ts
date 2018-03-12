import * as backendPlus from "backend-plus";

var x =  new backendPlus.AppBackend();

export class AppRelEnc extends backendPlus.AppBackend{
    getTables(){
        return super.getTables().concat([
            'usuarios',
        ]);
    }
}