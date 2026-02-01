/**
 * 路由聚合
 */

const paymentRoutes = require('./payment-routes');
const settlementRoutes = require('./settlement-routes');
const billPaymentRoutes = require('./bill-payment-routes');

module.exports = {
  paymentRoutes,
  settlementRoutes,
  billPaymentRoutes,
};
