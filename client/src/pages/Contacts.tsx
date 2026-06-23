import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  MessageSquare, 
  Trash2,
  Edit,
  Phone,
  User
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const FUNNEL_STAGES = [
  { id: "new_lead", label: "Novo Lead", color: "bg-blue-500" },
  { id: "contacted", label: "Em Contato", color: "bg-yellow-500" },
  { id: "negotiation", label: "Negociação", color: "bg-purple-500" },
  { id: "closed_won", label: "Fechado", color: "bg-green-500" },
  { id: "closed_lost", label: "Perdido", color: "bg-red-500" },
] as const;

type FunnelStage = typeof FUNNEL_STAGES[number]["id"];

export default function Contacts() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  
  // Form state
  const [newContact, setNewContact] = useState({
    phoneNumber: "",
    name: "",
    notes: "",
    funnelStage: "new_lead" as FunnelStage,
  });

  const { data: instances } = trpc.instance.list.useQuery();
  const { data: contacts, isLoading, refetch } = trpc.contact.list.useQuery(
    selectedInstance ? { instanceId: parseInt(selectedInstance) } : undefined
  );

  const createContact = trpc.contact.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      setNewContact({ phoneNumber: "", name: "", notes: "", funnelStage: "new_lead" });
      toast.success("Contato criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar contato: " + error.message);
    }
  });

  const deleteContact = trpc.contact.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Contato excluído!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir contato: " + error.message);
    }
  });

  const handleCreateContact = () => {
    if (!selectedInstance) {
      toast.error("Selecione uma instância primeiro");
      return;
    }
    if (!newContact.phoneNumber) {
      toast.error("Informe o número do telefone");
      return;
    }
    
    createContact.mutate({
      instanceId: parseInt(selectedInstance),
      phoneNumber: newContact.phoneNumber,
      name: newContact.name || undefined,
      notes: newContact.notes || undefined,
      funnelStage: newContact.funnelStage,
    });
  };

  // Filter contacts by search query
  const filteredContacts = contacts?.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.phoneNumber.includes(query) ||
      contact.notes?.toLowerCase().includes(query)
    );
  });

  // Auto-select first instance
  if (instances && instances.length > 0 && !selectedInstance) {
    setSelectedInstance(instances[0].id.toString());
  }

  const getFunnelStageInfo = (stage: string) => {
    return FUNNEL_STAGES.find(s => s.id === stage) || FUNNEL_STAGES[0];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contatos</h1>
            <p className="text-muted-foreground">
              Gerencie seus contatos do WhatsApp
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Contato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Contato</DialogTitle>
                <DialogDescription>
                  Adicione um novo contato ao seu CRM
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="instance">Instância</Label>
                  <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                    <SelectTrigger>
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    placeholder="5511999999999"
                    value={newContact.phoneNumber}
                    onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: código do país + DDD + número (sem espaços ou símbolos)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Nome do contato"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stage">Etapa do Funil</Label>
                  <Select 
                    value={newContact.funnelStage} 
                    onValueChange={(value: FunnelStage) => setNewContact({ ...newContact, funnelStage: value })}
                  >
                    <SelectTrigger>
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre o contato..."
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateContact} disabled={createContact.isPending}>
                  {createContact.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone ou notas..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas as instâncias" />
                </SelectTrigger>
                <SelectContent>
                  {instances?.map((instance) => (
                    <SelectItem key={instance.id} value={instance.id.toString()}>
                      {instance.instanceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contato</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Tags</TableHead>
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
                ) : filteredContacts && filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => {
                    const stageInfo = getFunnelStageInfo(contact.funnelStage);
                    return (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{contact.name || "Sem nome"}</p>
                              {contact.notes && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {contact.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {contact.phoneNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${stageInfo.color} text-white`}
                          >
                            {stageInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags?.slice(0, 2).map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags && contact.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{contact.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setLocation(`/chat/${contact.id}`)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Abrir Chat
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => window.open(`https://wa.me/${contact.phoneNumber}`, "_blank")}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                WhatsApp Web
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm("Tem certeza que deseja excluir este contato?")) {
                                    deleteContact.mutate({ id: contact.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Nenhum contato encontrado</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setIsAddDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Contato
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
