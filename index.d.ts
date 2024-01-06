import "reflect-metadata";
import { Application, Express, Request, RequestHandler, Response } from "express";
import { DependencyContainer } from "tsyringe";
export * from "tsyringe";
export type ActionResult<T> = Response<T | Error>;
export type Nullable<T> = T | null;
export interface QueryRequest<T> extends Request<undefined, undefined, undefined, T> {
}
export interface ParamsRequest<T> extends Request<T, undefined, undefined, undefined> {
}
export interface BodyRequest<T> extends Request<undefined, undefined, T, undefined> {
}
export declare enum HttpMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    PATCH = "patch",
    DELETE = "delete",
    ALL = "all"
}
export interface ControllerInfo {
    route: string;
}
export interface ActionInfo {
    route: string;
    route1: string;
    method: HttpMethod;
    middlewares?: RequestHandler[];
}
export declare const EXPRESS_CONTROLLER: unique symbol;
export declare const EXPRESS_ACTION: unique symbol;
export declare function Controller(info?: ControllerInfo): Function;
export declare function Action(info: ActionInfo): Function;
export declare function Route(route1: string): Function;
export declare function Middlewares(middlewares: RequestHandler[]): Function;
export declare function ValidateRequest<T extends object>(type: "body" | "params" | "query", C: T): Function;
export declare const HttpGet: (route?: string) => Function;
export declare const HttpPost: (route?: string) => Function;
export declare const HttpPut: (route?: string) => Function;
export declare const HttpDelete: (route?: string) => Function;
export declare const HttpPatch: (route?: string) => Function;
export declare function attachController(app: Express, di: DependencyContainer): Promise<void>;
export default function init(app: Application): void;
