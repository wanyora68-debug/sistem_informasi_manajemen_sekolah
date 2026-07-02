import re

with open('index.html', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Match 'const varname;' or 'const var1, var2;' where none have '='
    # This is a bit tricky with regex, but we can look for 'const' not followed by '=' before ';'
    match = re.search(r'const\s+([^=;]+);', line)
    if match:
        content = match.group(1).strip()
        # Ensure it's not a 'for (const x of ...)' which is valid (but usually ends with '{' or something else, not ';')
        # And ensure it's not just a multiline const that ends with '=' on next line (rare)
        if ' of ' not in content and ' in ' not in content:
            print(f"Line {i+1}: {line.strip()}")
