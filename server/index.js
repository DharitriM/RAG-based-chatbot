import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { HuggingFaceInferenceEmbeddings as HuggingFaceEmbeddings } from '@langchain/community/embeddings/hf';
import { QdrantVectorStore } from '@langchain/qdrant';
import { ChatGroq } from '@langchain/groq';
const queue = new Queue('file-upload-queue', {
  connection: {
    host: 'localhost',
    port: '6379',
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ status: 'All Good!' });
});

app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  await queue.add(
    'file-ready',
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  return res.json({ message: 'pdf uploaded' });
});

app.post('/chat', async (req, res) => {
  try {
    const userQuery = req.body.message;

    if (!userQuery) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const embeddings = new HuggingFaceEmbeddings({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      apiKey: process.env.HUGGINGFACE_API_KEY || '', // Replace with your HF token
    });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: 'http://localhost:6333',
        collectionName: 'langchainjs-testing',
      }
    );
    const ret = vectorStore.asRetriever({
      k: 2,
    });
    const result = await ret.invoke(userQuery);

    const contextText = result.map((doc) => doc.pageContent).join('\n\n');

    const SYSTEM_PROMPT = `
    You are a helpful AI Assistant who answers the user query based on the available context from the uploaded PDF documents.
    
    Context:
    ${contextText}
    `;

    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY || '', // Replace with your Groq API key
      model: 'llama-3.1-8b-instant',
    });

    const chatResult = await llm.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userQuery },
    ]);

    return res.json({
      message: chatResult.content,
      docs: result,
    });
  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    return res.status(500).json({ error: 'Internal server error while processing the chat request.' });
  }
});

app.listen(8000, () => console.log(`Server started on PORT:${8000}`));
