import re
import os

filepath = '/index.html'
if os.path.exists(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        # Look for 'const ' followed by an identifier but no '=' on the same line
        # This is a bit tricky with multiline, but usually it's single line errors
        clean_line = line.strip()
        if clean_line.startswith('const ') and '=' not in clean_line and ';' in clean_line:
            print(f"Potential error at line {i+1}: {clean_line}")
        
        # Also check if it's just 'const ' then something else
        # Like: const x;
        match = re.search(r'\bconst\s+[a-zA-Z0-9_$]+\s*;', clean_line)
        if match:
             print(f"Match found at line {i+1}: {clean_line}")
