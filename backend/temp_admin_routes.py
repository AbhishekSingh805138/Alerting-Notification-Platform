from pathlib import Path

path = Path('src/routes/admin.routes.ts')
text = path.read_text()
text = text.replace("const router = Router();\nconst controller = new AdminController();\n\nrouter.post('/alerts', controller.createAlert);\n", "const router = Router();\nconst controller = new AdminController();\n\nrouter.get('/teams', controller.listTeams);\nrouter.get('/users', controller.listUsers);\nrouter.post('/alerts', controller.createAlert);\n")
path.write_text(text)
