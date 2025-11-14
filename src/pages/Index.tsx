import { useState, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, TrendingUp, Cloud, CloudRain, Activity, Users, Loader2, DollarSign, TrendingUpIcon } from "lucide-react";

// Lazy load tab components for better code splitting
const ClimateTab = lazy(() => import("@/components/tabs/ClimateTab"));
const WeatherTab = lazy(() => import("@/components/tabs/WeatherTab"));
const ConsumerPriceIndexTab = lazy(() => import("@/components/tabs/ConsumerPriceIndexTab"));
const DiseaseTab = lazy(() => import("@/components/tabs/DiseaseTab"));
const NationalGDPTab = lazy(() => import("@/components/tabs/NationalGDPTab"));
const EpidemiologyTab = lazy(() => import("@/components/tabs/EpidemiologyTab"));

// Loading component for tab transitions
const TabLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState("climate");

  const tabs = [
    { id: "climate", label: "Climate", icon: Cloud, color: "text-chart-1" },
    { id: "weather", label: "Weather", icon: CloudRain, color: "text-chart-2" },
    { id: "cpi", label: "Consumer Price Index", icon: DollarSign, color: "text-chart-3" },
    { id: "disease", label: "Disease", icon: Activity, color: "text-chart-4" },
    { id: "gdp", label: "National GDP", icon: TrendingUpIcon, color: "text-chart-5" },
    { id: "epidemiology", label: "Epidemiology", icon: Users, color: "text-chart-1" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Least Squares Model Visualizer</h1>
              <p className="text-sm text-muted-foreground">Interactive curve fitting and predictions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-card/50 p-2 h-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <Icon className={`h-4 w-4 ${activeTab === tab.id ? '' : tab.color}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
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
              <TabsContent value="disease" className="mt-0">
                <DiseaseTab />
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
    </div>
  );
};

export default Index;
