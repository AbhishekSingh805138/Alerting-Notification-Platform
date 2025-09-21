from pathlib import Path

path = Path('src/controllers/AdminController.ts')
text = path.read_text()
needle = "  }\n\n  triggerReminders = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {\n"
insert = "  };\n\n  listTeams = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {\n    try {\n      const teams = await this.directoryService.listTeams();\n      res.json(teams);\n    } catch (error) {\n      next(error);\n    }\n  };\n\n  listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {\n    try {\n      const users = await this.directoryService.listUsers();\n      res.json(users);\n    } catch (error) {\n      next(error);\n    }\n  };\n\n  triggerReminders = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {\n"
if needle not in text:
    raise SystemExit('Needle for inserting directory methods not found')
path.write_text(text.replace(needle, insert))
