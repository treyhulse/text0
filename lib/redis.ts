import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const USER_DOCUMENTS_KEY = (userId: string) =>
  `user:${userId}:documents`;

export const DOCUMENT_KEY = (documentId: string) => `document:${documentId}`;

export const NOTE_KEY = (noteId: string) => `note:${noteId}`;

export const USER_NOTES_KEY = (userId: string) => `user:${userId}:notes`;

export type Note = {
  id: string;
  userId: string;
  name: string;
  content: string;
  createdAt: string;
};
