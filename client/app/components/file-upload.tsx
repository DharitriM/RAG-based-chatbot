'use client';
import * as React from 'react';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const FileUploadComponent: React.FC = () => {
  const handleFileUploadButtonClick = () => {
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', 'application/pdf');
    el.addEventListener('change', async (ev) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          const formData = new FormData();
          formData.append('pdf', file);

          const uploadPromise = new Promise(async (resolve, reject) => {
            try {
              const res = await fetch('http://localhost:8000/upload/pdf', {
                method: 'POST',
                body: formData,
              });
              if (!res.ok) {
                throw new Error('Failed to upload file');
              }
              resolve(res);
            } catch (error) {
              reject(error);
            }
          });

          toast.promise(uploadPromise, {
            loading: 'Uploading PDF...',
            success: 'PDF uploaded successfully! Processing...',
            error: 'Failed to upload PDF. Is the server running?',
          });
        }
      }
    });
    el.click();
  };

  return (
    <div className="bg-slate-900 text-white shadow-2xl flex justify-center items-center p-8 rounded-xl border-white border-2 cursor-pointer hover:bg-slate-800 transition-colors group">
      <div
        onClick={handleFileUploadButtonClick}
        className="flex justify-center items-center flex-col gap-3"
      >
        <Upload className="w-10 h-10 group-hover:-translate-y-1 transition-transform" />
        <h3 className="text-lg font-semibold tracking-wide">Upload PDF File</h3>
        <p className="text-sm text-slate-400">Click to select a document</p>
      </div>
    </div>
  );
};

export default FileUploadComponent;
