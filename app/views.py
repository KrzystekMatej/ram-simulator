import os
from django.conf import settings
from django.shortcuts import render
from django.templatetags.static import static

def get_program_files_list(program_type: str):
    if settings.DEBUG:
        root = settings.BASE_DIR / 'app' / 'static' / 'assets' / 'programs'
    else:
        root = settings.STATIC_ROOT / 'assets' / 'programs'

    target_dir_pathlib = root / program_type
    files = []
    if target_dir_pathlib.is_dir():
        try:
            files = [
                f for f in os.listdir(str(target_dir_pathlib))
                if os.path.isfile(os.path.join(str(target_dir_pathlib), f)) and f.endswith('.ram')
            ]
            files.sort()
        except Exception as e:
            print(f"Error listing files in {target_dir_pathlib}: {e}")
    else:
        print(f"Warning: Directory {target_dir_pathlib} not found for program type '{program_type}'.")
    return files

def index(request):
    macro_files = get_program_files_list('macro')
    micro_files = get_program_files_list('micro')

    context = {
        'macro_programs': macro_files,
        'micro_programs': micro_files,
        'macro_programs_base_url': static('assets/programs/macro/'),
        'micro_programs_base_url': static('assets/programs/micro/'),
        'turing_sets_url': static('assets/turing-sets.txt'),
    }
    return render(request, 'index.html', context)
