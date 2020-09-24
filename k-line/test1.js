const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data1.json').toString());

fs.writeFileSync('./data3.json', JSON.stringify(data.operations.filter((item) => item.gain > 0)));
