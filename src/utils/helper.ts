import { toast } from 'react-hot-toast';

export const toastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toast[type](message, { duration: 2000 });
};

export const handleUpload = async (
  file: File,
  setProgress: (percent: number) => void,
) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/v1/upload-logs', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      toastMessage('Upload started successfully', 'success');
      
    } else {
      toastMessage(data.error || 'Upload failed', 'error');
    }

  } catch (e) {
    toastMessage('Network error during upload', 'error');
  }
};
