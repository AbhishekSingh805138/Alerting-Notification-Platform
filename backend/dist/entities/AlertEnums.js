"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryType = exports.AlertSeverity = void 0;
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var DeliveryType;
(function (DeliveryType) {
    DeliveryType["IN_APP"] = "in_app";
    DeliveryType["EMAIL"] = "email";
    DeliveryType["SMS"] = "sms";
})(DeliveryType || (exports.DeliveryType = DeliveryType = {}));
