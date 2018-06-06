import * as jsToHtml from "js-to-html";
import "dialog-promise";
export declare var formTypes: {
    [key: string]: {
        htmlType: 'text' | 'number';
        typeName: 'bigint' | 'text' | 'decimal' | 'date' | 'interval';
        validar: 'texto' | 'opciones' | 'numerico';
        radio?: boolean;
    };
};
export interface ExtendedHTMLElement extends HTMLElement {
    myForm?: FormManager;
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
    cantidad_resumen: number;
    var_name: string;
    ultimo_ancestro: string;
};
export declare type InfoCasillero = {
    data: InfoCasilleroRegistro;
    childs: InfoCasillero[];
};
export declare type DisplayOpts = {
    forValue?: any;
};
export declare type SurveyMetadata = {
    operative: string;
    structure: SurveyStructure;
    analysisUnitStructure: analysisUnitStructure[];
    mainForm: string;
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
    subordinadaVar: string;
    subordinadaValor: any;
};
export declare type NavigationStack = {
    formData: any;
    formName: string;
    formId: string;
    analysisUnit: string;
    iPosition: number;
    scrollY: number;
};
export declare type FormStructureState = {
    estados?: {
        [key: string]: string;
    };
    siguientes?: any;
    actual?: any;
    primeraFalla?: any;
};
export declare type analysisUnitStructure = {
    unidad_analisis: string;
    id_casillero_formulario: string;
    casillero_formulario: string;
    unidad_analisis_principal: boolean;
    unidad_analisis_padre: string;
    preguntas: {
        orden: number;
        var_name: string;
        es_unidad_analisis: boolean;
    }[];
};
export declare class tipoc_Base {
    myForm: FormManager;
    childs: tipoc_Base[];
    data: InfoCasilleroRegistro;
    inTable: boolean;
    constructor(infoCasillero: InfoCasillero, myForm: FormManager);
    setChilds(childsInfo: InfoCasillero[]): void;
    displayRef(opts?: DisplayOpts): jsToHtml.ArrayContent;
    displayInput(direct?: boolean): HTMLSpanElement;
    displayMainText(opts?: DisplayOpts): (HTMLSpanElement | jsToHtml.HtmlTag<HTMLSpanElement>)[];
    displayTopElements(special?: boolean): jsToHtml.HtmlTag<HTMLDivElement> | jsToHtml.HtmlTag<HTMLTableRowElement>;
    displayInputForOptions(): HTMLInputElement;
    displayChilds(): jsToHtml.ArrayContent;
    displayBottomElement(): jsToHtml.HtmlBase[];
    display(special?: boolean): jsToHtml.ArrayContent;
    primerVariableDeDestino(): void;
    createVariable(): void;
    adaptOptionInput(group: ExtendedHTMLElement): void;
    readonly var_name: string;
    assignEnterKeyAndUpdateEvents(inputEntereable: HTMLElement, typedControlUpdateable: HTMLElement): void;
    connectControl(control: ExtendedHTMLElement): void;
}
export declare class tipoc_F extends tipoc_Base {
    displayRef(opts?: DisplayOpts): jsToHtml.ArrayContent;
    createBackButton(): HTMLButtonElement[];
    displayBottomElement(): jsToHtml.HtmlBase[];
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
export declare type SurveyData = any;
export declare type FormData = any;
export declare type SurveyId = any;
export declare class SurveyManager {
    surveyMetadata: SurveyMetadata;
    surveyId: SurveyId;
    surveyData: SurveyData;
    constructor(surveyMetadata: SurveyMetadata, surveyId: SurveyId, surveyData: SurveyData);
    displayMainForm(): Promise<FormManager>;
    readonly surveyStructure: SurveyStructure;
    saveSurvey(): Promise<void>;
}
export declare class FormManager {
    surveyManager: SurveyManager;
    formId: string;
    formData: FormData;
    stack: NavigationStack[];
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
    esModoIngreso: boolean;
    formsButtonZone: {
        [key: string]: ExtendedHTMLElement;
    };
    state: FormStructureState;
    mainFormHTMLId: string;
    iPosition: number;
    constructor(surveyManager: SurveyManager, formId: string, formData: FormData, stack: NavigationStack[]);
    adaptStructure(): void;
    readonly factory: {
        [key: string]: typeof tipoc_Base;
    };
    newInstance(infoCasillero: InfoCasillero): tipoc_Base;
    getFirstFromStack(): NavigationStack;
    addToStack(navigationStack: NavigationStack): void;
    removeFirstFromStack(): void;
    stackLength(): number;
    display(): HTMLDivElement;
    searchInfoCasilleroByVarName(infoCasillero: InfoCasillero, var_name: string): InfoCasillero;
    searchAnswerForInfoCasillero(infoCasillero: InfoCasillero, formData: any, var_name: string): string;
    searchFormIdForUaInForm(infoCasillero: InfoCasillero, formId: string, analysisUnit: string): string;
    saveSurvey(): Promise<void>;
    completeCalculatedVars(): void;
    validateDepot(): void;
    consistencias(): void;
    refreshState(): void;
    posicionarVentanaVerticalmente(control: HTMLElement, y: number): number;
    irAlSiguiente(variableActual: string, scrollScreen: boolean): void;
    completarHora(value: any): any;
}
