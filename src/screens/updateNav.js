const fs = require('fs');
const path = require('path');
const dir = "c:/Users/Admin/Downloads/App-dev (1)/App-dev/src/screens";
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('<TopNavBar')) {
      if (!content.includes('handleBack={handleBack}')) {
        content = content.replace('setCurrentScreen,', 'setCurrentScreen,\n  handleBack,\n  currentScreen,');
        content = content.replace('<TopNavBar setCurrentScreen={setCurrentScreen}', '<TopNavBar setCurrentScreen={setCurrentScreen} handleBack={handleBack} currentScreen={currentScreen}');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
});
