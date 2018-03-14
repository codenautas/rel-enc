declare module 'backend-plus'{
    class AppBackend{
        start()
        getTables():string[]
    }
}

declare module 'js-to-html'{
    interface TypedElement{
        disable(disabled:boolean)
        setTypedValue(any:any, originatedFromUserInteraction?:boolean)
        getTypedValue():any
    }
    interface ExtendedHTMLElement              extends HTMLElement              ,TypedElement{}
    interface ExtendedHTMLButtonElement        extends HTMLButtonElement        ,TypedElement{}
    interface ExtendedHTMLTableElement         extends HTMLTableElement         ,TypedElement{}
    interface ExtendedHTMLTableRowElement      extends HTMLTableRowElement      ,TypedElement{}
    interface ExtendedHTMLTableDataCellElement extends HTMLTableDataCellElement ,TypedElement{}
    var html:{
        td: (attrOrContent?:object|any[]|string, content?:any[]|string ) => {
            create():ExtendedHTMLTableDataCellElement
        }
        tr: (attrOrContent?:object|any[]|string, content?:any[]|string ) => {
            create():ExtendedHTMLTableRowElement
        }
        table: (attrOrContent?:object|any[]|string, content?:any[]|string ) => {
            create():ExtendedHTMLTableElement
        }
        button: (attrOrContent?:object|any[]|string, content?:any[]|string ) => {
            create():ExtendedHTMLButtonElement
        }
        [key:string]: (attrOrContent?:object|any[]|string, content?:any[]|string ) => {
            create():ExtendedHTMLElement
        },
    }
    type HtmlAttrs={
        colspan?:number,
    }
}
