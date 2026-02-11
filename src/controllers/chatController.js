import asyncHandler from '../middleware/asyncHandler.js';
import { VectorStoreIndex, Settings, storageContextFromDefaults } from 'llamaindex';
import { PineconeVectorStore } from "@llamaindex/pinecone";

import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from 'dotenv';
import { openai, OpenAIEmbedding } from '@llamaindex/openai';
dotenv.config()

//GET /api/chat
const getChat = asyncHandler(async (req, res) => {

    const { question } = req.body;
    console.log(question);

    //const message = "The world didn’t end with a bang, but with a slow, rhythmic hum that only the young could hear. For Elias, a thirty-four-year-old aquarium installer living in a quiet coastal town, the hum was just a background noise he assumed was his tinnitus—until the day the sea lions stopped swimming. It was Tuesday, and Elias was working on a custom tank for a local library. He was meticulous, arranging birch bark and smooth river stones to mimic a mountain stream. He loved the silence of underwater work, the way the world felt partial when his head was submerged. But when he surfaced, the library was in chaos. A girl named Phoenix, about five years old and still wearing her Santa pajama top in September, grabbed his wet sleeve. The big fish are walking, she whispered. Elias walked to the window. Outside, the tide hadn't just gone out; it had vanished. In its place, the wet sand was teeming with thousands of silver-scaled creatures that looked like eels, but they were moving with purpose toward the town square. He remembered an old story his grandfather told him about releasing resolutions before they reached them. If the ocean decided to move inland, there was no use fighting it. He found himself walking toward the shore, passing a haunted vending machine that was spitting out coins and a woman named Eleanore who was methodically throwing jewelry into the street, claiming she was marrying the wealthiest man just to give his money away. At the edge of the town, where the cedar trees met the salt spray, Elias saw her. She was a woman he hadnt seen in six years, a duchess of secrets from his past who always appeared right before a major life change. She held out a compass made of bread and mosaic glass. The days are getting shorter, Elias, she said, her voice sounding like a radio frequency from 1988. If we dont find the rhythm of the hum, well be left in the dark. Together, they followed the silver trail of the eels. They didn't find a monster or a god; they found a portal that looked like a simple, unlocked school door. Inside wasn't another world, but a library of everyone’s what if moments—every choice they didn't make, every word they didn't say. Elias looked at his own shelf. It was full of tanks he had never built and oceans he had never seen. He realized that the hum wasn't a warning; it was a prompt. As the first winter storm of the season began to howl outside, Elias didn't run. He picked up a pen he found on a nearby desk—a purple Sharpie—and began to write his own ending. He didn't write about escaping; he wrote about the smell of citrus and the way the rain felt against the glass, deciding that for the first time, he was exactly where he needed to be"


    Settings.llm = openai({
        model: 'gpt-4o-mini',
        apiKey: process.env.OPENAI_API_KEY // Uncomment if you want to set explicitly
    });

    Settings.embedModel = new OpenAIEmbedding({
        model: 'text-embedding-3-small'
    });

    const pc = new Pinecone({
        apiKey: 'pcsk_3nnCur_4aDmfdwCBCVgLeaHcG7ADtU3r6UJ87vSBZNySGrjsA5hVGQtY4uU3YvTwtKUKw1',
      });

      const pineconeIndex = pc.index('langchain-docs');

      const vectorStore = new PineconeVectorStore({
        pineconeIndex,
        indexName: 'langchain-docs',
      });

      const storageContext = await storageContextFromDefaults({
        vectorStore,
      });

      const index = await VectorStoreIndex.fromVectorStore(
        vectorStore,
        storageContext
      );


      const queryEngine = index.asQueryEngine();
  const result = await queryEngine.query({
    //query: 'please give me the main points of the entire report and the main advice?',
    query: question
  });
    
  console.log('Response:');
  console.log(result.message.content);    
  let message = result.message.content;




    res.json({message});
});




export { getChat };