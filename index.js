const { PublicClient } = require('@okfe/okex-node');
const table = require('text-table');
const mysql = require('mysql2');

const client = new PublicClient('https://www.okex.me');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'lp19970127',
  database: 'trading_system'
});

connection.query(
  'SELECT * FROM `contract`',
  function(err, results, fields) {
    console.log(results); // results contains rows returned by server
    console.log(fields); // fields contains extra meta data about results, if available
  }
);

// const DIF = 5;
// const DEA = 10;
// const STATUS = { D: true, K: false };
// const INTERVAL = 15;
// const SECOND = 10;
// const LEVER = 20;
// const RATE = 0.3;
// const TIP = 0.01;
// const ENDURE = 0.11;

// let amount = 100;
// let currentStatus = STATUS.D,
//     dif,
//     dea,
//     IAmount,
//     openPrice,
//     closePrice,
//     income;

// async function getResult() {
//   try {
//     const result = await client.futures().getCandles('ETH-USD-190329', { granularity: 60 * INTERVAL });
//     const currentData = result[0];
//     const difL = result.slice(0, DIF).map(item => item[4]);
//     const deaL = result.slice(0, DEA).map(item => item[4]);
//     dif = toFixed(difL.reduce((p, c) => toFixed(p) + toFixed(c)) / DIF);
//     dea = toFixed(deaL.reduce((p, c) => toFixed(p) + toFixed(c)) / DEA);
//     if ((dif > dea && !currentStatus) || (dif < dea && currentStatus)) settle(currentData, currentStatus);
//     computed(openPrice, currentData, currentStatus);
//     log(currentData);
//   } catch (e) {
//     console.log(e);
//     getResult();
//   }
// }

// function log(currentData) {
//   console.log('****************************************');
//   console.log(table([
//     ['时间', new Date().toLocaleString()],
//     ['价格', currentData[4]],
//     ['短线', dif],
//     ['长线', dea],
//     ['趋势', dif > dea ? '涨' : '跌'],
//     ['开仓', openPrice],
//     ['投入', IAmount],
//     ['收入', income],
//     ['盈亏', toFixed(income * 100 / IAmount) + '%'],
//     ['总额', amount]
//   ], { align: ['l', 'l'] }));
//   console.log('****************************************');
// }

// function computed(startPrice, currentData, status) {
//   const endPrice = currentData[4];
//   let gap = status ? (endPrice - startPrice) : (startPrice - endPrice);
//   let incomeRate = gap / endPrice * LEVER - TIP;
//   income = incomeRate * IAmount;
// }

// function settle(currentData, status) {
//   console.log(123454321234543212345432);
//   closePrice = currentData[4];
//   computed(openPrice, closePrice, status);
//   if (income) amount += income;
//   currentStatus = !status;
//   IAmount = RATE * amount;
//   openPrice = currentData[4];
//   console.log(`（${new Date().toLocaleString()}）价格【${openPrice}】买${currentStatus ? '涨' : '跌'}`);
// }

// function toFixed(num, t = 3) {
//   return Number(Number(num).toFixed(t));
// }

// setInterval(() => getResult(), 1 * 1000);
