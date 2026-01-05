const fs = require('fs');
const path = require('path');

const fixJson = (filePath) => {
    console.log(`Fixing ${filePath}...`);
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // We want to detect duplicates to ensure we aren't silently overwriting important differences
        // But for the sake of "fixing" the valid JSON requirement, JSON.parse is the standard behavior (last key wins).
        // However, to be safer and avoid reordering if possible (though JSON.parse keeps order mostly), 
        // let's just use JSON.parse.

        const json = JSON.parse(content);

        // Write back with 2-space indentation
        const fixedContent = JSON.stringify(json, null, 2);

        fs.writeFileSync(filePath, fixedContent);
        console.log(`Successfully fixed ${filePath}.`);
    } catch (e) {
        console.error(`Error fixing ${filePath}:`, e.message);
    }
};

fixJson('./src/i18n/locales/en.json');
fixJson('./src/i18n/locales/hi.json');
