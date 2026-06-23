import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Zap, 
  MoreVertical, 
  Trash2, 
  Edit,
  MessageSquare,
  Image,
  Mic,
  Video,
  Copy
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type MessageType = "text" | "image" | "audio" | "video";

export default function QuickReplies() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingReply, setEditingReply] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    shortcut: "",
    messageType: "text" as MessageType,
    mediaUrl: "",
  });

  const { data: quickReplies, isLoading, refetch } = trpc.quickReply.list.useQuery();

  const createQuickReply = trpc.quickReply.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Resposta rápida criada!");
    },
    onError: (error) => {
      toast.error("Erro ao criar: " + error.message);
    }
  });

  const updateQuickReply = trpc.quickReply.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingReply(null);
      resetForm();
      toast.success("Resposta rápida atualizada!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    }
  });

  const deleteQuickReply = trpc.quickReply.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Resposta rápida excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      shortcut: "",
      messageType: "text",
      mediaUrl: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast.error("Preencha o título e o conteúdo");
      return;
    }

    if (editingReply) {
      updateQuickReply.mutate({
        id: editingReply.id,
        ...formData,
      });
    } else {
      createQuickReply.mutate(formData);
    }
  };

  const handleEdit = (reply: any) => {
    setEditingReply(reply);
    setFormData({
      title: reply.title,
      content: reply.content,
      shortcut: reply.shortcut || "",
      messageType: reply.messageType,
      mediaUrl: reply.mediaUrl || "",
    });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copiado para a área de transferência!");
  };

  const getTypeIcon = (type: MessageType) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "audio":
        return <Mic className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: MessageType) => {
    switch (type) {
      case "image":
        return "Imagem";
      case "audio":
        return "Áudio";
      case "video":
        return "Vídeo";
      default:
        return "Texto";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Respostas Rápidas</h1>
            <p className="text-muted-foreground">
              Crie templates de mensagens para envio rápido
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen || !!editingReply} onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingReply(null);
              resetForm();
            } else {
              setIsAddDialogOpen(true);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Resposta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingReply ? "Editar Resposta Rápida" : "Nova Resposta Rápida"}
                </DialogTitle>
                <DialogDescription>
                  Crie um template para enviar mensagens com um clique
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Saudação inicial"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shortcut">Atalho</Label>
                  <Input
                    id="shortcut"
                    placeholder="Ex: /oi"
                    value={formData.shortcut}
                    onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite este atalho no chat para inserir a mensagem rapidamente
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Mensagem</Label>
                  <Select 
                    value={formData.messageType} 
                    onValueChange={(value: MessageType) => setFormData({ ...formData, messageType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Texto
                        </div>
                      </SelectItem>
                      <SelectItem value="image">
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Imagem
                        </div>
                      </SelectItem>
                      <SelectItem value="audio">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          Áudio
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Vídeo
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.messageType !== "text" && (
                  <div className="space-y-2">
                    <Label htmlFor="mediaUrl">URL da Mídia</Label>
                    <Input
                      id="mediaUrl"
                      placeholder="https://..."
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="content">
                    {formData.messageType === "text" ? "Mensagem *" : "Legenda"}
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Digite o conteúdo da mensagem..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingReply(null);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createQuickReply.isPending || updateQuickReply.isPending}
                >
                  {(createQuickReply.isPending || updateQuickReply.isPending) 
                    ? "Salvando..." 
                    : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Replies Grid */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : quickReplies && quickReplies.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickReplies.map((reply) => (
              <Card key={reply.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(reply.messageType as MessageType)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{reply.title}</CardTitle>
                        {reply.shortcut && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {reply.shortcut}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopy(reply.content)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(reply)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir?")) {
                              deleteQuickReply.mutate({ id: reply.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {reply.content}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <Badge variant="secondary" className="text-xs">
                      {getTypeLabel(reply.messageType as MessageType)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Usado {reply.usageCount}x
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma resposta rápida</p>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                Crie templates de mensagens para agilizar seu atendimento
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeira Resposta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
