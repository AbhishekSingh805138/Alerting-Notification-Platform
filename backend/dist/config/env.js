"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const number = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
exports.env = {
    port: number(process.env.PORT, 3000),
    db: {
        host: process.env.DB_HOST ?? 'localhost',
        port: number(process.env.DB_PORT, 5432),
        name: process.env.DB_NAME ?? 'Notification',
        user: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
    },
};
