'use client';
import { generatePdfSummary } from '@/actions/upload-actions';
import UploadFormInput from '@/components/upload/upload-form-input';
import type {SyntheticEvent} from 'react';
import { z } from 'zod';
import { useUploadThing } from '@/app/utils/uploadthing';
import { toast } from "sonner";

const schema = z.object({
  file: z
  .instanceof(File, {message: 'invalid file'})
  .refine(
    (file) => file.size <= 20 * 1024 * 1024,
    'File size must be less than 20MB'
  )
  .refine(
    (file) => file.type.startsWith('application/pdf'),
    'File must be PDf'
  ),
});

export default function UploadForm() {
  
const { startUpload, routeConfig } = useUploadThing(
  "pdfUploader",
  {
    onClientUploadComplete: () => {
      toast.success("PDF uploaded successfully!");
    },

    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },

    onUploadBegin: (file) => {
      toast.info(`Uploading ${file}...`);
    },
  }
);

  const handleSubmit = async (e: React.
    SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('submitted');
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    // Validating the fields
    const validatedFields = schema.safeParse({file});

    console.log(validatedFields);

    if(!validatedFields.success){
      toast.error(
        validatedFields.error.flatten().fieldErrors.file?.
        [0] ?? 'Invalid file'
      );
      return;
    }
    // Schema with zod
    // Upload the file to uploadthing
    const resp = await startUpload([file]);
    if (!resp) {
      toast.error("Upload failed.Please try Again.")
      return;
    }

    toast.info(
  "Hang tight! Our AI is reading through your document!"
   );
    // Parse the PDF using lang chain
   if (resp.length === 0) {
  toast.error("Upload completed, but no file data was returned.");
  return;
}

try {
  const summary = await generatePdfSummary(
    resp as [typeof resp[0]]
  );

  console.log({ summary });

  if (!summary?.success) {
    toast.error(summary?.message ?? "Failed to generate summary.");
    return;
  }

  toast.success("Summary generated successfully!");
} catch (error) {
  console.error("PDF summarization failed:", error);
  toast.error("Failed to generate the PDF summary.");
}
    // Summarize the PDF using AI
    // Save the summary to the database
    // Redirect to the [id] summary page
};

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput onSubmit={handleSubmit} />
    </div>
  );
}