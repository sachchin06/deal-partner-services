"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
const fastifyEnv = require("@fastify/env");

const schema = {
  type: "object",
  required: ["APP_URL", "DATABASE_URL"],
  properties: {
    APP_URL: {
      type: "string",
    },
    DATABASE_URL: {
      type: "string",
    },
  },
};

const options = {
  schema: schema,
  dotenv: true,
};

// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {};

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(fastifyEnv, options).after((err) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "plugins"),
      options: Object.assign({}, opts),
    });

    // This loads all plugins defined in routes
    // define your routes in one of these
    fastify.register(AutoLoad, {
      dir: path.join(__dirname, "routes"),
      options: Object.assign({}, opts),
      routeParams: true,
    });
  });
};
