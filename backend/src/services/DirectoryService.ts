import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Team } from '../entities/Team';
import { User } from '../entities/User';

export class DirectoryService {
  private teamRepo: Repository<Team> = AppDataSource.getRepository(Team);

  private userRepo: Repository<User> = AppDataSource.getRepository(User);

  async listTeams(): Promise<Array<{ id: string; name: string }>> {
    const teams = await this.teamRepo.find({ order: { name: 'ASC' } });
    return teams.map((team) => ({ id: team.id, name: team.name }));
  }

  async listUsers(): Promise<Array<{ id: string; name: string; teamId: string | null }>> {
    const users = await this.userRepo.find({ relations: ['team'], order: { name: 'ASC' } });
    return users.map((user) => ({ id: user.id, name: user.name, teamId: user.team ? user.team.id : null }));
  }
}
