import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY || "",
  characteristics: ["userId"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 20,
      interval: 3600,
      capacity: 30,
    }),
  ],
});

export default aj;
