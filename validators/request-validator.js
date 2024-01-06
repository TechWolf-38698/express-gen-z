"use strict";
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
exports.RequestValidator = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
function RequestValidator(dtoClass, type) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        if (!(req === null || req === void 0 ? void 0 : req[type])) {
            return res
                .status(400)
                .json({ error: "Request body is missing or malformed" });
        }
        const dtoInstance = (0, class_transformer_1.plainToClass)(dtoClass, req === null || req === void 0 ? void 0 : req[type]);
        const errors = yield (0, class_validator_1.validate)(dtoInstance);
        if (errors.length > 0) {
            const errorMessages = errors
                .map((error) => Object.values(error.constraints || {}))
                .flat();
            return res.status(400).json({ errors: errorMessages });
        }
        req[type] = dtoInstance;
        next();
    });
}
exports.RequestValidator = RequestValidator;
