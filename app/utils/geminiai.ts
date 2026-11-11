import { GoogleGenerativeAI } from '@google/generative-ai';
import { SUMMARY_SYSTEM_PROMPT } from './prompts';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is missing in .env.local');
}

const genAI = new GoogleGenerativeAI(apiKey);

// CHANGED: bigger chunks = fewer API calls = fewer chances to fail
const CHUNK_SIZE = 60000;

// NEW: main model + backup model
const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODEL = 'gemini-2.5-flash';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function splitIntoChunks(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/);

  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (paragraph.length > CHUNK_SIZE) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      for (let i = 0; i < paragraph.length; i += CHUNK_SIZE) {
        chunks.push(paragraph.slice(i, i + CHUNK_SIZE));
      }

      continue;
    }

    if (currentChunk.length + paragraph.length > CHUNK_SIZE) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// CHANGED: now retries on 503/429/500 and falls back to a second model
async function generateText(
  prompt: string,
  maxOutputTokens: number
): Promise<string> {
  let lastError: any;

  for (const modelName of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens,
      },
    });

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        console.log('finishReason:', response.candidates?.[0]?.finishReason);

        const text = response.text();

        if (!text?.trim()) {
          throw new Error('Empty response from Gemini AI.');
        }

        return text;
      } catch (err: any) {
        lastError = err;

        const retryable =
          err?.status === 503 || err?.status === 429 || err?.status === 500;

        // Bad API key, bad request, empty response etc. -> don't retry
        if (!retryable) throw err;

        console.warn(
          `${modelName} failed (${err.status}), attempt ${attempt + 1}/4`
        );

        // wait 1s, 2s, 4s, 8s (plus a little randomness)
        await sleep(1000 * 2 ** attempt + Math.random() * 500);
      }
    }
  }

  throw lastError;
}

export const generateSummaryFromGemini = async (
  pdfText: string
): Promise<string> => {
  try {
    const chunks = splitIntoChunks(pdfText);

    if (!chunks.length) {
      throw new Error('No readable PDF content found.');
    }

    console.log(`PDF divided into ${chunks.length} chunks.`);

    const chunkSummaries: string[] = [];

    // Stage 1: Summarize each chunk separately.
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Summarizing chunk ${i + 1}/${chunks.length}`);

      const chunkSummary = await generateText(
        `
You are summarizing part ${i + 1} of ${chunks.length}
of a larger PDF document.

Summarize this portion in detail.

Instructions:
- Preserve important concepts, definitions and examples.
- Use meaningful Markdown headings.
- Keep related information together.
- Do not invent information.
- Do not assume this is the entire document.
- Avoid repeating information unnecessarily.
- Return only the summary.

${SUMMARY_SYSTEM_PROMPT}

DOCUMENT SECTION:

${chunks[i]}
        `,
        4000
      );

      chunkSummaries.push(chunkSummary);
    }

    // Stage 2: Combine all chunk summaries.
    console.log('Combining chunk summaries...');

    const finalSummary = await generateText(
      `
You are an expert document summarization assistant.

The following are summaries of different portions
of the SAME PDF document.

Combine them into ONE comprehensive and coherent summary.

IMPORTANT INSTRUCTIONS:

CONTENT:
- Preserve all important topics, definitions, examples and facts.
- Remove unnecessary repetition.
- Do not invent facts.
- Use relevant emojis sparingly.

FORMAT (follow exactly, the output is split into slides):
- Do NOT write a top-level "# " title.
- Start directly with the first "## Section Title".
- Use only "## " headings. Never use "#" or "###".
- Every section MUST have 3 to 6 bullet points, each starting with "- "
  and written on a single line.
- Never write a heading without bullet points directly under it.
- Do not use bold text as a replacement for headings.
- Do not use horizontal rules (---).
- Return only the final Markdown summary.
CHUNK SUMMARIES:

${chunkSummaries
  .map(
    (summary, index) =>
      `\n\nCHUNK ${index + 1} SUMMARY:\n${summary}`
  )
  .join('\n\n')}
      `,
      8192
    );

    return finalSummary;
  } catch (error: any) {
    if (error?.status === 429) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    console.error('Gemini API Error:', error);
    throw error;
  }
};