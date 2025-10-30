"use strict";
const moment = require("moment");

module.exports = async function (fastify, opts) {
  fastify.post(
    "/send-otp",
    {
      schema: {
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await fastify.prisma.users.findUnique({
          where: {
            email: request.body.email,
          },
          select: {
            id: true,
            user_name: true,
            email: true,
            otp_count: true,
            last_otp_at: true,
            display_name: true,
            deleted_at: true,
          },
        });
        if (!user) {
          throw new Error("Email is incorrect.");
        }

        if (user.deleted_at) {
          throw new Error("Your account is deleted.");
        }

        const currentTime = moment();
        const oneHourAgo = moment().subtract(1, "hours");

        if (
          user.last_otp_at &&
          moment(user.last_otp_at).isAfter(oneHourAgo) &&
          user.otp_count >= 5
        ) {
          throw new Error(
            "You have exceeded the OTP request limit. Please try again later."
          );
        }

        // Reset OTP count if last OTP was sent more than an hour ago
        let otpCount = user.otp_count;
        if (
          !user.last_otp_at ||
          moment(user.last_otp_at).isBefore(oneHourAgo)
        ) {
          otpCount = 0;
        }

        // Generate OTP and update OTP count and last_otp_at
        const code = await fastify.otp.generateOtp(6);

        await fastify.prisma.users.update({
          where: { id: user.id },
          data: {
            otp: code,
            otp_count: otpCount + 1, // Increment otp_count
            last_otp_at: currentTime.toDate(),
          },
        });

        let emailParams = {
          email: user.email,
          subject: `Deal Partner OTP Code`,
          message: `
          Hello ${user.user_name}, 
          
          Your One-Time Password (OTP) for Deal Partner sign-in is:

          OTP: ${code}
          
          This OTP is valid for 5 minutes.`,
        };
        await fastify.email.send(fastify, emailParams);

        reply.send({ message: "OTP sent successfully" });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );

  fastify.post(
    "/check-otp",
    {
      schema: {
        tags: ["Auth"],
        body: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: {
              type: "string",
            },
            otp: {
              type: "string",
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await fastify.prisma.users.findUnique({
          where: {
            email: request.body.email,
          },
          select: {
            id: true,
            user_name: true,
            email: true,
            otp: true,
            otp_count: true,
            last_otp_at: true,
            display_name: true,
            deleted_at: true,
          },
        });

        if (user.otp != request.body.otp) {
          throw new Error("Invalid OTP");
        }

        var now = moment();
        if (
          now.diff(moment(user.last_otp_at).add(5, "minutes"), "minutes") > 0
        ) {
          throw new Error("OTP is expired,Try again");
        }

        const token = fastify.jwt.sign({
          id: user.id,
          email: user.email.name,
          user_name: user.user_name,
        });

        reply.send({
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          user_name: user.user_name,
          token: token,
        });
      } catch (error) {
        reply.send(error);
      } finally {
        await fastify.prisma.$disconnect();
      }
    }
  );
};
