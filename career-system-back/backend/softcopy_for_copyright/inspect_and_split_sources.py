import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = BASE_DIR.parent
PROJECT_ROOT = BACKEND_ROOT.parent

KEY_FILES = [
    BACKEND_ROOT / 'backingend_API.py',
    BACKEND_ROOT / 'internship_recommender.py',
    PROJECT_ROOT / 'career-system-front' / 'app' / 'services' / 'authService.ts',
    PROJECT_ROOT / 'career-system-front' / 'app' / 'context' / 'AuthContext.tsx',
    PROJECT_ROOT / 'career-system-front' / 'app' / 'services' / 'recommendationService.ts',
    PROJECT_ROOT / 'career-system-front' / 'app' / 'ai-advisor' / 'page.tsx',
]

OUT_DIR = BASE_DIR / 'code_snippets'
OUT_DIR.mkdir(exist_ok=True)

for f in KEY_FILES:
    f = f.resolve()
    print(f, 'exists' if f.exists() else 'missing', 'lines', len(f.read_text(encoding='utf-8').splitlines()) if f.exists() else '-')

# Split each file into 50-line parts
for file_path in KEY_FILES:
    file_path = file_path.resolve()
    if not file_path.exists():
        continue
    lines = file_path.read_text(encoding='utf-8').splitlines()
    for i in range(0, len(lines), 50):
        part = lines[i:i+50]
        rel = file_path.relative_to(BASE_DIR.parent)
        out_name = f"{rel.as_posix().replace('/', '_')}_part_{i//50+1}.txt"
        out_file = OUT_DIR / out_name
        with open(out_file, 'w', encoding='utf-8') as out:
            out.write(f"# Source: {rel}\n")
            out.write(f"# Lines {i+1}-{i+len(part)}\n\n")
            out.write('\n'.join(part))
        print('wrote', out_file)

print('done')
