"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  const otp = {
    generateOtp(n) {
      var digits = "0123456789";
      let otp = "";
      for (let i = 0; i < n; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
      }
      return otp;
    },
  };
  fastify.decorate("otp", otp);
});
