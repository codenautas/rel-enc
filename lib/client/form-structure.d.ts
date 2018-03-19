import * as jsToHtml from "js-to-html";
export interface ExtendedHTMLElement extends jsToHtml.ExtendedHTMLElement {
    myForm?: FormStructure;
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
export declare class tipoc_Base {
    myForm: FormStructure;
    childs: tipoc_Base[];
    data: InfoCasilleroRegistro;
    inTable: boolean;
    constructor(infoCasillero: InfoCasillero, myForm: FormStructure);
    setChilds(childsInfo: InfoCasillero[]): void;
    displayRef(opts?: DisplayOpts): any[];
    displayInput(direct?: boolean): jsToHtml.ExtendedHTMLElement;
    displayMainText(opts?: DisplayOpts): (jsToHtml.ExtendedHTMLElement | {
        create(): jsToHtml.ExtendedHTMLElement;
    })[];
    displayTopElements(special?: boolean): {
        create(): jsToHtml.ExtendedHTMLElement;
    };
    displayInputForOptions(): jsToHtml.ExtendedHTMLElement;
    displayChilds(): any;
    displayBottomElement(): any[];
    display(special?: boolean): any;
    createVariable(): void;
    adaptOptionInput(group: ExtendedHTMLElement): void;
    readonly var_name: string;
    assignEnterKey(input: HTMLElement): void;
    connectControl(control: ExtendedHTMLElement): void;
}
export declare class tipoc_F extends tipoc_Base {
    displayRef(opts?: DisplayOpts): any[];
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
    displayTopElements(special?: boolean): {
        create(): jsToHtml.ExtendedHTMLElement;
    };
    displayChilds(): {
        create(): jsToHtml.ExtendedHTMLTableElement;
    }[];
    displayBottomElement(): {
        create(): jsToHtml.ExtendedHTMLElement;
    }[];
}
export declare class tipoc_PMATRIZ extends tipoc_Base {
    displayChilds(): {
        create(): jsToHtml.ExtendedHTMLTableElement;
    }[];
}
export declare class tipoc_O extends tipoc_Base {
    display(special?: boolean): any[];
    displayTopElements(special?: boolean): any;
}
export declare class tipoc_OM extends tipoc_Base {
    display(): jsToHtml.ExtendedHTMLTableRowElement[];
    displayChilds(): {
        create(): jsToHtml.ExtendedHTMLTableElement;
    }[];
}
export declare class tipoc_BF extends tipoc_Base {
    adaptOptionInput(groupElement: ExtendedHTMLElement): void;
}
export declare class FormStructure {
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
        pilaDeRetroceso: PilaDeRetroceso[];
        formId?: string;
        row?: any[];
    };
    depot: {
        formId: string;
        row: any;
        surveyContent: any;
        idCaso: string;
    };
    surveyStructure: SurveyStructure;
    esModoIngreso: boolean;
    formsButtonZone: {
        [key: string]: ExtendedHTMLElement;
    };
    state: FormStructureState;
    constructor(formStructureInfo: InfoCasillero);
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
    display(): any;
    JsonConcatPath(object1: any, object2: any, UAPath: any): any;
    saveDepot(): boolean;
    completeCalculatedVars(): void;
    validateDepot(): void;
    consistencias(): void;
    refreshState(): void;
    posicionarVentanaVerticalmente(control: any, y: any): any;
    irAlSiguiente(variableActual: any, scrollScreen: any): void;
    completarHora(value: any): any;
}
