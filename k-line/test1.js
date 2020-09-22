const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data1.json').toString());

fs.writeFileSync('./data2.json', JSON.stringify(data.operations.sort((a, b) => a.diff - b.diff)));