import * as jsToHtml from "js-to-html";
export interface ExtendedHTMLElement extends HTMLElement {
    myForm?: FormStructure;
    getTypedValue?: () => any;
    setTypedValue?: (value: any, fromUserInteraction?: boolean) => void;
    disable?: (disabled?: boolean) => void;
}
export declare type InfoCasilleroRegistro = {
    tipoc: string;
    id_casillero: string;
    ver_id: string;
    casillero: string;
    tipovar: string;
    longitud: number;
    optativo: boolean;
    salto: string;
    despliegue: string;
    nombre: string;
    tipoe: string;
    aclaracion: string;
    padre: string;
    unidad_analisis: string;
    con_resumen: boolean;
};
export declare type InfoCasillero = {
    data: InfoCasilleroRegistro;
    childs: InfoCasillero[];
};
export declare type DisplayOpts = {
    forValue?: any;
};
export declare type SurveyStructure = {
    [key: string]: InfoCasillero;
};
export declare type StructureDepot = {
    formId: string;
    row: any;
    surveyContent: any;
    idCaso: string;
};
export declare type Variable = {
    calculada: boolean;
    optativa: boolean;
    salto: string;
    saltoNsNr: string;
    opciones?: {
        [key: string]: {
            salto: string;
        };
    };
    tipo: string;
    maximo: string;
    minimo: string;
};
export declare type PilaDeRetroceso = {
    datosCasoPadreParaRetroceder: any;
    formIdParaRetroceder: string;
    UAdelForm: string;
    iPosicional: number;
};
export declare type FormStructureState = {
    estados?: any;
    siguientes?: any;
    actual?: any;
    primeraFalla?: any;
};
export declare type RowPath = {
    UAdelForm: string;
    position: number;
};
export declare type RowPathArray = RowPath[];
export declare class tipoc_Base {
    myForm: FormStructure;
    childs: tipoc_Base[];
    data: InfoCasilleroRegistro;
    inTable: boolean;
    constructor(infoCasillero: InfoCasillero, myForm: FormStructure);
    setChilds(childsInfo: InfoCasillero[]): void;
    displayRef(opts?: DisplayOpts): jsToHtml.ArrayContent;
    displayInput(direct?: boolean): HTMLSpanElement;
    displayMainText(opts?: DisplayOpts): (HTMLSpanElement | jsToHtml.HtmlTag<HTMLSpanElement>)[];
    displayTopElements(special?: boolean): jsToHtml.HtmlTag<HTMLDivElement> | jsToHtml.HtmlTag<HTMLTableRowElement>;
    displayInputForOptions(): HTMLInputElement;
    displayChilds(): jsToHtml.ArrayContent;
    displayBottomElement(): jsToHtml.HtmlBase[];
    display(special?: boolean): jsToHtml.ArrayContent;
    createVariable(): void;
    adaptOptionInput(group: ExtendedHTMLElement): void;
    readonly var_name: string;
    assignEnterKey(input: HTMLElement): void;
    connectControl(control: ExtendedHTMLElement): void;
}
export declare class tipoc_F extends tipoc_Base {
    displayRef(opts?: DisplayOpts): jsToHtml.ArrayContent;
}
export declare class tipoc_B extends tipoc_Base {
}
export declare class tipoc_MATRIZ extends tipoc_Base {
}
export declare class tipoc_TEXTO extends tipoc_Base {
}
export declare class tipoc_CONS extends tipoc_Base {
}
export declare class tipoc_P extends tipoc_Base {
    displayTopElements(special?: boolean): jsToHtml.HtmlTag<HTMLDivElement> | jsToHtml.HtmlTag<HTMLTableRowElement>;
    displayChilds(): jsToHtml.ArrayContent;
    displayBottomElement(): jsToHtml.HtmlTag<HTMLDivElement>[];
}
export declare class tipoc_PMATRIZ extends tipoc_Base {
    displayChilds(): jsToHtml.HtmlTag<HTMLTableElement>[];
}
export declare class tipoc_O extends tipoc_Base {
    display(special?: boolean): any[];
    displayTopElements(special?: boolean): any;
}
export declare class tipoc_OM extends tipoc_Base {
    display(): HTMLTableRowElement[];
    displayChilds(): jsToHtml.HtmlTag<HTMLTableElement>[];
}
export declare class tipoc_BF extends tipoc_Base {
    adaptOptionInput(groupElement: ExtendedHTMLElement): void;
}
export declare class FormStructure {
    surveyStructure: SurveyStructure;
    depot: StructureDepot;
    mainFormId: string;
    static controlRepetidos: {
        [key: string]: any;
    };
    content: tipoc_Base;
    variables: {
        [key: string]: Variable;
    };
    controls: {
        [key: string]: ExtendedHTMLElement;
    };
    elements: {
        [key: string]: ExtendedHTMLElement;
    };
    controlBox: {
        [key: string]: ExtendedHTMLElement;
    };
    back: {
        pilaDeRetroceso?: PilaDeRetroceso[];
        formId?: string;
        row?: any[];
    };
    esModoIngreso: boolean;
    formsButtonZone: {
        [key: string]: ExtendedHTMLElement;
    };
    state: FormStructureState;
    constructor(surveyStructure: SurveyStructure, depot: StructureDepot, mainFormId: string, pilaDeRetroceso: PilaDeRetroceso[]);
    readonly factory: {
        Base: typeof tipoc_Base;
        F: typeof tipoc_F;
        B: typeof tipoc_B;
        TEXTO: typeof tipoc_TEXTO;
        MATRIZ: typeof tipoc_MATRIZ;
        CONS: typeof tipoc_CONS;
        PMATRIZ: typeof tipoc_PMATRIZ;
        P: typeof tipoc_P;
        O: typeof tipoc_O;
        OM: typeof tipoc_OM;
        BF: typeof tipoc_BF;
    };
    newInstance(infoCasillero: InfoCasillero): tipoc_Base;
    display(): HTMLDivElement;
    JsonConcatPath(object1: any, object2: any, UAPath: RowPathArray): any;
    saveDepot(): boolean;
    completeCalculatedVars(): void;
    validateDepot(): void;
    consistencias(): void;
    refreshState(): void;
    posicionarVentanaVerticalmente(control: any, y: any): any;
    irAlSiguiente(variableActual: any, scrollScreen: any): void;
    completarHora(value: any): any;
}
