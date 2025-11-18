"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["End User"],
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
            is_featured: {
              type: "integer",
              default: -1, // -1 for all, 1 for Featured, 0 for Not Featured
            },
            is_discount: {
              type: "integer",
              default: -1, // -1 for all, 1 for Discount, 0 for Not Discount
            },
            is_hotdeal: {
              type: "integer",
              default: -1, // -1 for all, 1 for Hotdeal, 0 for Not Hotdeal
            },
            category_ids: {
              type: "string",
              default: "[]",
            },
            sub_category_ids: {
              type: "string",
              default: "[]",
            },
            sub_sub_category_ids: {
              type: "string",
              default: "[]",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { page, limit, search, is_featured, is_discount, is_hotdeal } =
          request.query;
        const skip = (page - 1) * limit;

        const category_ids = JSON.parse(request.query.category_ids);
        const sub_category_ids = JSON.parse(request.query.sub_category_ids);
        const sub_sub_category_ids = JSON.parse(
          request.query.sub_sub_category_ids
        );

        let where = {
          is_enabled: true,
          deleted_at: null,
          OR: [{ name: { contains: search } }],
        };

        if (is_featured === 1) {
          where.is_featured = true;
        } else if (is_featured === 0) {
          where.is_featured = false;
        }

        if (is_discount === 1) {
          where.discount_percent = {
            gt: 0,
          };
        }

        if (is_discount === 0) {
          where.OR = [{ discount_percent: null }, { discount_percent: 0 }];
        }
        if (is_hotdeal === 1) {
          where.hot_deal_end_at = {
            not: null,
          };
        } else if (is_hotdeal === 0) {
          where.hot_deal_end_at = null;
        }

        if (category_ids.length > 0) {
          where.category_id = { in: category_ids };
        }

        const categoryCount = await fastify.prisma.items.count({
          where: where,
        });

        if (sub_category_ids.length > 0) {
          where.sub_category_id = { in: sub_category_ids };
        }

        const subCategoryCount = await fastify.prisma.items.count({
          where: where,
        });

        if (sub_sub_category_ids.length > 0) {
          where.sub_sub_category_id = { in: sub_sub_category_ids };
        }

        const subSubCategoryCount = await fastify.prisma.items.count({
          where: where,
        });

        const totalCount = await fastify.prisma.items.count({
          where: where,
        });

        const allCount = await fastify.prisma.items.count({
          where: { deleted_at: null },
        });

        const items = await fastify.prisma.items.findMany({
          where: where,
          skip: skip,
          take: limit,
          include: {
            item_properties: true,
            item_features: true,
            item_images: true,
            item_embeds: true,
          },
        });

        var count = {};
        count.all = allCount;
        count.categoryCount = categoryCount;
        count.subCategoryCount = subCategoryCount;
        count.subSubCategoryCount = subSubCategoryCount;

        const totalPages = Math.ceil(totalCount / limit);

        const res = {
          page: page,
          limit: limit,
          totalPages: totalPages,
          totalCount: totalCount,
          count: count,
          data: items,
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
        tags: ["End User"],
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

        const item = await fastify.prisma.items.findUnique({
          where: {
            id: request.params.id,
          },
          include: {
            item_properties: true,
            item_features: true,
            item_images: true,
            item_embeds: true,
          },
        });

        if (!item) {
          throw new Error("Item not found.");
        }

        reply.send(item);
      } catch (error) {
        reply.send({
          error: error.message,
        });
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
