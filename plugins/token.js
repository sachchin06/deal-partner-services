"use strict";

const fp = require("fastify-plugin");
const _ = require("lodash");

module.exports = fp(async function (fastify, opts) {
  fastify.register(require("@fastify/jwt"), {
    secret: "dealpartner",
    messages: {
      noAuthorizationInHeaderMessage: "No Authorization was found.",
    },
    sign: {
      //expiresIn: 60,
      expiresIn: 60 * 60 * 24 * 30, //in seconds, expires in 30 days
    },
  });
  const obj = {
    isAuth: async (params) => {
      await params.jwtVerify();

      const user = await fastify.prisma.users.findUnique({
        where: {
          id: params.user.id,
        },
      });

      if (!user) {
        throw new Error("Invalid Token or Token Expired");
      }

      if (user && user.deleted_at) {
        throw new Error("Your account is deleted.");
      }
    },
  };
  fastify.decorate("token", obj);
});
