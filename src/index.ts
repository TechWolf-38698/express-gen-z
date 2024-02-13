import "reflect-metadata";
import {
  Application,
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import * as path from "path";
import { DependencyContainer, InjectionToken, container } from "tsyringe";
import { RequestValidator } from "./validators/request-validator";

export * from "tsyringe";
export type ActionResult<T> = Response<T | Error>;
export type Nullable<T> = T | null;
export interface QueryRequest<T>
  extends Request<undefined, undefined, undefined, T> {}
export interface ParamsRequest<T>
  extends Request<T, undefined, undefined, undefined> {}
export interface BodyRequest<T>
  extends Request<undefined, undefined, T, undefined> {}

export enum HttpMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
  ALL = "all",
}
const ControllersRegsitry = new Array<Function>();

export interface ControllerInfo {
  route: string;
}

export interface ActionInfo {
  route: string;
  route1: string;
  method: HttpMethod;
  middlewares?: RequestHandler[];
}

export const EXPRESS_CONTROLLER = Symbol.for("express:controller");
export const EXPRESS_ACTION = Symbol.for("express:action");

export function Controller(info?: ControllerInfo): Function {
  return function (target: Function) {
    // injectable()(<any> target);
    Reflect.defineMetadata(EXPRESS_CONTROLLER, info, target);
    if (ControllersRegsitry.indexOf(target) != -1) {
      ControllersRegsitry.push(target);
    }
  };
}

export function Action(info: ActionInfo): Function {
  return function (target: any, propertyKey: string) {
    if (target.constructor) {
      Reflect.defineMetadata(
        EXPRESS_ACTION,
        info,
        target.constructor,
        propertyKey
      );
    }
  };
}

function createHttpDecorator(method: HttpMethod, route?: string): Function {
  return function (target: any, propertyKey: string) {
    if (target.constructor) {
      const meta = Reflect.getMetadata(
        EXPRESS_ACTION,
        target.constructor,
        propertyKey
      );
      if (meta) {
        Reflect.defineMetadata(
          EXPRESS_ACTION,
          { ...meta, method, route },
          target.constructor,
          propertyKey
        );
      } else {
        Reflect.defineMetadata(
          EXPRESS_ACTION,
          { ...meta, method, route, middlewares: [] },
          target.constructor,
          propertyKey
        );
      }
    }
  };
}

export function Route(route1: string): Function {
  return function (target: any, propertyKey: string) {
    if (target.constructor) {
      const meta = Reflect.getMetadata(
        EXPRESS_ACTION,
        target.constructor,
        propertyKey
      );
      if (meta) {
        Reflect.defineMetadata(
          EXPRESS_ACTION,
          { ...meta, route1 },
          target.constructor,
          propertyKey
        );
      } else {
        Reflect.defineMetadata(
          EXPRESS_ACTION,
          { ...meta, route1, middlewares: [] },
          target.constructor,
          propertyKey
        );
      }
    }
  };
}
export function Middlewares(middlewares: RequestHandler[]): Function {
  return function (target: any, propertyKey: string) {
    if (target.constructor) {
      const meta = Reflect.getMetadata(
        EXPRESS_ACTION,
        target.constructor,
        propertyKey
      );
      if (meta) {
        Reflect.defineMetadata(
          EXPRESS_ACTION,
          { ...meta, middlewares: [...meta.middlewares, ...middlewares] },
          target.constructor,
          propertyKey
        );
      } else {
        Reflect.defineMetadata(
          EXPRESS_ACTION,
          { middlewares },
          target.constructor,
          propertyKey
        );
      }
    }
  };
}
export function ValidateRequest<T extends object>(
  type: "body" | "params" | "query",
  C: T
): Function {
  return function (target: any, propertyKey: string) {
    if (target.constructor) {
      const meta = Reflect.getMetadata(
        EXPRESS_ACTION,
        target.constructor,
        propertyKey
      );
      if (meta) {
        Reflect.defineMetadata(
          EXPRESS_ACTION,
          {
            ...meta,
            middlewares: [
              ...meta.middlewares,
              RequestValidator<T>(C as any, type),
            ],
          },
          target.constructor,
          propertyKey
        );
      } else {
        Reflect.defineMetadata(
          EXPRESS_ACTION,
          { middlewares: [RequestValidator<T>(C as any, type)] },
          target.constructor,
          propertyKey
        );
      }
    }
  };
}
export const HttpGet = (route?: string): Function =>
  createHttpDecorator(HttpMethod.GET, route);
export const HttpPost = (route?: string): Function =>
  createHttpDecorator(HttpMethod.POST, route);
export const HttpPut = (route?: string): Function =>
  createHttpDecorator(HttpMethod.PUT, route);
export const HttpDelete = (route?: string): Function =>
  createHttpDecorator(HttpMethod.DELETE, route);
export const HttpPatch = (route?: string): Function =>
  createHttpDecorator(HttpMethod.PATCH, route);

function _join_routes(...routes: string[]): string {
  let route = "/api";
  routes.forEach(
    (r) =>
      (route = route + "/" + r.trim().replace(/^\//, "").replace(/\/$/, ""))
  );
  return route;
}

export async function attachController(app: Express, di: DependencyContainer) {
  let controllers: any[] = [];
  var controllerModule;
  var controllersPath;
  try {
    controllersPath = path.join(process.cwd(), "src/Controllers");
    controllerModule = await import(path.join(controllersPath, "index"));
  } catch (err) {
    controllersPath = path.join(process.cwd(), "Controllers");
    controllerModule = await import(path.join(controllersPath, "index"));
  }

  Object.values(controllerModule).forEach((controller) => {
    // Assuming each controller exports a class
    controllers.push(controller);
  });

  if (controllers.length == 0) {
    controllers = ControllersRegsitry;
  }
  controllers.forEach((controller) => {
    let controllerInfo: ControllerInfo = Reflect.getMetadata(
      EXPRESS_CONTROLLER,
      controller
    );
    // if (!controllerInfo) return; // Pass to next controller
    let instance = di.resolve(<InjectionToken<any>>controller);
    // Get all methods from the controller
    let controllerMethods = Object.getOwnPropertyNames(controller.prototype);
    controllerMethods.forEach((actionKey) => {
      if (actionKey == "constructor") return;
      const a = Reflect.getMetadata(EXPRESS_ACTION, controller, actionKey);
      let actionInfo: ActionInfo = Reflect.getMetadata(
        EXPRESS_ACTION,
        controller,
        actionKey
      );
      if (!actionInfo) return; // pass to next method

      // Attach to controller
      let route = _join_routes(
        controllerInfo?.route ||
          instance.constructor.name.replace("Controller", ""),
        actionInfo.route1 || actionInfo.route || actionKey
      );
      // if (actionInfo.middlewares) {
      //   app[actionInfo.method](
      //     route,
      //     ...actionInfo.middlewares,
      //     (req, res, next) => instance[actionKey](req, res, next)
      //   );
      // } else {
      //   app[actionInfo.method](route, (req, res, next) =>
      //     instance[actionKey](req, res, next)
      //   );
      // }
      if (actionInfo.middlewares) {
        app[actionInfo.method](
          route,
          ...actionInfo.middlewares,
          async (req, res, next) => {
            try {
              await instance[actionKey](req, res, next);
            } catch (error) {
              next(error); // Pass the error to the global error handler
            }
          }
        );
      } else {
        app[actionInfo.method](route, async (req, res, next) => {
          try {
            await instance[actionKey](req, res, next);
          } catch (error) {
            next(error); // Pass the error to the global error handler
          }
        });
      }
    });
  });
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Log the error for debugging purposes
    res.status(500).send({ error: "Internal Server Error" });
  });
}

export default function init(app: Application) {
  attachController(app as any, container);
}
