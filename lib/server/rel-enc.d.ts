/// <reference types="backend-plus" />
import * as backendPlus from "backend-plus";
export * from "../client/form-types";
export declare class AppRelEnc extends backendPlus.AppBackend {
    getTables(): string[];
}
