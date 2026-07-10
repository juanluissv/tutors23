import asyncHandler from '../middleware/asyncHandler.js';
import { getStudentActiveSubscription } from './subscriptionController.js';
import { VectorStoreIndex, Settings, storageContextFromDefaults } from 'llamaindex';
import dotenv from 'dotenv';
import { openai } from '@llamaindex/openai';
import {
	configureRagSettings,
	createPineconeVectorStore,
} from '../utils/ragConfig.js';
dotenv.config()

//GET /api/chat
const getChat = asyncHandler(async (req, res) => {
    const { question, id } = req.body;

    const questionTrim = String(question ?? '').trim();
    if (!questionTrim) {
        res.status(400);
        throw new Error('Question is required');
    }

    const subscription = await getStudentActiveSubscription(req.student._id);
    if (!subscription) {
        res.status(403);
        throw new Error(
            'An active subscription is required to use the AI tutor',
        );
    }

    console.log(req.body);
    Settings.llm = openai({
        model: 'gpt-4o-mini',
        apiKey: process.env.OPENAI_API_KEY // Uncomment if you want to set explicitly
    });

    configureRagSettings();

    const indexName = String(id ?? '').trim();
    if (!indexName) {
        res.status(400);
        throw new Error('Pinecone index id is required');
    }

    const vectorStore = createPineconeVectorStore(indexName);

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
    query: questionTrim,
  });
    
  //console.log('Response:');
  //console.log(result.message.content);    
  let message = result.message.content;




    res.json({message});
});




export { getChat };
