from pathlib import Path

path = Path('src/services/AlertService.ts')
text = path.read_text()
needle = "    if (!user) {\n      throw new Error('User not found');\n    }\n\n    const now = new Date();\n"
replacement = "    if (!user) {\n      throw new Error('User not found');\n    }\n\n    const includeSnoozed = options.includeSnoozed ?? false;\n    const now = new Date();\n"
if needle not in text:
    raise SystemExit('Needle not found for includeSnoozed insertion')
path.write_text(text.replace(needle, replacement))
