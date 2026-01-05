const fs = require('fs');
const path = require('path');

const checkDuplicates = (filePath) => {
    console.log(`Checking ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');

    // Custom parser to find duplicates, as JSON.parse simply overrides them
    const keys = new Set();
    const lines = content.split('\n');
    let duplicates = 0;

    lines.forEach((line, index) => {
        const match = line.match(/"([^"]+)":/);
        if (match) {
            const key = match[1];
            if (keys.has(key)) {
                console.log(`Duplicate key found: "${key}" at line ${index + 1}`);
                duplicates++;
            } else {
                keys.add(key);
            }
        }
    });

    if (duplicates === 0) {
        console.log('No duplicate keys found.');
    } else {
        console.log(`Found ${duplicates} duplicate keys.`);
    }
};

checkDuplicates('./src/i18n/locales/en.json');
checkDuplicates('./src/i18n/locales/hi.json');
