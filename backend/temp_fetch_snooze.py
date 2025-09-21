from pathlib import Path

path = Path('src/services/AlertService.ts')
text = path.read_text()
old = "      const snoozedUntil = preference.snoozedUntil ? new Date(preference.snoozedUntil) : null;\n      const snoozedToday = snoozedUntil ? snoozedUntil.getTime() > now.getTime() : false;\n      if (snoozedToday) {\n        continue;\n      }\n\n      relevant.push({ alert, preference });\n"
new = "      const snoozedUntil = preference.snoozedUntil ? new Date(preference.snoozedUntil) : null;\n      const snoozedActive = snoozedUntil ? snoozedUntil.getTime() > now.getTime() : false;\n      if (!includeSnoozed && snoozedActive) {\n        continue;\n      }\n\n      relevant.push({ alert, preference });\n"
if old not in text:
    raise SystemExit('Snooze block not found for update')
path.write_text(text.replace(old, new))
