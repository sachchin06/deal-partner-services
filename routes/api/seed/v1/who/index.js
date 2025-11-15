"use strict";

const moment = require("moment");
module.exports = async function (fastify, opts) {
  fastify.get(
    "",
    {
      schema: {
        tags: ["Seed"],
      },
    },
    async (request, reply) => {
      try {
        await fastify.prisma.who.deleteMany({});
        const datas = [
          {
            key: "What We Offer",
            value:
              "A wide range of property options, personalized guidance, and expert support in finding the ideal location.",
          },
          { key: "heading", value: "Lorem Ipsum Heading" },
          {
            key: "description",
            value:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          },
          {
            key: "image",
            value: "https://dummyimage.com/600x400/000/fff&text=Sample+Image",
          },
          { key: "email", value: "example@example.com" },
          { key: "facebook", value: "https://www.facebook.com/example" },
          { key: "instagram", value: "https://www.instagram.com/example" },
          {
            key: "linkedin",
            value: "https://www.linkedin.com/company/example",
          },
          { key: "twitter", value: "https://www.twitter.com/example" },
          { key: "address", value: "1234 Example Street" },
          { key: "state", value: "Example State" },
          { key: "country", value: "Example Country" },
          { key: "zip", value: "123456" },
          { key: "phone_1", value: "+1234567890" },
          { key: "phone_2", value: "+0987654321" },
        ];

        const promises = datas.map((entry) =>
          fastify.prisma.who.create({
            data: {
              key: entry.key,
              value: entry.value,
              created_at: moment().toISOString(),
              modified_at: moment().toISOString(),
            },
          })
        );

        const resp = await Promise.all(promises);
        reply.send(resp);
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
