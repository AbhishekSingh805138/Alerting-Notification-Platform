"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryService = void 0;
const data_source_1 = require("../data-source");
const Team_1 = require("../entities/Team");
const User_1 = require("../entities/User");
class DirectoryService {
    constructor() {
        this.teamRepo = data_source_1.AppDataSource.getRepository(Team_1.Team);
        this.userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    async listTeams() {
        const teams = await this.teamRepo.find({ order: { name: 'ASC' } });
        return teams.map((team) => ({ id: team.id, name: team.name }));
    }
    async listUsers() {
        const users = await this.userRepo.find({ relations: ['team'], order: { name: 'ASC' } });
        return users.map((user) => ({ id: user.id, name: user.name, teamId: user.team ? user.team.id : null }));
    }
}
exports.DirectoryService = DirectoryService;
