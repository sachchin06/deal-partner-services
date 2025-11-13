"use strict";

const fp = require("fastify-plugin");
const pack = require("./../package.json");

module.exports = fp(async function (fastify, opts) {
  const OAS3Format = {
    swagger: {
      info: {
        title: "Fastify API Documentation",
        description: "API documentation for Fastify",
        version: pack.version,
      },
      schemes: ["http", "https"],
      tags: [
        { name: "Auth", description: "Auth related end-points" },
        {
          name: "Admin Dashboard",
          description: "Admin Dashboard related end-points",
        },
        {
          name: "Data",
          description: "Data related end-points",
        },
        {
          name: "Image Upload",
          description: "Image Upload related end-points",
        },
        {
          name: "End User",
          description: "End User related end-points",
        },
        { name: "Seed", description: "Seed related end-points" },
      ],
      servers: [
        {
          url: fastify.config.APP_URL,
        },
      ],
      securityDefinitions: {
        bearerAuth: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
          description: "Bearer token authentication",
        },
      },
    },
    hideUntagged: true,
    exposeRoute: true,
  };
  fastify.register(require("@fastify/swagger"), OAS3Format);
});
