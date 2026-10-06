'use client';

import UploadFormInput from '@/components/upload/upload-form-input';

export default function UploadForm() {
  const handleSubmit = () => {
    console.log('submitted');
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <UploadFormInput onSubmit={handleSubmit} />
    </div>
  );
}