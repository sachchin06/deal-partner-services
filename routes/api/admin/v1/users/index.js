"use strict";
const moment = require("moment");
const _ = require("lodash");

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Main"],
        security: [{ bearerAuth: [] }],
        query: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              default: 1,
            },
            limit: {
              type: "integer",
              default: 10,
            },
            search: {
              type: "string",
              default: "",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const page = request.query.page;
        const limit = request.query.limit;
        const search = request.query.search;
        const skip = (page - 1) * limit;

        var where = {
          deleted_at: null,
          OR: [
            { user_name: { contains: search } },
            { display_name: { contains: search } },
          ],
        };

        const items = await fastify.prisma.users.findMany({
          where: where,
          skip: skip,
          take: limit,
          select: {
            id: true,
            user_name: true,
            display_name: true,
            email: true,
            created_at: true,
          },
        });
        const totalCount = await fastify.prisma.users.count({
          where: where,
        });
        const allCount = await fastify.prisma.users.count({
          where: {
            deleted_at: null,
          },
        });

        const totalPages = Math.ceil(totalCount / limit);

        var res = {};
        res.page = page;
        res.limit = limit;
        res.totalPages = totalPages;
        res.totalCount = totalCount;
        res.allCount = allCount;
        res.data = items;
        reply.send(res);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["Main"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              default: 1,
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await fastify.token.isAuth(request);

        const user = await fastify.prisma.users.findUnique({
          where: {
            id: request.params.id,
          },
          select: {
            id: true,
            user_name: true,
            display_name: true,
            email: true,
            created_at: true,
          },
        });
        reply.send(user);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/new",
    {
      schema: {
        tags: ["Main"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["user_name", "email", "display_name"],
          properties: {
            user_name: {
              type: "string",
            },
            email: {
              type: "string",
            },
            display_name: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const email = await fastify.prisma.users.findUnique({
          where: {
            email: request.body.email,
          },
        });

        if (email) {
          throw new Error("The email alredy in our system.");
        }

        const username = await fastify.prisma.users.findUnique({
          where: {
            user_name: request.body.user_name,
          },
        });
        if (username) {
          throw new Error("The username alredy in our system.");
        }

        const item = await fastify.prisma.users.create({
          data: {
            user_name: request.body.user_name,
            email: request.body.email,
            display_name: request.body.display_name,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            user_name: true,
            email: true,
            display_name: true,
            created_at: true,
          },
        });

        reply.send(item);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/edit",
    {
      schema: {
        tags: ["Main"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["id", "email"],
          properties: {
            id: {
              type: "number",
            },
            user_name: {
              type: "string",
            },
            email: {
              type: "string",
            },
            display_name: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const email = await fastify.prisma.users.findUnique({
          where: {
            email: request.body.email,
          },
        });

        if (email && email.id != request.body.id) {
          throw new Error("The email alredy in our system.");
        }
        const username = await fastify.prisma.users.findUnique({
          where: {
            user_name: request.body.user_name,
          },
        });

        if (username && username.id != request.body.id) {
          throw new Error("The username alredy in our system.");
        }
        const item = await fastify.prisma.users.update({
          where: {
            id: request.body.id,
          },
          data: {
            user_name: request.body.user_name,
            email: request.body.email,
            display_name: request.body.display_name,
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            user_name: true,
            display_name: true,
            email: true,
            created_at: true,
          },
        });

        reply.send(item);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/delete",
    {
      schema: {
        tags: ["Main"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "number",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const item = await fastify.prisma.users.update({
          where: {
            id: request.body.id,
          },
          data: {
            deleted_at: moment().toISOString(),
          },
          select: {
            id: true,
            user_name: true,
            email: true,
          },
        });

        reply.send(item);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
