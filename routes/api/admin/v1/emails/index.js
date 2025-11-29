"use strict";
const moment = require("moment");
const _ = require("lodash");

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Admin Dashboard"],
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
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        };

        let options = {
          where,
        };

        if (limit !== -1) {
          const skip = (page - 1) * limit;
          options = { ...options, skip, take: limit };
        }

        const items = await fastify.prisma.emails.findMany(options);

        const totalCount = await fastify.prisma.emails.count({
          where: where,
        });
        const allCount = await fastify.prisma.emails.count({
          where: {
            deleted_at: null,
          },
        });

        const totalPages = limit !== -1 ? Math.ceil(totalCount / limit) : 1;

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
        tags: ["Admin Dashboard"],
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
        // await fastify.token.isAuth(request);

        const email = await fastify.prisma.emails.findUnique({
          where: {
            id: request.params.id,
          },
        });
        reply.send(email);
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
        tags: ["Admin Dashboard"],
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
        const item = await fastify.prisma.emails.update({
          where: {
            id: request.body.id,
          },
          data: {
            deleted_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Email with Id: ${item.id} deleted successfully`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/mark-as-read",
    {
      schema: {
        tags: ["Admin Dashboard"],
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
        // await fastify.token.isAuth(request);

        const email = await fastify.prisma.emails.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!email) {
          throw new Error("Email not found.");
        }

        const updatedEmail = await fastify.prisma.emails.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_read: true,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Email ${updatedEmail.id} has been marked as read.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
