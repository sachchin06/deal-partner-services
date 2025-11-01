"use strict";

const fp = require("fastify-plugin");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("fastify-multer");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

module.exports = fp(async function (fastify, opts) {
  const AWS_ACCESS_KEY_ID = fastify.config.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = fastify.config.AWS_SECRET_ACCESS_KEY;
  const AWS_REGION = fastify.config.AWS_REGION;
  const BUCKET_NAME = fastify.config.BUCKET_NAME;
  const S3_ENDPOINT = fastify.config.S3_ENDPOINT;

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: AWS_REGION,
    endpoint: S3_ENDPOINT,
    forcePathStyle: true,
  });

  const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "/tmp"); // Temporary location for storing the file before upload
      },
      filename: function (req, file, cb) {
        cb(null, `${moment().format("x")}_${file.originalname}`);
      },
    }),
  });

  fastify.decorate("upload", upload);

  // // Method to handle actual S3 upload using @aws-sdk/client-s3
  // fastify.decorate("uploadToS3", async (file) => {
  //   const fileStream = fs.createReadStream(file.path);
  //   const uploadParams = {
  //     Bucket: BUCKET_NAME,
  //     Key: `${file.filename}`, // The file name that will be saved on Backblaze
  //     Body: fileStream,
  //     ACL: "public-read", // Set the ACL policy for public-read access
  //   };

  //   try {
  //     // Uploading the file to Backblaze S3
  //     const command = new PutObjectCommand(uploadParams);
  //     const data = await s3Client.send(command);

  //     // Returning the S3 file URL after upload
  //     const fileUrl = `${S3_ENDPOINT}/${BUCKET_NAME}/${file.filename}`;
  //     return fileUrl;
  //   } catch (err) {
  //     console.error("Error uploading to S3: ", err);
  //     throw new Error("Error uploading file");
  //   } finally {
  //     // Clean up the temporary file
  //     fs.unlinkSync(file.path);
  //   }
  // });
});
