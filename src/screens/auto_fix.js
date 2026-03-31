const fs = require('fs');
const path = require('path');
const dir = "c:/Users/Admin/Downloads/App-dev (1)/App-dev/src/screens";

const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix ReferenceError
    if (content.includes('handleBack={handleBack}') && !content.includes('handleBack,') && !content.includes(', handleBack')) {
      content = content.replace(/\}: any\)\s*=>\s*\{/, ', handleBack, currentScreen\n}: any) => {');
      changed = true;
    }

    // Fix PLAYLIST to dynamicPlaylist (except for the import PLAYLIST line)
    if (content.includes('PLAYLIST') && file !== 'HomeScreen.tsx') {
      // First ensure dynamicPlaylist is in props
      if (!content.includes('dynamicPlaylist,')) {
        content = content.replace(/\}: any\)\s*=>\s*\{/, ', dynamicPlaylist\n}: any) => {');
      }
      
      // Remove import { PLAYLIST }
      content = content.replace(/import \{.*PLAYLIST.*\} from '\.\.\/constants';/, "import { ALBUMS, GENRES } from '../constants';");
      content = content.replace(/import \{ PLAYLIST \} from '\.\.\/constants';/, "");
      
      // Replace all PLAYLIST
      content = content.replace(/PLAYLIST/g, 'dynamicPlaylist');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Auto_fix: Updated ${file}`);
    }
  }
});
