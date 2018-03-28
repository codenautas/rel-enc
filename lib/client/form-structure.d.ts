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
    estados?: {
        [key: string]: string;
    };
    siguientes?: any;
    actual?: any;
    primeraFalla?: any;
};
export declare type RowPath = {
    UAdelForm: string;
    position: number;
};
export declare type RowPathArray = RowPath[];
export declare type UAsInfo = {
    unidad_analisis: string;
    casillero_formulario: string;
    unidad_analisis_principal: boolean;
    unidad_analisis_padre: string;
    preguntas: {
        orden: number;
        id_casillero: string;
        es_unidad_analisis: boolean;
    }[];
}[];
export declare class tipoc_Base {
    myForm: FormStructure;
    childs: tipoc_Base[];
    data: InfoCasilleroRegistro;
    inTable: boolean;
    constructor(infoCasillero: InfoCasillero, myForm: FormStructure);
    setChilds(childsInfo: InfoCasillero[]): void;
    displayRef(opts?: DisplayOpts): jsToHtml.ArrayContent;
    displayInput(direct?: boolean): any;
    displayMainText(opts?: DisplayOpts): any[];
    displayTopElements(special?: boolean): any;
    displayInputForOptions(): any;
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
    displayTopElements(special?: boolean): any;
    displayChilds(): jsToHtml.ArrayContent;
    displayBottomElement(): any[];
}
export declare class tipoc_PMATRIZ extends tipoc_Base {
    displayChilds(): any[];
}
export declare class tipoc_O extends tipoc_Base {
    display(special?: boolean): any[];
    displayTopElements(special?: boolean): any;
}
export declare class tipoc_OM extends tipoc_Base {
    display(): any[];
    displayChilds(): any[];
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
    };
    esModoIngreso: boolean;
    formsButtonZone: {
        [key: string]: ExtendedHTMLElement;
    };
    state: FormStructureState;
    constructor(surveyStructure: SurveyStructure, depot: StructureDepot, mainFormId: string, pilaDeRetroceso?: PilaDeRetroceso[]);
    readonly factory: {
        [key: string]: typeof tipoc_Base;
    };
    newInstance(infoCasillero: InfoCasillero): tipoc_Base;
    addToStack(pilaDeRetroceso: PilaDeRetroceso): void;
    display(): any;
    JsonConcatPath(object1: any, object2: any, UAPath: RowPathArray): any;
    saveDepot(): boolean;
    completeCalculatedVars(): void;
    validateDepot(): void;
    consistencias(): void;
    refreshState(): void;
    posicionarVentanaVerticalmente(control: HTMLElement, y: number): any;
    irAlSiguiente(variableActual: string, scrollScreen: boolean): void;
    completarHora(value: any): any;
}
