const ARIMA = require('arima');

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const arima = new ARIMA({ auto: true }).fit(data)

const [pred, errors] = arima.predict(12)

console.log(pred);