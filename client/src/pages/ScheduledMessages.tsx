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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { 
  Plus, 
  Clock, 
  XCircle, 
  CheckCircle2,
  AlertCircle,
  User,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ScheduledMessages() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    contactId: "",
    content: "",
    scheduledAt: "",
    messageType: "text" as "text" | "image" | "audio" | "video",
    mediaUrl: "",
  });

  const { data: scheduledMessages, isLoading, refetch } = trpc.scheduledMessage.list.useQuery();
  const { data: contacts } = trpc.contact.list.useQuery();

  const createScheduledMessage = trpc.scheduledMessage.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Mensagem agendada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao agendar: " + error.message);
    }
  });

  const cancelScheduledMessage = trpc.scheduledMessage.cancel.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Agendamento cancelado!");
    },
    onError: (error) => {
      toast.error("Erro ao cancelar: " + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      contactId: "",
      content: "",
      scheduledAt: "",
      messageType: "text",
      mediaUrl: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.contactId || !formData.content || !formData.scheduledAt) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createScheduledMessage.mutate({
      contactId: parseInt(formData.contactId),
      content: formData.content,
      scheduledAt: new Date(formData.scheduledAt),
      messageType: formData.messageType,
      mediaUrl: formData.mediaUrl || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        );
      case "sent":
        return (
          <Badge className="bg-green-500 text-white gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Enviada
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500 text-white gap-1">
            <AlertCircle className="h-3 w-3" />
            Falhou
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3" />
            Cancelada
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContactName = (contactId: number) => {
    const contact = contacts?.find(c => c.id === contactId);
    return contact?.name || contact?.phoneNumber || "Contato desconhecido";
  };

  // Get minimum datetime (now + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground">
              Programe mensagens para envio automático
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Agendar Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agendar Mensagem</DialogTitle>
                <DialogDescription>
                  Programe uma mensagem para ser enviada automaticamente
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contato *</Label>
                  <Select 
                    value={formData.contactId} 
                    onValueChange={(value) => setFormData({ ...formData, contactId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um contato" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts?.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {contact.name || contact.phoneNumber}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Data e Hora *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    min={getMinDateTime()}
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="messageType">Tipo de Mensagem</Label>
                  <Select 
                    value={formData.messageType} 
                    onValueChange={(value: any) => setFormData({ ...formData, messageType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="audio">Áudio</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
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
                  <Label htmlFor="content">Mensagem *</Label>
                  <Textarea
                    id="content"
                    placeholder="Digite a mensagem que será enviada..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
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
                  disabled={createScheduledMessage.isPending}
                >
                  {createScheduledMessage.isPending ? "Agendando..." : "Agendar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="border-blue-500/50 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Como funciona o agendamento</p>
                <p className="text-sm text-muted-foreground mt-1">
                  As mensagens agendadas serão enviadas automaticamente no horário programado, 
                  desde que sua instância do WhatsApp esteja conectada. Você pode cancelar 
                  agendamentos pendentes a qualquer momento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Messages Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contato</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Agendado para</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : scheduledMessages && scheduledMessages.length > 0 ? (
                  scheduledMessages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">
                            {getContactName(msg.contactId)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2 max-w-[300px]">
                          {msg.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDateTime(msg.scheduledAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(msg.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {msg.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
                                cancelScheduledMessage.mutate({ id: msg.id });
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhum agendamento</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setIsAddDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agendar Mensagem
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
