"use strict";

module.exports = async function (fastify, opts) {
  fastify.get(
    "/counts",
    {
      schema: {
        tags: ["Admin Dashboard"],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      try {
        const [
          totalItems,
          hotDealItems,
          discountItems,
          featuredItems,
          soldItems,
          totalCategories,
          totalSubCategories,
          totalSubSubCategories,
          totalUsers,
          totalReviews,
        ] = await Promise.all([
          fastify.prisma.items.count({
            where: {
              is_enabled: true,
              deleted_at: null,
            },
          }),
          fastify.prisma.items.count({
            where: {
              is_enabled: true,
              deleted_at: null,
              hot_deal_end_at: { not: null },
            },
          }),
          fastify.prisma.items.count({
            where: {
              is_enabled: true,
              deleted_at: null,
              discount_percent: { gt: 0 },
            },
          }),
          fastify.prisma.items.count({
            where: {
              is_enabled: true,
              deleted_at: null,
              is_featured: true,
            },
          }),
          fastify.prisma.items.count({
            where: {
              is_enabled: true,
              deleted_at: null,
              is_sold: true,
            },
          }),

          fastify.prisma.categories.count({
            where: { is_enabled: true, deleted_at: null },
          }),
          fastify.prisma.sub_categories.count({
            where: { is_enabled: true, deleted_at: null },
          }),
          fastify.prisma.sub_sub_categories.count({
            where: { is_enabled: true, deleted_at: null },
          }),

          fastify.prisma.users.count({
            where: { deleted_at: null },
          }),
          fastify.prisma.reviews.count({
            where: { deleted_at: null },
          }),
        ]);

        const responseData = {
          total_items: totalItems,
          hot_deal_items: hotDealItems,
          discount_items: discountItems,
          featured_items: featuredItems,
          sold_items: soldItems,
          total_categories: totalCategories,
          total_sub_categories: totalSubCategories,
          total_sub_sub_categories: totalSubSubCategories,
          total_users: totalUsers,
          total_reviews: totalReviews,
        };

        reply.send(responseData);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
