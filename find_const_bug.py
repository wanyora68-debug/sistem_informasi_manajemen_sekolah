import re

with open('/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped.startswith('const '):
        if '=' not in stripped and ' of ' not in stripped and ' in ' not in stripped:
             print(f"L{i+1}: {stripped}")
    # Also check if const follows some other characters
    elif 'const ' in line:
         # Check if it's a stand-alone const declaration
         match = re.search(r'\bconst\s+([a-zA-Z0-9_$]+)\s*($|;)', line)
         if match:
             print(f"L{i+1}: {line.strip()}")
