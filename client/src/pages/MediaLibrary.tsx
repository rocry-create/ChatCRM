import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { 
  Plus, 
  Image, 
  Video, 
  FileAudio, 
  FileText,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  Upload,
  FolderOpen
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type MediaCategory = "image" | "video" | "audio" | "document" | "";

export default function MediaLibrary() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>("");
  
  // Form state
  const [formData, setFormData] = useState({
    fileName: "",
    fileUrl: "",
    mimeType: "",
    fileSize: 0,
    category: "" as MediaCategory,
  });

  const { data: mediaItems, isLoading, refetch } = trpc.mediaLibrary.list.useQuery(
    selectedCategory ? { category: selectedCategory } : undefined
  );

  const createMediaItem = trpc.mediaLibrary.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Mídia adicionada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar: " + error.message);
    }
  });

  const deleteMediaItem = trpc.mediaLibrary.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Mídia excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      fileName: "",
      fileUrl: "",
      mimeType: "",
      fileSize: 0,
      category: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.fileName || !formData.fileUrl || !formData.mimeType) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createMediaItem.mutate({
      fileName: formData.fileName,
      fileKey: `media/${Date.now()}-${formData.fileName}`,
      fileUrl: formData.fileUrl,
      mimeType: formData.mimeType,
      fileSize: formData.fileSize || 0,
      category: formData.category || undefined,
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiada!");
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Image className="h-6 w-6 text-blue-500" />;
    }
    if (mimeType.startsWith("video/")) {
      return <Video className="h-6 w-6 text-purple-500" />;
    }
    if (mimeType.startsWith("audio/")) {
      return <FileAudio className="h-6 w-6 text-green-500" />;
    }
    return <FileText className="h-6 w-6 text-orange-500" />;
  };

  const getCategoryLabel = (category: string | null) => {
    switch (category) {
      case "image":
        return "Imagem";
      case "video":
        return "Vídeo";
      case "audio":
        return "Áudio";
      case "document":
        return "Documento";
      default:
        return "Outro";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Mídia</h1>
            <p className="text-muted-foreground">
              Gerencie seus arquivos para envio rápido
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Mídia
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Mídia</DialogTitle>
                <DialogDescription>
                  Adicione um arquivo à sua biblioteca para uso rápido
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">Nome do Arquivo *</Label>
                  <Input
                    id="fileName"
                    placeholder="Ex: logo.png"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fileUrl">URL do Arquivo *</Label>
                  <Input
                    id="fileUrl"
                    placeholder="https://..."
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL pública do arquivo (pode ser do S3, Google Drive, etc.)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mimeType">Tipo MIME *</Label>
                  <Select 
                    value={formData.mimeType} 
                    onValueChange={(value) => setFormData({ ...formData, mimeType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/jpeg">Imagem JPEG</SelectItem>
                      <SelectItem value="image/png">Imagem PNG</SelectItem>
                      <SelectItem value="image/gif">Imagem GIF</SelectItem>
                      <SelectItem value="image/webp">Imagem WebP</SelectItem>
                      <SelectItem value="video/mp4">Vídeo MP4</SelectItem>
                      <SelectItem value="video/webm">Vídeo WebM</SelectItem>
                      <SelectItem value="audio/mpeg">Áudio MP3</SelectItem>
                      <SelectItem value="audio/ogg">Áudio OGG</SelectItem>
                      <SelectItem value="application/pdf">PDF</SelectItem>
                      <SelectItem value="application/msword">Word</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: MediaCategory) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="audio">Áudio</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fileSize">Tamanho (bytes)</Label>
                  <Input
                    id="fileSize"
                    type="number"
                    placeholder="0"
                    value={formData.fileSize || ""}
                    onChange={(e) => setFormData({ ...formData, fileSize: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createMediaItem.isPending}
                >
                  {createMediaItem.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Filtrar por:</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value: MediaCategory) => setSelectedCategory(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="image">Imagens</SelectItem>
                  <SelectItem value="video">Vídeos</SelectItem>
                  <SelectItem value="audio">Áudios</SelectItem>
                  <SelectItem value="document">Documentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : mediaItems && mediaItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mediaItems.map((item) => (
              <Card key={item.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  {/* Preview */}
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {item.mimeType.startsWith("image/") ? (
                      <img 
                        src={item.fileUrl} 
                        alt={item.fileName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                        }}
                      />
                    ) : (
                      getFileIcon(item.mimeType)
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{item.fileName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(item.category)}
                        </Badge>
                        {item.fileSize > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(item.fileSize)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyUrl(item.fileUrl)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(item.fileUrl, "_blank")}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir?")) {
                              deleteMediaItem.mutate({ id: item.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Biblioteca vazia</p>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                Adicione arquivos à sua biblioteca para enviá-los rapidamente nas conversas
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeiro Arquivo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
