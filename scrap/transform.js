const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputFilePath = path.join(__dirname, 'merged.json');
const outputFilePath = path.join(__dirname, 'ifsc-code.json');

// Read the input JSON file
fs.readFile(inputFilePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        // Parse the input data
        const inputData = JSON.parse(data);

        // Transform the data into an array of objects
        const transformedData = Object.keys(inputData).map(key => inputData[key]);

        // Write the transformed data to the output file
        fs.writeFile(outputFilePath, JSON.stringify(transformedData, null, 2), 'utf-8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('Transformed data saved to', outputFilePath);
            }
        });
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
});
