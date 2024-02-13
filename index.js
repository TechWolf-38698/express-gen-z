"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachController = exports.HttpPatch = exports.HttpDelete = exports.HttpPut = exports.HttpPost = exports.HttpGet = exports.ValidateRequest = exports.Middlewares = exports.Route = exports.Action = exports.Controller = exports.EXPRESS_ACTION = exports.EXPRESS_CONTROLLER = exports.HttpMethod = void 0;
require("reflect-metadata");
const path = __importStar(require("path"));
const tsyringe_1 = require("tsyringe");
const request_validator_1 = require("./validators/request-validator");
__exportStar(require("tsyringe"), exports);
var HttpMethod;
(function (HttpMethod) {
    HttpMethod["GET"] = "get";
    HttpMethod["POST"] = "post";
    HttpMethod["PUT"] = "put";
    HttpMethod["PATCH"] = "patch";
    HttpMethod["DELETE"] = "delete";
    HttpMethod["ALL"] = "all";
})(HttpMethod || (exports.HttpMethod = HttpMethod = {}));
const ControllersRegsitry = new Array();
exports.EXPRESS_CONTROLLER = Symbol.for("express:controller");
exports.EXPRESS_ACTION = Symbol.for("express:action");
function Controller(info) {
    return function (target) {
        // injectable()(<any> target);
        Reflect.defineMetadata(exports.EXPRESS_CONTROLLER, info, target);
        if (ControllersRegsitry.indexOf(target) != -1) {
            ControllersRegsitry.push(target);
        }
    };
}
exports.Controller = Controller;
function Action(info) {
    return function (target, propertyKey) {
        if (target.constructor) {
            Reflect.defineMetadata(exports.EXPRESS_ACTION, info, target.constructor, propertyKey);
        }
    };
}
exports.Action = Action;
function createHttpDecorator(method, route) {
    return function (target, propertyKey) {
        if (target.constructor) {
            const meta = Reflect.getMetadata(exports.EXPRESS_ACTION, target.constructor, propertyKey);
            if (meta) {
                Reflect.defineMetadata(exports.EXPRESS_ACTION, Object.assign(Object.assign({}, meta), { method, route }), target.constructor, propertyKey);
            }
            else {
                Reflect.defineMetadata(exports.EXPRESS_ACTION, Object.assign(Object.assign({}, meta), { method, route, middlewares: [] }), target.constructor, propertyKey);
            }
        }
    };
}
function Route(route1) {
    return function (target, propertyKey) {
        if (target.constructor) {
            const meta = Reflect.getMetadata(exports.EXPRESS_ACTION, target.constructor, propertyKey);
            if (meta) {
                Reflect.defineMetadata(exports.EXPRESS_ACTION, Object.assign(Object.assign({}, meta), { route1 }), target.constructor, propertyKey);
            }
            else {
                Reflect.defineMetadata(exports.EXPRESS_ACTION, Object.assign(Object.assign({}, meta), { route1, middlewares: [] }), target.constructor, propertyKey);
            }
        }
    };
}
exports.Route = Route;
function Middlewares(middlewares) {
    return function (target, propertyKey) {
        if (target.constructor) {
            const meta = Reflect.getMetadata(exports.EXPRESS_ACTION, target.constructor, propertyKey);
            if (meta) {
                Reflect.defineMetadata(exports.EXPRESS_ACTION, Object.assign(Object.assign({}, meta), { middlewares: [...meta.middlewares, ...middlewares] }), target.constructor, propertyKey);
            }
            else {
                Reflect.defineMetadata(exports.EXPRESS_ACTION, { middlewares }, target.constructor, propertyKey);
            }
        }
    };
}
exports.Middlewares = Middlewares;
function ValidateRequest(type, C) {
    return function (target, propertyKey) {
        if (target.constructor) {
            const meta = Reflect.getMetadata(exports.EXPRESS_ACTION, target.constructor, propertyKey);
            if (meta) {
                Reflect.defineMetadata(exports.EXPRESS_ACTION, Object.assign(Object.assign({}, meta), { middlewares: [
                        ...meta.middlewares,
                        (0, request_validator_1.RequestValidator)(C, type),
                    ] }), target.constructor, propertyKey);
            }
            else {
                Reflect.defineMetadata(exports.EXPRESS_ACTION, { middlewares: [(0, request_validator_1.RequestValidator)(C, type)] }, target.constructor, propertyKey);
            }
        }
    };
}
exports.ValidateRequest = ValidateRequest;
const HttpGet = (route) => createHttpDecorator(HttpMethod.GET, route);
exports.HttpGet = HttpGet;
const HttpPost = (route) => createHttpDecorator(HttpMethod.POST, route);
exports.HttpPost = HttpPost;
const HttpPut = (route) => createHttpDecorator(HttpMethod.PUT, route);
exports.HttpPut = HttpPut;
const HttpDelete = (route) => createHttpDecorator(HttpMethod.DELETE, route);
exports.HttpDelete = HttpDelete;
const HttpPatch = (route) => createHttpDecorator(HttpMethod.PATCH, route);
exports.HttpPatch = HttpPatch;
function _join_routes(...routes) {
    let route = "/api";
    routes.forEach((r) => (route = route + "/" + r.trim().replace(/^\//, "").replace(/\/$/, "")));
    return route;
}
function attachController(app, di) {
    return __awaiter(this, void 0, void 0, function* () {
        let controllers = [];
        var controllerModule;
        var controllersPath;
        try {
            controllersPath = path.join(process.cwd(), "src/Controllers");
            controllerModule = yield Promise.resolve(`${path.join(controllersPath, "index")}`).then(s => __importStar(require(s)));
        }
        catch (err) {
            controllersPath = path.join(process.cwd(), "Controllers");
            controllerModule = yield Promise.resolve(`${path.join(controllersPath, "index")}`).then(s => __importStar(require(s)));
        }
        Object.values(controllerModule).forEach((controller) => {
            // Assuming each controller exports a class
            controllers.push(controller);
        });
        if (controllers.length == 0) {
            controllers = ControllersRegsitry;
        }
        controllers.forEach((controller) => {
            let controllerInfo = Reflect.getMetadata(exports.EXPRESS_CONTROLLER, controller);
            // if (!controllerInfo) return; // Pass to next controller
            let instance = di.resolve(controller);
            // Get all methods from the controller
            let controllerMethods = Object.getOwnPropertyNames(controller.prototype);
            controllerMethods.forEach((actionKey) => {
                if (actionKey == "constructor")
                    return;
                const a = Reflect.getMetadata(exports.EXPRESS_ACTION, controller, actionKey);
                let actionInfo = Reflect.getMetadata(exports.EXPRESS_ACTION, controller, actionKey);
                if (!actionInfo)
                    return; // pass to next method
                // Attach to controller
                let route = _join_routes((controllerInfo === null || controllerInfo === void 0 ? void 0 : controllerInfo.route) ||
                    instance.constructor.name.replace("Controller", ""), actionInfo.route1 || actionInfo.route || actionKey);
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
                    app[actionInfo.method](route, ...actionInfo.middlewares, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield instance[actionKey](req, res, next);
                        }
                        catch (error) {
                            next(error); // Pass the error to the global error handler
                        }
                    }));
                }
                else {
                    app[actionInfo.method](route, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield instance[actionKey](req, res, next);
                        }
                        catch (error) {
                            next(error); // Pass the error to the global error handler
                        }
                    }));
                }
            });
        });
        app.use((err, req, res, next) => {
            console.error(err.stack); // Log the error for debugging purposes
            res.status(500).send({ error: "Internal Server Error" });
        });
    });
}
exports.attachController = attachController;
function init(app) {
    attachController(app, tsyringe_1.container);
}
exports.default = init;
