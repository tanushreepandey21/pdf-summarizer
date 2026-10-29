
'use server';

import { generateSummaryFromGemini } from '@/app/utils/geminiai';
import { fetchAndExtractPdfText } from '@/lib/langchain';
import { getDbConnection } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { formatFileNameAsTitle } from '@/app/utils/format-utils';

interface PdfSummaryType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

interface UploadedPdf {
  serverData: {
    userId: string;
    file: {
      url: string;
      name: string;
    };
  };
}

interface SummaryResult {
  success: boolean;
  message: string;
  data: {
    summary: string;
    title: string;
  } | null;
}

export async function generatePdfSummary(
  uploadResponse: UploadedPdf[]
): Promise<SummaryResult> {
  if (!uploadResponse?.length) {
    return {
      success: false,
      message: 'No uploaded PDF was received.',
      data: null,
    };
  }

  const uploadedFile = uploadResponse[0];
  const pdfUrl = uploadedFile?.serverData?.file?.url;
  const fileName = uploadedFile?.serverData?.file?.name;

  if (!pdfUrl || !fileName) {
    return {
      success: false,
      message: 'The uploaded PDF URL or filename is missing.',
      data: null,
    };
  }

  try {
    // Extract text from the uploaded PDF
    const pdfText = await fetchAndExtractPdfText(pdfUrl);

    if (!pdfText?.trim()) {
      return {
        success: false,
        message: 'No readable text was found in the PDF.',
        data: null,
      };
    }

    // Generate the summary using Gemini
    const summary = await generateSummaryFromGemini(pdfText);

    if (typeof summary !== 'string' || !summary.trim()) {
      return {
        success: false,
        message: 'The AI could not generate a summary.',
        data: null,
      };
    }

    // Create a readable title from the filename
    const title = formatFileNameAsTitle(fileName);

    return {
      success: true,
      message: 'Summary generated successfully.',
      data: {
        summary,
        title,
      },
    };
  } catch (error) {
    console.error('PDF summarization failed:', error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to generate the PDF summary.',
      data: null,
    };
  }
}

// Save the summary in the existing Neon database
async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType): Promise<boolean> {
  if (!userId) {
    throw new Error('A logged-in user ID is required.');
  }

  const sql = await getDbConnection();

  const result = await sql`
    INSERT INTO pdf_summaries (
      user_id,
      original_file_url,
      summary_text,
      title,
      file_name
    )
    VALUES (
      ${userId},
      ${fileUrl},
      ${summary},
      ${title},
      ${fileName}
    )
    RETURNING 1 AS saved;
  `;

  // Return true only if the database confirms an inserted row
  return Array.isArray(result) && result.length > 0;
}

// Server action called by the upload form
export async function storePdfSummaryAction({
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: 'Please sign in before saving your summary.',
      };
    }

    const saved = await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName,
    });

    if (!saved) {
      return {
        success: false,
        message: 'The database did not confirm the PDF save.',
      };
    }

    return {
      success: true,
      message: 'PDF summary saved successfully.',
    };
  } catch (error) {
    console.error('Error saving PDF summary:', error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while saving the PDF summary.',
    };
  }
}
