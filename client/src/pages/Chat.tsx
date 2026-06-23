import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";
import { 
  Send, 
  ArrowLeft, 
  User, 
  Phone,
  Image,
  Mic,
  Video,
  FileText,
  Zap,
  MoreVertical,
  Check,
  CheckCheck,
  Clock
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

const FUNNEL_STAGES = [
  { id: "new_lead", label: "Novo Lead", color: "bg-blue-500" },
  { id: "contacted", label: "Em Contato", color: "bg-yellow-500" },
  { id: "negotiation", label: "Negociação", color: "bg-purple-500" },
  { id: "closed_won", label: "Fechado", color: "bg-green-500" },
  { id: "closed_lost", label: "Perdido", color: "bg-red-500" },
] as const;

type FunnelStage = typeof FUNNEL_STAGES[number]["id"];

export default function Chat() {
  const params = useParams<{ contactId: string }>();
  const contactId = parseInt(params.contactId || "0");
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: contact, isLoading: contactLoading } = trpc.contact.get.useQuery(
    { id: contactId },
    { enabled: !!contactId }
  );
  
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = trpc.message.list.useQuery(
    { contactId, limit: 100 },
    { enabled: !!contactId }
  );

  const { data: quickReplies } = trpc.quickReply.list.useQuery();

  const sendMessage = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessage("");
      refetchMessages();
      toast.success("Mensagem enviada!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar mensagem: " + error.message);
    }
  });

  const updateContact = trpc.contact.update.useMutation({
    onSuccess: () => {
      toast.success("Contato atualizado!");
    }
  });

  const useQuickReply = trpc.quickReply.use.useMutation();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessage.mutate({
      contactId,
      messageType: "text",
      content: message,
    });
  };

  const handleQuickReply = (reply: any) => {
    setMessage(reply.content);
    setShowQuickReplies(false);
    useQuickReply.mutate({ id: reply.id });
  };

  const handleStageChange = (newStage: FunnelStage) => {
    updateContact.mutate({
      id: contactId,
      funnelStage: newStage,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "pending":
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (contactLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!contact) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] gap-4">
          <p className="text-muted-foreground">Contato não encontrado</p>
          <Button onClick={() => setLocation("/contacts")}>
            Voltar para Contatos
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const stageInfo = FUNNEL_STAGES.find(s => s.id === contact.funnelStage) || FUNNEL_STAGES[0];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Chat Header */}
        <Card className="rounded-b-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setLocation("/contacts")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                
                <div>
                  <h2 className="font-semibold">{contact.name || contact.phoneNumber}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {contact.phoneNumber}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={contact.funnelStage} onValueChange={handleStageChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNNEL_STAGES.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                          {stage.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => window.open(`https://wa.me/${contact.phoneNumber}`, "_blank")}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 rounded-none border-t-0 border-b-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messagesLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando mensagens...
                </div>
              ) : messages && messages.length > 0 ? (
                [...messages].reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outgoing" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`message-bubble ${msg.direction === "incoming" ? "incoming" : "outgoing"}`}
                    >
                      {msg.messageType !== "text" && msg.mediaUrl && (
                        <div className="mb-2">
                          {msg.messageType === "image" && (
                            <img 
                              src={msg.mediaUrl} 
                              alt="Imagem" 
                              className="rounded max-w-[200px]" 
                            />
                          )}
                          {msg.messageType === "audio" && (
                            <audio controls src={msg.mediaUrl} className="max-w-[200px]" />
                          )}
                          {msg.messageType === "video" && (
                            <video controls src={msg.mediaUrl} className="rounded max-w-[200px]" />
                          )}
                          {msg.messageType === "document" && (
                            <a 
                              href={msg.mediaUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm underline"
                            >
                              <FileText className="h-4 w-4" />
                              Documento
                            </a>
                          )}
                        </div>
                      )}
                      
                      {msg.content && <p>{msg.content}</p>}
                      
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-70">
                          {formatTime(msg.createdAt)}
                        </span>
                        {msg.direction === "outgoing" && getStatusIcon(msg.status)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma mensagem ainda. Envie a primeira!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </Card>

        {/* Message Input */}
        <Card className="rounded-t-none">
          <CardContent className="p-4">
            <div className="flex items-end gap-2">
              {/* Quick Replies Button */}
              <Popover open={showQuickReplies} onOpenChange={setShowQuickReplies}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Zap className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Respostas Rápidas</h4>
                    {quickReplies && quickReplies.length > 0 ? (
                      <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {quickReplies.map((reply) => (
                          <Button
                            key={reply.id}
                            variant="ghost"
                            className="w-full justify-start text-left h-auto py-2"
                            onClick={() => handleQuickReply(reply)}
                          >
                            <div>
                              <p className="font-medium text-sm">{reply.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {reply.content}
                              </p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma resposta rápida cadastrada
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Media Buttons - Placeholder */}
              <Button variant="outline" size="icon" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
                <Image className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
                <Mic className="h-4 w-4" />
              </Button>

              {/* Message Input */}
              <Textarea
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-[44px] max-h-[120px] resize-none"
                rows={1}
              />

              {/* Send Button */}
              <Button 
                onClick={handleSendMessage} 
                disabled={!message.trim() || sendMessage.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
