import { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, TrendingUp, Cloud, CloudRain, Users, Loader2, DollarSign, TrendingUpIcon, LogOut, LayoutDashboard, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Lazy load tab components for better code splitting
const ClimateTab = lazy(() => import("@/components/tabs/ClimateTab"));
const WeatherTab = lazy(() => import("@/components/tabs/WeatherTab"));
const ConsumerPriceIndexTab = lazy(() => import("@/components/tabs/ConsumerPriceIndexTab"));
const GoldTab = lazy(() => import("@/components/tabs/GoldTab"));
const SilverTab = lazy(() => import("@/components/tabs/SilverTab"));
const NationalGDPTab = lazy(() => import("@/components/tabs/NationalGDPTab"));
const EpidemiologyTab = lazy(() => import("@/components/tabs/EpidemiologyTab"));

// Loading component for tab transitions
const TabLoader = () => <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>;
const Index = () => {
  const [activeTab, setActiveTab] = useState("climate");
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  const tabs = [{
    id: "climate",
    label: "Climate",
    icon: Cloud,
    color: "text-chart-1"
  }, {
    id: "weather",
    label: "Weather",
    icon: CloudRain,
    color: "text-chart-2"
  }, {
    id: "cpi",
    label: "Consumer Price Index",
    icon: DollarSign,
    color: "text-chart-3"
  }, {
    id: "gold",
    label: "Gold",
    icon: Coins,
    color: "text-chart-5"
  }, {
    id: "silver",
    label: "Silver",
    icon: Coins,
    color: "text-chart-2"
  }, {
    id: "gdp",
    label: "National GDP",
    icon: TrendingUpIcon,
    color: "text-chart-4"
  }, {
    id: "epidemiology",
    label: "Epidemiology",
    icon: Users,
    color: "text-chart-1"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex-1" />
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/dashboard")}
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text mb-2 lg:text-6xl text-slate-900">
                FUTURELENS
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-medium tracking-wide">
                PREDICTING FUTURE TRENDS
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-card/50 p-2 h-auto">
            {tabs.map(tab => {
            const Icon = tab.icon;
            return <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  <Icon className={`h-4 w-4 ${activeTab === tab.id ? '' : tab.color}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>;
          })}
          </TabsList>

          <div className="mt-6">
            <Suspense fallback={<TabLoader />}>
              <TabsContent value="climate" className="mt-0">
                <ClimateTab />
              </TabsContent>
              <TabsContent value="weather" className="mt-0">
                <WeatherTab />
              </TabsContent>
              <TabsContent value="cpi" className="mt-0">
                <ConsumerPriceIndexTab />
              </TabsContent>
              <TabsContent value="gold" className="mt-0">
                <GoldTab />
              </TabsContent>
              <TabsContent value="silver" className="mt-0">
                <SilverTab />
              </TabsContent>
              <TabsContent value="gdp" className="mt-0">
                <NationalGDPTab />
              </TabsContent>
              <TabsContent value="epidemiology" className="mt-0">
                <EpidemiologyTab />
              </TabsContent>
            </Suspense>
          </div>
        </Tabs>
      </main>
    </div>;
};
export default Index;