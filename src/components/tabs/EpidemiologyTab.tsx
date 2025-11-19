import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calculator, Save, FolderOpen } from "lucide-react";
import { useModelConfigurations } from "@/hooks/useModelConfigurations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EpidemiologyTab = () => {
  const [initialInfected, setInitialInfected] = useState(100);
  const [populationSize, setPopulationSize] = useState(10000);
  const [infectionRate, setInfectionRate] = useState(0.0003);
  const [recoveryRate, setRecoveryRate] = useState(0.1);
  const [days, setDays] = useState(90);
  const [chartData, setChartData] = useState<any[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState("");
  
  const { configurations, loading, saveConfiguration, loadConfiguration, deleteConfiguration } = 
    useModelConfigurations('epidemiology');

  const calculateSIR = () => {
    const dt = 1; // time step in days
    let S = populationSize - initialInfected; // Susceptible
    let I = initialInfected; // Infected
    let R = 0; // Recovered
    
    const data = [{ day: 0, susceptible: S, infected: I, recovered: R }];
    
    for (let t = 1; t <= days; t++) {
      const dS = -infectionRate * S * I;
      const dI = infectionRate * S * I - recoveryRate * I;
      const dR = recoveryRate * I;
      
      S += dS * dt;
      I += dI * dt;
      R += dR * dt;
      
      // Ensure non-negative values
      S = Math.max(0, S);
      I = Math.max(0, I);
      R = Math.max(0, R);
      
      data.push({
        day: t,
        susceptible: Math.round(S),
        infected: Math.round(I),
        recovered: Math.round(R)
      });
    }
    
    setChartData(data);
  };

  const handleSave = async () => {
    if (!configName.trim()) return;
    
    const configuration = { initialInfected, populationSize, infectionRate, recoveryRate, days };
    const predictionResult = { chartData };
    
    await saveConfiguration(configName, configuration, predictionResult);
    setSaveDialogOpen(false);
    setConfigName("");
  };

  const handleLoad = (configId: string) => {
    const config = configurations.find(c => c.id === configId);
    if (!config) return;

    const { configuration, predictionResult } = loadConfiguration(config);
    setInitialInfected(configuration.initialInfected);
    setPopulationSize(configuration.populationSize);
    setInfectionRate(configuration.infectionRate);
    setRecoveryRate(configuration.recoveryRate);
    setDays(configuration.days);
    setChartData(predictionResult.chartData);
    setLoadDialogOpen(false);
  };

  const r0 = (infectionRate * populationSize) / recoveryRate;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            SIR Model Parameters
          </CardTitle>
          <CardDescription>
            Model: dS/dt = -β·S·I, dI/dt = β·S·I - γ·I, dR/dt = γ·I
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="initial-infected">Initial Infected</Label>
            <Input
              id="initial-infected"
              type="number"
              value={initialInfected}
              onChange={(e) => setInitialInfected(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="population">Total Population</Label>
            <Input
              id="population"
              type="number"
              value={populationSize}
              onChange={(e) => setPopulationSize(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="infection-rate">Infection Rate (β)</Label>
            <Input
              id="infection-rate"
              type="number"
              step="0.0001"
              value={infectionRate}
              onChange={(e) => setInfectionRate(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="recovery-rate">Recovery Rate (γ)</Label>
            <Input
              id="recovery-rate"
              type="number"
              step="0.01"
              value={recoveryRate}
              onChange={(e) => setRecoveryRate(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="days">Simulation Days</Label>
            <Input
              id="days"
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={calculateSIR} className="flex-1">
              Run Epidemic Simulation
            </Button>
            <Button onClick={() => setSaveDialogOpen(true)} variant="outline" size="icon">
              <Save className="h-4 w-4" />
            </Button>
            <Button onClick={() => setLoadDialogOpen(true)} variant="outline" size="icon">
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 bg-accent/10 rounded-lg space-y-2">
            <p className="text-sm font-medium">Epidemic Metrics:</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>R₀ (Basic Reproduction Number) = {r0.toFixed(2)}</p>
              <p>{r0 > 1 ? "⚠️ Epidemic will spread" : "✓ Epidemic will die out"}</p>
              <p>Each infected person infects {r0.toFixed(1)} others on average</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Epidemic Spread Simulation</CardTitle>
          <CardDescription>SIR model dynamics over time</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: "hsl(var(--foreground))" }}
                  label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: "hsl(var(--foreground))" }}
                  label={{ value: 'Population', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="susceptible" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={false}
                  name="Susceptible"
                />
                <Line 
                  type="monotone" 
                  dataKey="infected" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={false}
                  name="Infected"
                />
                <Line 
                  type="monotone" 
                  dataKey="recovered" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={false}
                  name="Recovered"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Configure parameters and click "Run Epidemic Simulation" to see results
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Configuration</DialogTitle>
            <DialogDescription>
              Save your current SIR epidemiology model configuration
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Configuration name"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleSave} disabled={!configName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Configuration</DialogTitle>
            <DialogDescription>
              Select a saved configuration to load
            </DialogDescription>
          </DialogHeader>
          {loading ? (
            <p>Loading...</p>
          ) : configurations.length === 0 ? (
            <p className="text-muted-foreground">No saved configurations</p>
          ) : (
            <div className="space-y-2">
              {configurations.map((config) => (
                <div key={config.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{config.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(config.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleLoad(config.id)}>
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteConfiguration(config.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EpidemiologyTab;
