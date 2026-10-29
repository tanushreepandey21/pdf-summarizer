
'use client';

import {generatePdfSummary,storePdfSummaryAction,} from '@/actions/upload-actions';
import UploadFormInput from '@/components/upload/upload-form-input';
import type { SyntheticEvent } from 'react';
import { z } from 'zod';
import { useUploadThing } from '@/app/utils/uploadthing';
import { toast } from 'sonner';

const schema = z.object({
  file: z
    .instanceof(File, { message: 'Invalid file' })
    .refine(
      (file) => file.size <= 20 * 1024 * 1024,
      'File size must be less than 20MB'
    )
    .refine(
      (file) => file.type === 'application/pdf',
      'File must be a PDF'
    ),
});

export default function UploadForm() {
  const { startUpload } = useUploadThing('pdfUploader', {
    onClientUploadComplete: () => {
      toast.success('PDF uploaded successfully!');
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file');

    if (!(file instanceof File)) {
      toast.error('Please select a PDF file.');
      return;
    }

    const validatedFields = schema.safeParse({ file });

    if (!validatedFields.success) {
      toast.error(
        validatedFields.error.flatten().fieldErrors.file?.[0] ??
          'Invalid file'
      );
      return;
    }

    try {
      // 1. Upload the PDF
      const resp = await startUpload([file]);

      if (!resp?.length) {
        toast.error('Upload failed. Please try again.');
        return;
      }

      // 2. Generate the AI summary
      toast.info('Our AI is reading your PDF...');

      const result = await generatePdfSummary(
        resp as Parameters<typeof generatePdfSummary>[0]
      );

      if (!result.success || !result.data) {
        toast.error(result.message);
        return;
      }

      // 3. Save the summary to Neon
      toast.info('Saving your PDF summary...');

      const saveResult = await storePdfSummaryAction({
        summary: result.data.summary,
        title: result.data.title,
        fileUrl: resp[0].serverData.file.url,
        fileName: file.name,
      });

      if (!saveResult.success) {
        toast.error(saveResult.message);
        return;
      }

      // 4. Confirm success
      toast.success('Your PDF summary has been saved!');
    } catch (error) {
      console.error('PDF upload or saving failed:', error);
      toast.error('Failed to generate or save the PDF summary.');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput onSubmit={handleSubmit} />
    </div>
  );
}
