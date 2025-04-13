import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const USER_DOCUMENTS_KEY = (userId: string) =>
  `user:${userId}:documents`;

export const DOCUMENT_KEY = (documentId: string) => `document:${documentId}`;
