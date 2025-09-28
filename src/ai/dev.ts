import { config } from 'dotenv';
config({ path: '.env.local' });

import '@/ai/flows/chat-with-gemini.ts';
import '@/ai/flows/suggest-task-priorities.ts';
