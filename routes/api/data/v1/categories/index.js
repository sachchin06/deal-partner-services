"use strict";

module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Data"],
        security: [{ bearerAuth: [] }],
      },
    },

    async (request, reply) => {
      try {
        const categories = await fastify.prisma.categories.findMany({
          where: {
            is_enabled: true,
            deleted_at: null,
          },
          select: {
            id: true,
            name: true,
            sub_categories: {
              where: {
                is_enabled: true,
                deleted_at: null,
              },
              select: {
                id: true,
                name: true,
                sub_sub_categories: {
                  where: {
                    is_enabled: true,
                    deleted_at: null,
                  },
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        reply.send(categories);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
