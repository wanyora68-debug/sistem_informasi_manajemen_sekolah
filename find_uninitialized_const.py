import re

with open('/index.html', 'r') as f:
    content = f.read()

# Regular expression to find 'const' declarations
# This is a simple regex and might not catch everything, but it's a start.
# It looks for 'const' followed by whitespace and an identifier, then optional whitespace and a semicolon.
# It uses negative lookahead to ensure there's no '=' before the semicolon.
pattern = r'const\s+([a-zA-Z0-9_$]+)\s*;'
matches = re.finditer(pattern, content)

for match in matches:
    start = match.start()
    line_num = content.count('\n', 0, start) + 1
    print(f"Found uninitialized const at line {line_num}: {match.group(0)}")

# Also look for cases where 'const' is at the end of a line or only followed by whitespace
pattern_no_id = r'const\s*\n'
matches_no_id = re.finditer(pattern_no_id, content)
for match in matches_no_id:
    start = match.start()
    line_num = content.count('\n', 0, start) + 1
    print(f"Found bare const at line {line_num}")
