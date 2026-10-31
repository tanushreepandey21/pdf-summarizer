import { GoogleGenerativeAI } from '@google/generative-ai';
import { SUMMARY_SYSTEM_PROMPT } from './prompts';

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

const CHUNK_SIZE = 18000;

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

    if (
      currentChunk.length + paragraph.length > CHUNK_SIZE
    ) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      currentChunk = paragraph;
    } else {
      currentChunk +=
        (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function generateText(
  prompt: string,
  maxOutputTokens: number
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-flash-lite',
    generationConfig: {
      maxOutputTokens,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  if (!text?.trim()) {
    throw new Error('Empty response from Gemini AI.');
  }

  return text;
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
        3000
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

- Preserve all important topics and subtopics.
- Organize information into logical sections.
- Use # for main section headings.
- Use ## for subheadings where appropriate.
- Each major topic should have its own section.
- Preserve definitions, examples and important facts.
- Remove unnecessary repetition.
- Do not discard important information.
- Use bullet points for readability.
- Use relevant emojis sparingly.
- Do not invent facts.
- Do not include horizontal separators.
- Return only the final Markdown summary.

The final output must contain multiple meaningful
sections when the source material covers multiple topics.

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