from pathlib import Path

path = Path('src/controllers/AdminController.ts')
text = path.read_text()
if "DirectoryService" in text:
    raise SystemExit('DirectoryService already imported?')
text = text.replace("import { AlertService } from '../services/AlertService';\nimport { AnalyticsService } from '../services/AnalyticsService';\n", "import { AlertService } from '../services/AlertService';\nimport { AnalyticsService } from '../services/AnalyticsService';\nimport { DirectoryService } from '../services/DirectoryService';\n")
path.write_text(text)
