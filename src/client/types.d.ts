
declare module "typed-controls" {
    function adaptElement(control:HTMLElement, typeInfo:any):void
}

declare module "dialog-promise" {
    function alertPromise(message:string, opts?:DialogOptions):Promise<void>

    function miniMenuPromise(listOptions:{value:any, label:string, img?:string, doneFun?:()=>void}[], opts?:DialogOptions):Promise<any>

    type DialogOptions = {
        askForNoRepeat?:string
        reject?:boolean
        underElement?:Element
    }
}

declare module "myOwn"{
    var my:any;
    var myOwn:any;
}