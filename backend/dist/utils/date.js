"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hoursDifference = exports.isBeforeOrEqual = exports.startOfNextDay = void 0;
const startOfNextDay = (date) => {
    const next = new Date(date);
    next.setUTCHours(0, 0, 0, 0);
    next.setUTCDate(next.getUTCDate() + 1);
    return next;
};
exports.startOfNextDay = startOfNextDay;
const isBeforeOrEqual = (dateA, dateB) => {
    if (!dateA) {
        return true;
    }
    return dateA.getTime() <= dateB.getTime();
};
exports.isBeforeOrEqual = isBeforeOrEqual;
const hoursDifference = (from, to) => {
    return (to.getTime() - from.getTime()) / (1000 * 60 * 60);
};
exports.hoursDifference = hoursDifference;
