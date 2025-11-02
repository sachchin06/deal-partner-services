"use strict";
const AWS = require("aws-sdk");
const fp = require("fastify-plugin");
const moment = require("moment");

module.exports = fp(async function (fastify, opts) {
  const AWS_ACCESS_KEY_ID = fastify.config.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = fastify.config.AWS_SECRET_ACCESS_KEY;
  const AWS_REGION = fastify.config.AWS_REGION;
  const BUCKET_NAME = fastify.config.BUCKET_NAME;
  const S3_ENDPOINT = fastify.config.S3_ENDPOINT;

  const s3 = new AWS.S3({
    endpoint: S3_ENDPOINT,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    s3ForcePathStyle: true,
    signatureVersion: "v4",
  });

  fastify.register(require("fastify-multipart"));
  fastify.decorate("uploadToS3", async (file, modelName) => {
    const fileName = `${modelName}_${moment().format("x")}_${file.filename}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.file,
    };

    try {
      const uploadResult = await s3.upload(params).promise();
      return { success: true, data: uploadResult };
    } catch (error) {
      throw new Error(error.message);
    }
  });
});
