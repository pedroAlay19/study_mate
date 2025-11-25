import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, Trash2, FileIcon, Loader2 } from "lucide-react";
import { attachmentsService, type Attachment } from "@/services/attachments.service";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AttachmentsManagerProps {
  taskId: string;
}

export function AttachmentsManager({ taskId }: AttachmentsManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Query para obtener los attachments
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["attachments", taskId],
    queryFn: () => attachmentsService.getByTask(taskId),
  });

  // Mutation para subir archivo
  const uploadMutation = useMutation({
    mutationFn: (file: File) => attachmentsService.uploadToSupabase(file, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
      toast.success("Archivo adjuntado exitosamente");
      setUploadingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al subir el archivo");
      setUploadingFile(null);
    },
  });

  // Mutation para eliminar archivo
  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) => attachmentsService.delete(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
      toast.success("Archivo eliminado exitosamente");
      setDeleteDialogOpen(false);
      setAttachmentToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al eliminar el archivo");
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máx 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("El archivo es demasiado grande. Máximo 10MB");
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de archivo no permitido. Solo: imágenes, PDF, Word, TXT, ZIP");
      return;
    }

    setUploadingFile(file);
    uploadMutation.mutate(file);
  };

  const handleDelete = () => {
    if (attachmentToDelete) {
      deleteMutation.mutate(attachmentToDelete);
    }
  };

  const openDeleteDialog = (attachmentId: string) => {
    setAttachmentToDelete(attachmentId);
    setDeleteDialogOpen(true);
  };

  const AttachmentCard = ({ attachment }: { attachment: Attachment }) => {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
        <div className="text-3xl">
          {attachmentsService.getFileIcon(attachment.mimeType)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{attachment.originalName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{attachmentsService.formatFileSize(attachment.fileSize)}</span>
            <span>•</span>
            <span>{new Date(attachment.uploadedAt).toLocaleDateString('es-ES')}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(attachment.fileUrl, '_blank')}
            title="Descargar/Ver"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => openDeleteDialog(attachment.attachmentId)}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileIcon className="w-5 h-5" />
              Recursos Adjuntos
              {attachments.length > 0 && (
                <Badge variant="secondary">{attachments.length}</Badge>
              )}
            </CardTitle>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt,.zip"
              disabled={uploadMutation.isPending}
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Adjuntar Archivo
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {uploadingFile && uploadMutation.isPending && (
            <div className="mb-4 p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Subiendo <span className="font-medium">{uploadingFile.name}</span>...
                </span>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay archivos adjuntos</p>
              <p className="text-xs mt-1">Haz clic en "Adjuntar Archivo" para agregar recursos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <AttachmentCard key={attachment.attachmentId} attachment={attachment} />
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Formatos permitidos: Imágenes, PDF, Word, TXT, ZIP • Tamaño máximo: 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El archivo se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
