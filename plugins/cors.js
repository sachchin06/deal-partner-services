"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  fastify.register(require("@fastify/cors"), {
    origin: [
      "https://dev.api.dealpartner.lk",
      "http://127.0.0.1:3000",
      "http://localhost:8500",
    ],
  });
});
