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
            category_id: {
              type: "integer",
              default: 1,
            },
            sub_category_id: {
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

        const categoryId = request.query.category_id;
        const subCategoryId = request.query.sub_category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("This is an invalid category Id.");
        }

        const subCategory = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: subCategoryId,
          },
        });

        if (!subCategory) {
          throw new Error("This is an invalid subCategory Id.");
        }

        const page = request.query.page;
        const limit = request.query.limit;
        const search = request.query.search;
        const is_enabled = request.query.is_enabled;
        const skip = (page - 1) * limit;

        var where = {
          category_id: categoryId,
          sub_category_id: subCategoryId,
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (is_enabled == 1) {
          where = {
            category_id: categoryId,
            sub_category_id: subCategoryId,
            deleted_at: null,
            is_enabled: true,
            OR: [{ name: { contains: search } }],
          };
        } else if (is_enabled == 0) {
          where = {
            category_id: categoryId,
            sub_category_id: subCategoryId,
            deleted_at: null,
            is_enabled: false,
            OR: [{ name: { contains: search } }],
          };
        }

        let options = {
          where,
          include: {
            categories: true,
            sub_categories: true,
          },
        };

        if (limit !== -1) {
          const skip = (page - 1) * limit;
          options = { ...options, skip, take: limit };
        }

        const subSubCategories =
          await fastify.prisma.sub_sub_categories.findMany(options);

        const totalCount = await fastify.prisma.sub_sub_categories.count({
          where: where,
        });

        const allCount = await fastify.prisma.sub_sub_categories.count({
          where: {
            category_id: categoryId,
            sub_category_id: subCategoryId,
            deleted_at: null,
          },
        });

        const totalEnabledCount = await fastify.prisma.sub_sub_categories.count(
          {
            where: {
              category_id: categoryId,
              sub_category_id: subCategoryId,
              deleted_at: null,
              is_enabled: true,
            },
          }
        );

        const totalDisabledCount =
          await fastify.prisma.sub_sub_categories.count({
            where: {
              category_id: categoryId,
              sub_category_id: subCategoryId,
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
        res.data = subSubCategories;

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
            category_ids: {
              type: "string",
              default: "[]",
            },
            sub_category_ids: {
              type: "string",
              default: "[]",
            },
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
        const { page, limit, search, is_enabled } = request.query;
        const skip = (page - 1) * limit;

        const category_ids = JSON.parse(request.query.category_ids);
        const sub_category_ids = JSON.parse(request.query.sub_category_ids);

        let where = {
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (category_ids.length > 0) {
          where.category_id = { in: category_ids };
        }

        if (sub_category_ids.length > 0) {
          where.sub_category_id = { in: sub_category_ids };
        }

        if (is_enabled === 1) {
          where.is_enabled = true;
        } else if (is_enabled === 0) {
          where.is_enabled = false;
        }

        let options = {
          where,
        };

        if (limit !== -1) {
          const skip = (page - 1) * limit;
          options = { ...options, skip, take: limit };
        }

        const subSubCategories =
          await fastify.prisma.sub_sub_categories.findMany(options);

        const totalCount = await fastify.prisma.sub_sub_categories.count({
          where: where,
        });

        const allCount = await fastify.prisma.sub_sub_categories.count({
          where: { deleted_at: null },
        });

        const totalEnabledCount = await fastify.prisma.sub_sub_categories.count(
          {
            where: {
              ...where,
              is_enabled: true,
            },
          }
        );

        const totalDisabledCount =
          await fastify.prisma.sub_sub_categories.count({
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
          data: subSubCategories,
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

        const item = await fastify.prisma.sub_sub_categories.findUnique({
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
            sub_categories: true,
            _count: {
              select: {
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
          sub_category_id: item.sub_categories.id,
          categories: item.categories,
          sub_categories: item.sub_categories,
          is_enabled: item.is_enabled,
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
            sub_category_id: {
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
        const subCategoryId = request.body.sub_category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const subCategory = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: subCategoryId,
          },
        });

        if (!subCategory) {
          throw new Error("This is an invalid subCategory Id.");
        }

        const subSubCategory = await fastify.prisma.sub_sub_categories.create({
          data: {
            name: request.body.name,
            image: request.body.image || null,
            description: request.body.description || null,
            is_enabled: request.body.is_enabled,
            category_id: categoryId,
            sub_category_id: subCategoryId,
            created_at: moment().toISOString(),
            modified_at: moment().toISOString(),
          },
          select: {
            name: true,
          },
        });

        reply.send({
          message: `Sub Sub Category '${subSubCategory.name}' created successfully`,
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
            sub_category_id: {
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
        const subCategoryId = request.body.sub_category_id;

        const category = await fastify.prisma.categories.findUnique({
          where: {
            id: categoryId,
          },
        });

        if (!category) {
          throw new Error("Category not found.");
        }

        const subCategory = await fastify.prisma.sub_categories.findUnique({
          where: {
            id: subCategoryId,
          },
        });

        if (!subCategory) {
          throw new Error("This is an invalid subCategory Id.");
        }

        const existingSubSubCategory =
          await fastify.prisma.sub_sub_categories.findUnique({
            where: {
              id: request.body.id,
            },
          });

        if (!existingSubSubCategory) {
          throw new Error("Sub Sub Category not found.");
        }

        if (
          existingSubSubCategory &&
          existingSubSubCategory.category_id != categoryId
        ) {
          throw new Error(
            `Invalid category Id for Sub Sub Category ${existingSubSubCategory.name}`
          );
        }

        if (
          existingSubSubCategory &&
          existingSubSubCategory.sub_category_id != subCategoryId
        ) {
          throw new Error(
            `Invalid Sub Category Id for Sub Sub Category ${existingSubSubCategory.name}`
          );
        }

        const item = await fastify.prisma.sub_sub_categories.findFirst({
          where: {
            name: request.body.name,
          },
          select: {
            id: true,
          },
        });

        if (item && item.id != request.body.id) {
          throw new Error(
            `The Sub Sub Category '${request.body.name}' alredy in our system.`
          );
        }

        const updatedSubSubCategory =
          await fastify.prisma.sub_sub_categories.update({
            where: {
              id: request.body.id,
            },
            data: {
              name: request.body.name,
              image: request.body.image || null,
              description: request.body.description || null,
              is_enabled: request.body.is_enabled,
              category_id: categoryId,
              sub_category_id: subCategoryId,
              modified_at: moment().toISOString(),
            },
            select: {
              id: true,
              name: true,
            },
          });

        reply.send({
          message: `Sub Sub Category '${updatedSubSubCategory.name}' updated successfully`,
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

        const subSubCategory =
          await fastify.prisma.sub_sub_categories.findUnique({
            where: {
              id: request.body.id,
            },
          });

        if (!subSubCategory) {
          throw new Error(`Sub Sub Category not found.`);
        }

        const item = await fastify.prisma.sub_sub_categories.update({
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
          message: `Sub Sub Category '${item.name}' deleted successfully`,
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

        const subSubCategory =
          await fastify.prisma.sub_sub_categories.findUnique({
            where: {
              id: request.body.id,
            },
          });

        if (!subSubCategory) {
          throw new Error("Sub Sub Category not found.");
        }

        const updatedSubSubCategory =
          await fastify.prisma.sub_sub_categories.update({
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
          message: `Sub Sub Category ${updatedSubSubCategory.name} has been enabled.`,
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

        const subSubCategory =
          await fastify.prisma.sub_sub_categories.findUnique({
            where: {
              id: request.body.id,
            },
          });

        if (!subSubCategory) {
          throw new Error("Sub Sub Category not found.");
        }

        const updatedSubSubCategory =
          await fastify.prisma.sub_sub_categories.update({
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
          message: `Sub Sub Category ${updatedSubSubCategory.name} has been disabled.`,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
