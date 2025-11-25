import { api } from '@/lib/api';

export interface Attachment {
  attachmentId: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  task?: {
    task_id: string;
    title: string;
  };
}

export interface CreateAttachmentDto {
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  taskId: string;
}

export const attachmentsService = {
  async getByTask(taskId: string): Promise<Attachment[]> {
    const response = await api.get(`/attachments/task/${taskId}`);
    return response.data;
  },

  async uploadToSupabase(file: File, taskId: string): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/attachments/upload/supabase/${taskId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async delete(attachmentId: string): Promise<void> {
    await api.delete(`/attachments/${attachmentId}`);
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
    if (mimeType.includes('text')) return '📃';
    return '📎';
  },
};
