"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const data_source_1 = require("./data-source");
const start = async () => {
    try {
        console.log('Initializing database connection...');
        await data_source_1.AppDataSource.initialize();
        console.log('Database connection initialized.');
        const app = (0, app_1.buildApp)();
        app.listen(env_1.env.port, () => {
            console.log(`Server listening on port ${env_1.env.port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};
void start();
