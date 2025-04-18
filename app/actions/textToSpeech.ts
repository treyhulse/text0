"use server";

import { ElevenLabsClient } from "elevenlabs";

export async function textToSpeech(
	text: string,
	voiceId = "21m00Tcm4TlvDq8ikWAM",
) {
	try {
		const client = new ElevenLabsClient({
			apiKey: process.env.ELEVENLABS_API_KEY,
		});

		// Convert text to speech using ElevenLabs
		const audioStream = await client.textToSpeech.convert(voiceId, {
			text,
			model_id: "eleven_multilingual_v2",
			output_format: "mp3_44100_128",
		});

		// Collect chunks from the readable stream
		const chunks: Buffer[] = [];
		for await (const chunk of audioStream) {
			chunks.push(Buffer.from(chunk));
		}

		// Combine chunks into a single buffer and convert to base64
		const audioBuffer = Buffer.concat(chunks);
		const base64Audio = audioBuffer.toString("base64");

		return {
			success: true,
			audioData: base64Audio,
			contentType: "audio/mpeg",
		};
	} catch (error) {
		console.error("Text-to-speech error:", error);
		return {
			success: false,
			error: "Failed to convert text to speech",
		};
	}
}
