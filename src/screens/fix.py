import os
import re

screens_dir = r"e:\TEMP\Desktop\Desktop\huhu\huhu\01-fe-react-native-todo\src\screens"
files_to_fix = [
    "FavoriteScreen.tsx", "TopTracksScreen.tsx", "DownloadScreen.tsx",
    "GenreScreen.tsx", "ArtistScreen.tsx", "AlbumScreen.tsx"
]

header_pattern = re.compile(r'\{\/\* --- Header Đồng Bộ --- \*\/\}\s*<View style=\{styles\.homeTopNav\}>.*?(?=\s*<View style=\{\{\s*flex:\s*1\s*\}\}>)', re.DOTALL)
replacement = """{/* --- Header Đồng Bộ --- */}
      <TopNavBar 
        handleOpenSearch={handleOpenSearch}
        currentUser={currentUser}
        handleLogout={handleLogout}
        handleOpenAuth={handleOpenAuth}
        toggleMenu={toggleMenu}
        isMenuOpen={isMenuOpen}
      />\n\n"""

for file in files_to_fix:
    path = os.path.join(screens_dir, file)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<TopNavBar' not in content:
        content = header_pattern.sub(replacement, content)
        
    if 'import { TopNavBar }' not in content:
        content = content.replace("import { AppFooter } from '../components/AppFooter';", "import { AppFooter } from '../components/AppFooter';\nimport { TopNavBar } from '../components/TopNavBar';")
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Headers replaced successfully")
