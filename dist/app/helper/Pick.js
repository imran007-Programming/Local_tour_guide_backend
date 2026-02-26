"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pick = (obj, keys) => {
    const filterKeys = {};
    for (const key of keys) {
        if (obj && Object.hasOwnProperty.call(obj, key)) {
            filterKeys[key] = obj[key];
        }
    }
    return filterKeys;
};
exports.default = pick;
