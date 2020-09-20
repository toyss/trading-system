const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data.json').toString());

const storage = {
    direction: 0,
    operations: [],
    profit: 0,
    fee: 0.003,
};

function aboveSpace(price, ...args) {
    return args.every((v) => v > price);
}

function belowSpace(price, ...args) {
    return args.every((v) => v < price);
}

data.forEach((row) => {
    if (!row.fast || !row.slow) {
        return;
    }
    if (
        (belowSpace(row.fast, row.open, row.high, row.low, row.close) && aboveSpace(row.slow, row.open, row.high, row.low, row.close)) ||
        (belowSpace(row.slow, row.open, row.high, row.low, row.close) && aboveSpace(row.fast, row.open, row.high, row.low, row.close))
    ) {
        return;
    }
    switch (storage.direction) {
        case 0:
            nonePosition(row);
            break;
        case 1:
            longPosition(row);
            break;
        case -1:
            bearPosition(row);
            break;
    }
});

// 当前是空仓如何处理
function nonePosition(row) {}

// 当前是做多如何处理
function longPosition(row) {}

// 当前是做空如何处理
function bearPosition(row) {}
