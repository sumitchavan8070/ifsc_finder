const fs = require('fs');
const path = require('path');

// Directory containing JSON files
const directory = path.join(__dirname, 'by-bank');

// Object to store merged data
let mergedData = {};

// Read all files in the directory
fs.readdir(directory, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    // Filter JSON files and read their contents
    files.filter(file => file.endsWith('.json')).forEach(file => {
        const filePath = path.join(directory, file);
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            // Merge the objects
            Object.assign(mergedData, data);
        } catch (error) {
            console.error(`Error parsing JSON from file ${file}:`, error);
        }
    });

    // Write merged data to a new file
    const outputFilePath = path.join(__dirname, 'merged.json');
    fs.writeFileSync(outputFilePath, JSON.stringify(mergedData, null, 2), 'utf-8');
    console.log('Merged JSON saved to', outputFilePath);
});
