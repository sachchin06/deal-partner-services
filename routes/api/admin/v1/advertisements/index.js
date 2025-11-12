"use strict";
const moment = require("moment");

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
            is_enabled: {
              type: "integer",
              default: -1,
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
        const is_enabled = request.query.is_enabled;
        const skip = (page - 1) * limit;

        var where = {
          deleted_at: null,
        };

        if (is_enabled == 1) {
          where = {
            deleted_at: null,
            is_enabled: true,
          };
        } else if (is_enabled == 0) {
          where = {
            deleted_at: null,
            is_enabled: false,
          };
        }

        const advertisements = await fastify.prisma.advertisements.findMany({
          where: where,
          skip: skip,
          take: limit,
        });

        const totalCount = await fastify.prisma.advertisements.count({
          where: where,
        });

        const allCount = await fastify.prisma.advertisements.count({
          where: {
            deleted_at: null,
          },
        });

        const totalEnabledCount = await fastify.prisma.advertisements.count({
          where: {
            deleted_at: null,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.advertisements.count({
          where: {
            deleted_at: null,
            is_enabled: false,
          },
        });

        var count = {};
        count.all = allCount;
        count.enabled = totalEnabledCount;
        count.disabled = totalDisabledCount;

        const totalPages = Math.ceil(totalCount / limit);

        var res = {};
        res.page = page;
        res.limit = limit;
        res.totalPages = totalPages;
        res.totalCount = totalCount;
        res.count = count;
        res.data = advertisements;

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

        const advertisement = await fastify.prisma.advertisements.findUnique({
          where: {
            id: request.params.id,
          },
          select: {
            id: true,
            image_url: true,
            is_enabled: true,
            created_at: true,
            modified_at: true,
          },
        });

        if (!advertisement) {
          throw new Error("Advertisement not found.");
        }

        reply.send(advertisement);
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
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["image_url"],
          properties: {
            image_url: {
              type: "string",
            },
            is_enabled: {
              type: "boolean",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const item = await fastify.prisma.advertisements.create({
          data: {
            image_url: request.body.image_url || null,
            is_enabled: request.body.is_enabled,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `An Advertisement with Id: ${item.id} created successfully`,
        });
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
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["id", "image_url"],
          properties: {
            id: {
              type: "number",
            },
            image_url: {
              type: "string",
              nullable: true,
            },
            is_enabled: {
              type: "boolean",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // await fastify.token.isAuth(request);

        const existingItem = await fastify.prisma.advertisements.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingItem) {
          throw new Error("Advertisement not found.");
        }

        const updatedItem = await fastify.prisma.advertisements.update({
          where: {
            id: request.body.id,
          },
          data: {
            image_url: request.body.image_url || null,
            is_enabled: request.body.is_enabled,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Advertisement with Id: ${updatedItem.id} updated successfully`,
        });
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
        // await fastify.token.isAuth(request);

        const existingItem = await fastify.prisma.advertisements.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingItem) {
          throw new Error("Advertisement not found.");
        }

        const item = await fastify.prisma.advertisements.update({
          where: {
            id: request.body.id,
          },
          data: {
            deleted_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Advertisement With Id: ${item.id} deleted successfully`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/enable",
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

        const existingItem = await fastify.prisma.advertisements.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingItem) {
          throw new Error("Advertisement not found.");
        }

        const updatedItem = await fastify.prisma.advertisements.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_enabled: true,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Advertisement With Id: ${updatedItem.id} has been enabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/disable",
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

        const existingItem = await fastify.prisma.advertisements.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingItem) {
          throw new Error("Advertisement not found.");
        }

        const updatedItem = await fastify.prisma.advertisements.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_enabled: false,
            modified_at: moment().toISOString(),
          },
        });

        reply.send({
          message: `Advertisement With Id: ${updatedItem.id} has been disabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
