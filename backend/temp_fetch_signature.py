from pathlib import Path
import re

path = Path('src/services/AlertService.ts')
text = path.read_text()
text, count = re.subn(r'async fetchUserAlerts\(userId: string\): Promise<UserAlertView\[]> {', "async fetchUserAlerts(userId: string, options: { includeSnoozed?: boolean } = {}): Promise<UserAlertView[]> {", text, count=1)
if count != 1:
    raise SystemExit('Failed to update fetchUserAlerts signature')
path.write_text(text)
