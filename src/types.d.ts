declare module 'backend-plus'{
    class AppBackend{
        start()
        getTables():string[]
    }
}

declare module 'js-to-html'{
    interface ExtendedHTMLElement extends HTMLElement{
        disable(disabled:boolean)
        setTypedValue(any:any, originatedFromUserInteraction?:boolean)
        getTypedValue():any
    }
    var html:{[key:string]: (attrOrContent:object|any[]|string, content?:any[]|string ) => {
        create():ExtendedHTMLElement
    }}
    type HtmlAttrs={
        colspan?:number,
    }
}
