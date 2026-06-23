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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { 
  Plus, 
  Wifi, 
  WifiOff, 
  QrCode, 
  Trash2, 
  RefreshCw,
  Settings as SettingsIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  Phone
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Settings() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  
  // Form state
  const [newInstance, setNewInstance] = useState({
    instanceName: "",
    apiUrl: "",
    apiKey: "",
  });

  const { data: instances, isLoading, refetch } = trpc.instance.list.useQuery();

  const createInstance = trpc.instance.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      setNewInstance({ instanceName: "", apiUrl: "", apiKey: "" });
      toast.success("Instância criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar instância: " + error.message);
    }
  });

  const deleteInstance = trpc.instance.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Instância excluída!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir instância: " + error.message);
    }
  });

  const getQrCode = trpc.instance.getQrCode.useMutation({
    onSuccess: (data) => {
      if (data.connected) {
        toast.success("WhatsApp já está conectado!");
        setQrCodeDialogOpen(false);
        refetch();
      } else if (data.qrCode) {
        setQrCode(data.qrCode);
      }
      setIsLoadingQr(false);
    },
    onError: (error) => {
      toast.error("Erro ao obter QR Code: " + error.message);
      setIsLoadingQr(false);
    }
  });

  const checkStatus = trpc.instance.checkStatus.useQuery(
    { id: selectedInstanceId! },
    { 
      enabled: !!selectedInstanceId && qrCodeDialogOpen,
      refetchInterval: qrCodeDialogOpen ? 3000 : false,
    }
  );

  const disconnectInstance = trpc.instance.disconnect.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("WhatsApp desconectado!");
    },
    onError: (error) => {
      toast.error("Erro ao desconectar: " + error.message);
    }
  });

  // Check if connected and close dialog
  useEffect(() => {
    if (checkStatus.data?.status === "connected" && qrCodeDialogOpen) {
      toast.success("WhatsApp conectado com sucesso!");
      setQrCodeDialogOpen(false);
      setQrCode(null);
      refetch();
    }
  }, [checkStatus.data?.status, qrCodeDialogOpen, refetch]);

  const handleCreateInstance = () => {
    if (!newInstance.instanceName || !newInstance.apiUrl || !newInstance.apiKey) {
      toast.error("Preencha todos os campos");
      return;
    }
    createInstance.mutate(newInstance);
  };

  const handleGetQrCode = (instanceId: number) => {
    setSelectedInstanceId(instanceId);
    setQrCodeDialogOpen(true);
    setIsLoadingQr(true);
    setQrCode(null);
    getQrCode.mutate({ id: instanceId });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-500 text-white gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Conectado
          </Badge>
        );
      case "connecting":
        return (
          <Badge className="bg-yellow-500 text-white gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Conectando
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3" />
            Desconectado
          </Badge>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas instâncias da Evolution API
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Instância
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Instância</DialogTitle>
                <DialogDescription>
                  Configure uma nova instância da Evolution API
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="instanceName">Nome da Instância *</Label>
                  <Input
                    id="instanceName"
                    placeholder="minha-instancia"
                    value={newInstance.instanceName}
                    onChange={(e) => setNewInstance({ ...newInstance, instanceName: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome único para identificar esta conexão
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apiUrl">URL da API *</Label>
                  <Input
                    id="apiUrl"
                    placeholder="https://sua-evolution-api.com"
                    value={newInstance.apiUrl}
                    onChange={(e) => setNewInstance({ ...newInstance, apiUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL base da sua Evolution API (sem barra no final)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key *</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sua-api-key"
                    value={newInstance.apiKey}
                    onChange={(e) => setNewInstance({ ...newInstance, apiKey: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Chave de autenticação da Evolution API
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateInstance} disabled={createInstance.isPending}>
                  {createInstance.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="border-blue-500/50 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <SettingsIcon className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Como configurar a Evolution API</p>
                <p className="text-sm text-muted-foreground mt-1">
                  1. Instale a Evolution API em um servidor (VPS ou local)<br />
                  2. Copie a URL e a API Key gerada<br />
                  3. Adicione uma nova instância aqui com esses dados<br />
                  4. Escaneie o QR Code para conectar seu WhatsApp
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instances List */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : instances && instances.length > 0 ? (
            instances.map((instance) => (
              <Card key={instance.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        instance.status === "connected" ? "bg-green-500/10" : "bg-muted"
                      }`}>
                        {instance.status === "connected" ? (
                          <Wifi className="h-5 w-5 text-green-500" />
                        ) : (
                          <WifiOff className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{instance.instanceName}</CardTitle>
                        <CardDescription className="text-xs">
                          {instance.apiUrl}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(instance.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {instance.phoneNumber && (
                        <>
                          <Phone className="h-4 w-4" />
                          {instance.phoneNumber}
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {instance.status === "connected" ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => disconnectInstance.mutate({ id: instance.id })}
                        >
                          Desconectar
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleGetQrCode(instance.id)}
                        >
                          <QrCode className="h-4 w-4" />
                          Conectar
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Instância</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a instância "{instance.instanceName}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteInstance.mutate({ id: instance.id })}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Nenhuma instância configurada</p>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  Adicione uma instância da Evolution API para começar a usar o ChatCRM
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Instância
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* QR Code Dialog */}
        <Dialog open={qrCodeDialogOpen} onOpenChange={setQrCodeDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Conectar WhatsApp</DialogTitle>
              <DialogDescription>
                Escaneie o QR Code com seu WhatsApp para conectar
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center py-6">
              {isLoadingQr ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
                </div>
              ) : qrCode ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <img 
                      src={qrCode} 
                      alt="QR Code" 
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Abra o WhatsApp no seu celular, vá em Dispositivos Conectados e escaneie este código
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setIsLoadingQr(true);
                      getQrCode.mutate({ id: selectedInstanceId! });
                    }}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Gerar Novo QR Code
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <XCircle className="h-12 w-12 text-destructive" />
                  <p className="text-sm text-muted-foreground text-center">
                    Não foi possível gerar o QR Code. Verifique se a Evolution API está funcionando.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsLoadingQr(true);
                      getQrCode.mutate({ id: selectedInstanceId! });
                    }}
                  >
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
