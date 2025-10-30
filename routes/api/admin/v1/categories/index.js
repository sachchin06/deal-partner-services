"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Main Category"],
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
        await fastify.token.isAuth(request);

        const page = request.query.page;
        const limit = request.query.limit;
        const search = request.query.search;
        const skip = (page - 1) * limit;

        var where = {
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        const categories = await fastify.prisma.categories.findMany({
          where: where,
          skip: skip,
          take: limit,
        });

        const totalCount = await fastify.prisma.categories.count({
          where: where,
        });

        const totalPages = Math.ceil(totalCount / limit);

        var res = {
          page: page,
          limit: limit,
          totalPages: totalPages,
          totalCount: totalCount,
          data: categories,
        };

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
        tags: ["Main Category"],
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

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: request.params.id,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        reply.send(category);
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
        tags: ["Main Category"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
            },
            image: {
              type: "string",
            },
            description: {
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
        await fastify.token.isAuth(request);

        const item = await fastify.prisma.categories.findFirst({
          where: {
            name: request.body.name,
          },
        });
        if (item) {
          throw new Error("The category name alredy in our system.");
        }
        const category = await fastify.prisma.categories.create({
          data: {
            name: request.body.name,
            image: request.body.image || null,
            description: request.body.description || null,
            is_enabled: request.body.is_enabled,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
        });

        reply.send(category);
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
        tags: ["Main Category"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["id", "name"],
          properties: {
            id: {
              type: "number",
            },
            name: {
              type: "string",
            },
            image: {
              type: "string",
              nullable: true,
            },
            description: {
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
        await fastify.token.isAuth(request);

        const existingCategory = await fastify.prisma.categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!existingCategory) {
          throw new Error("Category not found.");
        }

        const item = await fastify.prisma.categories.findFirst({
          where: {
            name: request.body.name,
          },
          select: {
            id: true,
          },
        });

        if (item && item.id != request.body.id) {
          throw new Error("The category name alredy in our system.");
        }

        const updatedCategory = await fastify.prisma.categories.update({
          where: {
            id: request.body.id,
          },
          data: {
            name: request.body.name,
            image: request.body.image || null,
            description: request.body.description || null,
            is_enabled: request.body.is_enabled,
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            name: true,
            image: true,
            description: true,
            is_enabled: true,
            created_at: true,
            modified_at: true,
          },
        });

        reply.send(updatedCategory);
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
        tags: ["Main Category"],
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
        await fastify.token.isAuth(request);

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const item = await fastify.prisma.categories.update({
          where: {
            id: request.body.id,
          },
          data: {
            deleted_at: moment().toISOString(),
          },
          select: {
            id: true,
            name: true,
          },
        });

        reply.send({ message: `Category '${item.name}' deleted successfully` });
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
        tags: ["Main Category"],
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
        await fastify.token.isAuth(request);

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const updatedCategory = await fastify.prisma.categories.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_enabled: true,
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            name: true,
            is_enabled: true,
            modified_at: true,
          },
        });

        reply.send({
          message: `Category ${updatedCategory.name} has been enabled.`,
          data: updatedCategory,
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
        tags: ["Main Category"],
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
        await fastify.token.isAuth(request);

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const updatedCategory = await fastify.prisma.categories.update({
          where: {
            id: request.body.id,
          },
          data: {
            is_enabled: false,
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            name: true,
            is_enabled: true,
            modified_at: true,
          },
        });

        reply.send({
          message: `Category ${updatedCategory.name} has been disabled.`,
          data: updatedCategory,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
