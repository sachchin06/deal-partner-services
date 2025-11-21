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
            category_id: {
              type: "integer",
              default: 1,
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

        const categoryId = request.query.category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("This is an invalid category Id.");
        }

        const page = request.query.page;
        const limit = request.query.limit;
        const search = request.query.search;
        const is_enabled = request.query.is_enabled;
        const skip = (page - 1) * limit;

        var where = {
          category_id: categoryId,
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (is_enabled == 1) {
          where = {
            category_id: categoryId,
            deleted_at: null,
            is_enabled: true,
            OR: [{ name: { contains: search } }],
          };
        } else if (is_enabled == 0) {
          where = {
            category_id: categoryId,
            deleted_at: null,
            is_enabled: false,
            OR: [{ name: { contains: search } }],
          };
        }

        let options = {
          where,
          include: {
            categories: true,
          },
        };

        if (limit !== -1) {
          const skip = (page - 1) * limit;
          options = { ...options, skip, take: limit };
        }

        const subCategories = await fastify.prisma.sub_categories.findMany(
          options
        );

        const totalCount = await fastify.prisma.sub_categories.count({
          where: where,
        });

        const allCount = await fastify.prisma.sub_categories.count({
          where: {
            category_id: categoryId,
            deleted_at: null,
          },
        });

        const totalEnabledCount = await fastify.prisma.sub_categories.count({
          where: {
            category_id: categoryId,
            deleted_at: null,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.sub_categories.count({
          where: {
            category_id: categoryId,
            deleted_at: null,
            is_enabled: false,
          },
        });

        var count = {};
        count.all = allCount;
        count.enabled = totalEnabledCount;
        count.disabled = totalDisabledCount;

        const totalPages = limit !== -1 ? Math.ceil(totalCount / limit) : 1;

        var res = {};
        res.page = page;
        res.limit = limit;
        res.totalPages = totalPages;
        res.totalCount = totalCount;
        res.count = count;
        res.data = subCategories;

        reply.send(res);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.get(
    "/all",
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
            category_ids: {
              type: "string",
              default: "[]",
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
        // Authenticate the user
        // await fastify.token.isAuth(request);

        const page = request.query.page;
        const limit = request.query.limit;
        const search = request.query.search;
        const is_enabled = request.query.is_enabled;
        const category_ids = JSON.parse(request.query.category_ids);

        const skip = (page - 1) * limit;

        let where = {
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (category_ids.length > 0) {
          where.category_id = { in: category_ids };
        }

        if (is_enabled == 1) {
          where.is_enabled = true;
        } else if (is_enabled == 0) {
          where.is_enabled = false;
        }

        let options = {
          where,
        };

        if (limit !== -1) {
          const skip = (page - 1) * limit;
          options = { ...options, skip, take: limit };
        }

        const subCategories = await fastify.prisma.sub_categories.findMany(
          options
        );

        const totalCount = await fastify.prisma.sub_categories.count({
          where,
        });

        const allCount = await fastify.prisma.sub_categories.count({
          where: { deleted_at: null },
        });

        const totalEnabledCount = await fastify.prisma.sub_categories.count({
          where: {
            ...where,
            is_enabled: true,
          },
        });

        const totalDisabledCount = await fastify.prisma.sub_categories.count({
          where: {
            ...where,
            is_enabled: false,
          },
        });

        var count = {};
        count.all = allCount;
        count.enabled = totalEnabledCount;
        count.disabled = totalDisabledCount;

        const totalPages = limit !== -1 ? Math.ceil(totalCount / limit) : 1;

        const res = {
          page: page,
          limit: limit,
          totalPages: totalPages,
          totalCount: totalCount,
          count: count,
          data: subCategories,
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

        const item = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: request.params.id,
          },
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            is_enabled: true,
            categories: true,
            _count: {
              select: {
                sub_sub_categories: true,
                items: true,
              },
            },
          },
        });

        const res = {
          id: item.id,
          name: item.name,
          description: item.description,
          image: item.image,
          category_id: item.categories.id,
          categories: item.categories,
          is_enabled: item.is_enabled,
          total_sub_sub_category_Count: item._count.sub_sub_categories,
          total_items_count: item._count.items,
        };

        reply.send(res);
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
          required: ["name"],
          properties: {
            category_id: {
              type: "integer",
              default: 1,
            },
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
        // await fastify.token.isAuth(request);

        const categoryId = request.body.category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const subCategory = await fastify.prisma.sub_categories.create({
          data: {
            name: request.body.name,
            image: request.body.image || null,
            description: request.body.description || null,
            is_enabled: request.body.is_enabled,
            category_id: categoryId,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
          select: {
            name: true,
          },
        });

        reply.send({
          message: `Sub Category '${subCategory.name}' created successfully`,
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
          required: ["id", "name"],
          properties: {
            id: {
              type: "number",
            },
            category_id: {
              type: "integer",
              default: 1,
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
        // await fastify.token.isAuth(request);

        const categoryId = request.body.category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const existingSubCategory =
          await fastify.prisma.sub_categories.findUnique({
            where: {
              id: request.body.id,
            },
          });

        if (!existingSubCategory) {
          throw new Error("Sub Category not found.");
        }

        if (
          existingSubCategory &&
          existingSubCategory.category_id != categoryId
        ) {
          throw new Error(
            `Invalid category Id for Sub Category ${existingSubCategory.name}`
          );
        }

        const item = await fastify.prisma.sub_categories.findFirst({
          where: {
            name: request.body.name,
          },
          select: {
            id: true,
          },
        });

        if (item && item.id != request.body.id) {
          throw new Error(
            `The Sub Category '${request.body.name}' alredy in our system.`
          );
        }

        const updatedSubCategory = await fastify.prisma.sub_categories.update({
          where: {
            id: request.body.id,
          },
          data: {
            name: request.body.name,
            image: request.body.image || null,
            description: request.body.description || null,
            is_enabled: request.body.is_enabled,
            category_id: categoryId,
            modified_at: moment().toISOString(),
          },
          select: {
            id: true,
            name: true,
          },
        });

        reply.send({
          message: `Sub Category '${updatedSubCategory.name}' updated successfully`,
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

        const subCategories = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!subCategories) {
          throw new Error(`Sub Category not found.`);
        }

        const item = await fastify.prisma.sub_categories.update({
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

        reply.send({
          message: `Sub Category '${item.name}' deleted successfully`,
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

        const subCategory = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!subCategory) {
          throw new Error("Sub Category not found.");
        }

        const updatedSubCategory = await fastify.prisma.sub_categories.update({
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
          message: `Sub Category ${updatedSubCategory.name} has been enabled.`,
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

        const subCategory = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: request.body.id,
          },
        });

        if (!subCategory) {
          throw new Error("Sub Category not found.");
        }

        const updatedSubCategory = await fastify.prisma.sub_categories.update({
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
          message: `Sub Category ${updatedSubCategory.name} has been disabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
