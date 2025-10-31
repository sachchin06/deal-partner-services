"use strict";

const fp = require("fastify-plugin");
var AWS = require("aws-sdk");
const moment = require("moment");
const multer = require("fastify-multer");
const multerS3 = require("multer-s3");

module.exports = fp(async function (fastify, opts) {
  const AWS_ACCESS_KEY_ID = fastify.config.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = fastify.config.AWS_SECRET_ACCESS_KEY;
  const AWS_REGION = fastify.config.AWS_REGION;
  const BUCKET_NAME = fastify.config.BUCKET_NAME;
  const SPACE_DIR = fastify.config.SPACE_DIR;

  console.log(BUCKET_NAME);

  // Create an S3 client
  const s3Client = new AWS.S3({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: BUCKET_NAME,
      acl: "public-read",
      contentDisposition: "inline", // Ensure content disposition is set to inline
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(
          null,
          `${SPACE_DIR}/${file.fieldname}/${
            req.query.model_name
          }/${moment().format("x")}_${file.originalname}`
        );
      },
      contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set the correct content type
    }),
  });

  fastify.register(multer.contentParser);
  fastify.decorate("upload", upload);
});
