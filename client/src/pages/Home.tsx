import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { 
  MessageCircle, 
  Kanban, 
  Zap, 
  Clock, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Smartphone
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold">Carregando...</span>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Kanban,
      title: "Funil Kanban",
      description: "Organize seus leads em colunas visuais e acompanhe cada etapa da venda."
    },
    {
      icon: Zap,
      title: "Respostas Rápidas",
      description: "Envie mensagens pré-configuradas com apenas um clique."
    },
    {
      icon: Clock,
      title: "Agendamento",
      description: "Programe mensagens para follow-up automático."
    },
    {
      icon: Users,
      title: "Gestão de Contatos",
      description: "Organize seus contatos com tags, notas e histórico completo."
    },
    {
      icon: Smartphone,
      title: "Integração WhatsApp",
      description: "Conecte seu WhatsApp via QR Code em segundos."
    },
    {
      icon: MessageCircle,
      title: "Chat Integrado",
      description: "Envie texto, áudio, imagens e vídeos diretamente do sistema."
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">ChatCRM</span>
          </div>
          <Button onClick={() => window.location.href = getLoginUrl()}>
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              CRM WhatsApp Profissional
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Transforme seu WhatsApp em uma{" "}
              <span className="text-primary">máquina de vendas</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Organize seus contatos, automatize respostas e nunca mais perca uma venda. 
              O ChatCRM é o CRM que você precisa para escalar seu negócio no WhatsApp.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Começar Agora
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades pensadas para quem quer profissionalizar o atendimento no WhatsApp.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl p-6 border hover:border-primary/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Pronto para começar?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Crie sua conta gratuitamente e comece a organizar suas vendas no WhatsApp hoje mesmo.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="gap-2"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Criar Conta Grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-semibold">ChatCRM</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 ChatCRM. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
