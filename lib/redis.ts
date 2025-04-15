import { Redis } from "@upstash/redis";

export const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL,
	token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const USER_REFERENCES_KEY = (userId: string) =>
	`user:${userId}:references`;

export const REFERENCE_KEY = (referenceId: string) =>
	`reference:${referenceId}`;

export type Reference = {
	id: string;
	userId: string;
	url: string;
	name?: string;
	uploadedAt: string;

	chunksCount: number;
	processed: boolean;
	filename?: string;
};

export const USER_DOCUMENTS_KEY = (userId: string) => `user:${userId}:docs`;

export const DOCUMENT_KEY = (documentId: string) => `doc:${documentId}`;

export type Document = {
	id: string;
	userId: string;
	name: string;
	content: string;
	createdAt: string;
};
