import asyncHandler from '../middleware/asyncHandler.js';
import OpenAI from 'openai';
import { playAudio } from "openai/helpers/audio";
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// POST /api/tts
const generateSpeech = asyncHandler(async (req, res) => {
    const { text } = req.body;

    if (!text) {
        res.status(400);
        throw new Error('Text is required');
    }

    try {
        // Create streaming audio response - WAV format for fastest playback
        const response = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "marin", // Options: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer, verse, marin, cedar
            input: text,
            response_format: "wav" // WAV for lowest latency
        });

        // Set headers for streaming with chunked transfer encoding
        res.set({
            'Content-Type': 'audio/wav',
            'Transfer-Encoding': 'chunked',
        });
        
        // Get the Web Stream reader
        const stream = response.body;
        const reader = stream.getReader();
        
        // Read and write chunks as they arrive
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value); // Write chunk to response
            }
            res.end(); // Close the response when done
        } finally {
            reader.releaseLock();
        }
        
    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500);
        throw new Error('Error generating speech');
    }
});

export { generateSpeech };
