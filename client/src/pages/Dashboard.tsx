import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  MessageSquare, 
  Zap, 
  Clock, 
  Plus,
  Wifi,
  WifiOff,
  QrCode,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: instances, isLoading: instancesLoading } = trpc.instance.list.useQuery();
  const { data: contacts, isLoading: contactsLoading } = trpc.contact.list.useQuery();
  const { data: quickReplies, isLoading: quickRepliesLoading } = trpc.quickReply.list.useQuery();
  const { data: scheduledMessages, isLoading: scheduledLoading } = trpc.scheduledMessage.list.useQuery();

  const connectedInstances = instances?.filter(i => i.status === "connected") || [];
  const totalContacts = contacts?.length || 0;
  const totalQuickReplies = quickReplies?.length || 0;
  const pendingScheduled = scheduledMessages?.filter(s => s.status === "pending").length || 0;

  // Count contacts by funnel stage
  const funnelStats = {
    new_lead: contacts?.filter(c => c.funnelStage === "new_lead").length || 0,
    contacted: contacts?.filter(c => c.funnelStage === "contacted").length || 0,
    negotiation: contacts?.filter(c => c.funnelStage === "negotiation").length || 0,
    closed_won: contacts?.filter(c => c.funnelStage === "closed_won").length || 0,
    closed_lost: contacts?.filter(c => c.funnelStage === "closed_lost").length || 0,
  };

  const hasInstance = instances && instances.length > 0;
  const hasConnectedInstance = connectedInstances.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu CRM WhatsApp
          </p>
        </div>

        {/* Connection Status Alert */}
        {!hasConnectedInstance && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <WifiOff className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">WhatsApp não conectado</p>
                  <p className="text-sm text-muted-foreground">
                    {hasInstance 
                      ? "Escaneie o QR Code para conectar seu WhatsApp" 
                      : "Configure sua instância da Evolution API para começar"}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setLocation("/settings")}
              >
                {hasInstance ? <QrCode className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {hasInstance ? "Conectar" : "Configurar"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instâncias</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {connectedInstances.length}/{instances?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                conectadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContacts}</div>
              <p className="text-xs text-muted-foreground">
                no CRM
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Respostas Rápidas</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuickReplies}</div>
              <p className="text-xs text-muted-foreground">
                templates salvos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingScheduled}</div>
              <p className="text-xs text-muted-foreground">
                mensagens pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
            <CardDescription>
              Distribuição dos seus contatos por etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-500">{funnelStats.new_lead}</div>
                <p className="text-xs text-muted-foreground mt-1">Novos Leads</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="text-2xl font-bold text-yellow-500">{funnelStats.contacted}</div>
                <p className="text-xs text-muted-foreground mt-1">Em Contato</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="text-2xl font-bold text-purple-500">{funnelStats.negotiation}</div>
                <p className="text-xs text-muted-foreground mt-1">Negociação</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="text-2xl font-bold text-green-500">{funnelStats.closed_won}</div>
                <p className="text-xs text-muted-foreground mt-1">Fechados</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="text-2xl font-bold text-red-500">{funnelStats.closed_lost}</div>
                <p className="text-xs text-muted-foreground mt-1">Perdidos</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" className="gap-2" onClick={() => setLocation("/kanban")}>
                Ver Kanban
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLocation("/contacts")}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Gerenciar Contatos</h3>
                <p className="text-sm text-muted-foreground">Adicione e organize seus leads</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLocation("/quick-replies")}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Respostas Rápidas</h3>
                <p className="text-sm text-muted-foreground">Crie templates de mensagens</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLocation("/settings")}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wifi className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Conexão WhatsApp</h3>
                <p className="text-sm text-muted-foreground">Configure sua instância</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
