import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// No longer need to manually load dotenv. Next.js handles .env.local automatically.

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
