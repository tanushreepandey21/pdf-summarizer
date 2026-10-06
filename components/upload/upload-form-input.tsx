'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {SubmitEvent} from 'react';

interface UploadFormInputProps {
  onSubmit: (e:SubmitEvent<HTMLFormElement>) => void;
}

export default function UploadFormInput({
  onSubmit,
}: UploadFormInputProps) {
  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <div className="flex justify-end items-center gap-1.5">
        <Input
          id="file"
          type="file"
          name="file"
          accept="application/pdf"
          required
          className=""
        />
        <Button>Upload your PDF</Button>
      </div>
    </form>
  );
}