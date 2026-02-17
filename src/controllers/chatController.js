import asyncHandler from '../middleware/asyncHandler.js';
import { VectorStoreIndex, Settings, storageContextFromDefaults } from 'llamaindex';
import { PineconeVectorStore } from "@llamaindex/pinecone";

import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from 'dotenv';
import { openai, OpenAIEmbedding } from '@llamaindex/openai';
dotenv.config()

//GET /api/chat
const getChat = asyncHandler(async (req, res) => {

    const { question, id } = req.body;

    

    console.log(req.body);
    Settings.llm = openai({
        model: 'gpt-4o-mini',
        apiKey: process.env.OPENAI_API_KEY // Uncomment if you want to set explicitly
    });

    Settings.embedModel = new OpenAIEmbedding({
        model: 'text-embedding-ada-002'  // This model produces exactly 1536 dimensions
    });

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });

      const pineconeIndex = pc.index(id);
      //console.log(pineconeIndex);

      const vectorStore = new PineconeVectorStore({
        pineconeIndex,
        indexName: id,
      });
      //console.log(vectorStore);

      const storageContext = await storageContextFromDefaults({
        vectorStore,
      });
      // console.log(storageContext);

      const index = await VectorStoreIndex.fromVectorStore(
        vectorStore,
        storageContext
      );
        //console.log(index);

      const queryEngine = index.asQueryEngine();
  const result = await queryEngine.query({
    query: question
  });
    
  //console.log('Response:');
  //console.log(result.message.content);    
  let message = result.message.content;




    res.json({message});
});




export { getChat };