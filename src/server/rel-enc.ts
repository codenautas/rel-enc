import * as backendPlus from "backend-plus";

export class AppRelEnc extends backendPlus.AppBackend{
    getTables(){
        return super.getTables().concat([
            'usuarios',
        ]);
    }
}