import asyncHandler from '../middleware/asyncHandler.js';
import OpenAI from 'openai';
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
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy", // Options: alloy, echo, fable, onyx, nova, shimmer
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
        });
        
        res.send(buffer);
    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500);
        throw new Error('Error generating speech');
    }
});

export { generateSpeech };
