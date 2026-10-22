'use client';

import UploadFormInput from '@/components/upload/upload-form-input';
import type {SyntheticEvent} from 'react';
import { z } from 'zod';

const schema = z.object({
  file: z
  .instanceof(File, {message: 'invalid file'})
  .refine(
    (file) => file.size <= 20 * 1024 * 1024,
    'File size must be less than 20MB'
  )
  .refine(
    (file) => file.type.startsWith('appliaction/pdf'),
    'File must be PDf'
  ),
});

export default function UploadForm() {

  const { startUpload, routeConfig } = useUploadThing
  ('pdfUploader', {
  onClientUploadComplete: () => {
    console.log("uploaded successfully!");
  },
  onUploadError: () => {
    console.log("error occurred while uploading",);
  },
  onUploadBegin: ({ file }) => {
    console.log("upload has begun for", file);
  },
});
  const handleSubmit = (e: React.
    SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('submitted');
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    // Validating the fields
    const validatedFields = schema.safeParse({file});

    console.log(validatedFields);

    if(!validatedFields.success){
      console.log(
        validatedFields.error.flatten().fieldErrors.file?.
        [0] ?? 'Invalid file'
      );
      return;
    }
    // Schema with zod
    // Upload the file to uploadthing
    // Parse the PDF using lang chain
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