const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data.json').toString());

const storage = {
    operations: [],
    fee: 0.00045,
    lev: 20,
    putNum: 20,
    profit: 0,
};

let operation = initOpration();
function initOpration() {
    return {
        direction: 0,
        start: 0,
        end: 0,
        startTime: '',
        endTime: '',
        gain: 0,
    };
}
function aboveSpace(price, ...args) {
    return args.every((v) => price > v);
}

function belowSpace(price, ...args) {
    return args.every((v) => price < v);
}

data.forEach((row, index) => {
    if (!row.fast || !row.slow) {
        return;
    }
    // if (
    //     (belowSpace(row.fast, row.open, row.high, row.low, row.close) && aboveSpace(row.slow, row.open, row.high, row.low, row.close)) ||
    //     (belowSpace(row.slow, row.open, row.high, row.low, row.close) && aboveSpace(row.fast, row.open, row.high, row.low, row.close))
    // ) {
    //     return;
    // }

    switch (operation.direction) {
        case 0:
            nonePosition(row, index, data);
            break;
        case 1:
            longPosition(row, index, data);
            break;
        case -1:
            bearPosition(row, index, data);
            break;
    }
});
// storage.profit = storage.operations.reduce((s, a) => s + a.gain, 0);
fs.writeFileSync('./data1.json', JSON.stringify(storage));

// 当前是空仓如何处理
function nonePosition(row, index, data) {
    const prevRow = data[index - 1];

    if (!prevRow.fast || !prevRow.slow) {
        return;
    }

    if (aboveSpace(prevRow.close, prevRow.fast, prevRow.slow) && aboveSpace(row.close, row.fast, row.slow)) {
        operation.direction = 1;
        operation.start = row.close;
        operation.startTime = new Date(row.time * 1000).toLocaleString();
    }

    if (belowSpace(prevRow.close, prevRow.fast, prevRow.slow) && belowSpace(row.close, row.fast, row.slow)) {
        operation.direction = -1;
        operation.start = row.close;
        operation.startTime = new Date(row.time * 1000).toLocaleString();
    }
}

// 当前是做多如何处理
function longPosition(row, index, data) {
    const prevRow = data[index - 1];

    if (!prevRow.fast || !prevRow.slow) {
        return;
    }

    if (aboveSpace(prevRow.close, prevRow.fast, prevRow.slow) && (row.close < row.fast || row.close < row.slow)) {
        operation.end = row.close;
        operation.diff = operation.end - operation.start - (operation.start * storage.fee);
        operation.gain = operation.diff * 20;
        operation.endTime = new Date(row.time * 1000).toLocaleString();
        storage.profit += operation.gain;
        operation.profit = storage.profit;
        storage.operations.push(operation);
        operation = initOpration();
    }
}

// 当前是做空如何处理
function bearPosition(row, index, data) {
    const prevRow = data[index - 1];

    if (!prevRow.fast || !prevRow.slow) {
        return;
    }

    if (belowSpace(prevRow.close, prevRow.fast, prevRow.slow) && (row.close > row.fast || row.close > row.slow)) {
        operation.end = row.close;
        operation.diff = operation.start - operation.end - (operation.start * storage.fee);
        operation.gain = operation.diff * 20;
        operation.endTime = new Date(row.time * 1000).toLocaleString();
        storage.profit += operation.gain;
        operation.profit = storage.profit;
        storage.operations.push(operation);
        operation = initOpration();
    }
}