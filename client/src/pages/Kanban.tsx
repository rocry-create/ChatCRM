import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  User, 
  MessageSquare, 
  Phone,
  MoreVertical,
  Plus,
  RefreshCw
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

const FUNNEL_STAGES = [
  { id: "new_lead", label: "Novos Leads", color: "bg-blue-500" },
  { id: "contacted", label: "Em Contato", color: "bg-yellow-500" },
  { id: "negotiation", label: "Negociação", color: "bg-purple-500" },
  { id: "closed_won", label: "Fechados", color: "bg-green-500" },
  { id: "closed_lost", label: "Perdidos", color: "bg-red-500" },
] as const;

type FunnelStage = typeof FUNNEL_STAGES[number]["id"];

export default function Kanban() {
  const [, setLocation] = useLocation();
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  
  const { data: instances } = trpc.instance.list.useQuery();
  const { data: contactsByStage, isLoading, refetch } = trpc.contact.byFunnelStage.useQuery(
    { instanceId: parseInt(selectedInstance) },
    { enabled: !!selectedInstance }
  );
  
  const updateContact = trpc.contact.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Contato atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar contato: " + error.message);
    }
  });

  const handleDragStart = (e: React.DragEvent, contactId: number) => {
    e.dataTransfer.setData("contactId", contactId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStage: FunnelStage) => {
    e.preventDefault();
    const contactId = parseInt(e.dataTransfer.getData("contactId"));
    
    updateContact.mutate({
      id: contactId,
      funnelStage: newStage,
    });
  };

  // Auto-select first instance if available
  if (instances && instances.length > 0 && !selectedInstance) {
    setSelectedInstance(instances[0].id.toString());
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kanban</h1>
            <p className="text-muted-foreground">
              Arraste os contatos entre as colunas para atualizar o status
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedInstance} onValueChange={setSelectedInstance}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione uma instância" />
              </SelectTrigger>
              <SelectContent>
                {instances?.map((instance) => (
                  <SelectItem key={instance.id} value={instance.id.toString()}>
                    {instance.instanceName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button className="gap-2" onClick={() => setLocation("/contacts")}>
              <Plus className="h-4 w-4" />
              Novo Contato
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        {!selectedInstance ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Selecione uma instância para visualizar o Kanban
              </p>
              {(!instances || instances.length === 0) && (
                <Button onClick={() => setLocation("/settings")}>
                  Configurar Instância
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-5 gap-4 h-[calc(100vh-220px)]">
            {FUNNEL_STAGES.map((stage) => (
              <div
                key={stage.id}
                className="kanban-column flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className="p-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-semibold text-sm">{stage.label}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {contactsByStage?.[stage.id]?.length || 0}
                    </Badge>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-2">
                    {contactsByStage?.[stage.id]?.map((contact: any) => (
                      <div
                        key={contact.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, contact.id)}
                        className="kanban-card"
                        onClick={() => setLocation(`/chat/${contact.id}`)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {contact.name || contact.phoneNumber}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {contact.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {contact.tags.slice(0, 2).map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{contact.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {contact.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {contact.notes}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/chat/${contact.id}`);
                            }}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://wa.me/${contact.phoneNumber}`, "_blank");
                            }}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {(!contactsByStage?.[stage.id] || contactsByStage[stage.id].length === 0) && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Nenhum contato
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
