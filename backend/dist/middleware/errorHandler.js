"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
// Basic error handler that preserves useful debugging info while keeping responses consistent
const errorHandler = (error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = error instanceof Error && 'status' in error ? Number(error.status) : 500;
    res.status(status || 500).json({
        message,
    });
};
exports.errorHandler = errorHandler;
