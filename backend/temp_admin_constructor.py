from pathlib import Path

path = Path('src/controllers/AdminController.ts')
text = path.read_text()
old = "  constructor(\n    private readonly alertService = new AlertService(),\n    private readonly analyticsService = new AnalyticsService(),\n  ) {}\n"
new = "  constructor(\n    private readonly alertService = new AlertService(),\n    private readonly analyticsService = new AnalyticsService(),\n    private readonly directoryService = new DirectoryService(),\n  ) {}\n"
if old not in text:
    raise SystemExit('Constructor pattern not found')
path.write_text(text.replace(old, new))
