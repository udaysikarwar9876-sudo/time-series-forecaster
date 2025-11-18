import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calculator, Plus, Trash2, Save, FolderOpen, Download } from "lucide-react";
import { simpleLinearRegression } from "@/lib/regression";
import { useModelConfigurations } from "@/hooks/useModelConfigurations";
import { useToast } from "@/hooks/use-toast";

interface DataPoint {
  year: number;
  cpi: number;
}

const ConsumerPriceIndexTab = () => {
  const [data, setData] = useState<DataPoint[]>([
    { year: 2019, cpi: 100 },
    { year: 2020, cpi: 102.5 },
    { year: 2021, cpi: 107.2 },
    { year: 2022, cpi: 115.8 },
    { year: 2023, cpi: 121.3 },
  ]);
  const [targetYear, setTargetYear] = useState(2024);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [coefficients, setCoefficients] = useState({ a: 0, b: 0 });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState("");

  const { configurations, saveConfiguration, loadConfiguration, deleteConfiguration } = useModelConfigurations('cpi');
  const { toast } = useToast();

  const addDataPoint = () => {
    const lastYear = Math.max(...data.map(d => d.year));
    setData([...data, { year: lastYear + 1, cpi: 100 }]);
  };

  const removeDataPoint = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const updateDataPoint = (index: number, field: keyof DataPoint, value: number) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  const calculatePrediction = () => {
    if (data.length < 2) return;

    const x = data.map(d => d.year);
    const y = data.map(d => d.cpi);

    const { a, b } = simpleLinearRegression(x, y);
    setCoefficients({ a, b });

    const predictedCPI = a + b * targetYear;
    setPrediction(predictedCPI);
  };

  const handleSave = async () => {
    if (!configName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this configuration.",
        variant: "destructive",
      });
      return;
    }

    await saveConfiguration(
      configName,
      { data, targetYear },
      { prediction, coefficients }
    );

    setConfigName("");
    setSaveDialogOpen(false);
  };

  const handleLoad = (configId: string) => {
    const config = configurations.find(c => c.id === configId);
    if (!config) return;

    const { configuration, predictionResult } = loadConfiguration(config);
    setData(configuration.data);
    setTargetYear(configuration.targetYear);
    setPrediction(predictionResult.prediction);
    setCoefficients(predictionResult.coefficients);
    setLoadDialogOpen(false);

    toast({
      title: "Configuration loaded",
      description: `"${config.name}" has been loaded.`,
    });
  };

  const generateChartData = () => {
    const chartData = data.map(d => ({ year: d.year, Observed: d.cpi, Fitted: null }));
    
    if (coefficients.b !== 0) {
      data.forEach(point => {
        const fitted = coefficients.a + coefficients.b * point.year;
        const existing = chartData.find(d => d.year === point.year);
        if (existing) {
          existing.Fitted = fitted;
        }
      });

      if (prediction !== null) {
        chartData.push({ year: targetYear, Observed: null, Fitted: prediction });
      }
    }

    return chartData.sort((a, b) => a.year - b.year);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Data Input & Prediction
          </CardTitle>
          <CardDescription>
            Model: CPI = a + b·Year (Least Squares Method)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Configuration</DialogTitle>
                  <DialogDescription>
                    Give this configuration a name to save it for later.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="config-name">Configuration Name</Label>
                  <Input
                    id="config-name"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    placeholder="e.g., 2024 CPI Forecast"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleSave}>Save Configuration</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Load
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Load Configuration</DialogTitle>
                  <DialogDescription>
                    Select a saved configuration to load.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {configurations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No saved configurations yet.
                    </p>
                  ) : (
                    configurations.map((config) => (
                      <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{config.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(config.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoad(config.id)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteConfiguration(config.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.map((point, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Year</Label>
                  <Input
                    type="number"
                    value={point.year}
                    onChange={(e) => updateDataPoint(index, "year", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">CPI Index</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={point.cpi}
                    onChange={(e) => updateDataPoint(index, "cpi", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeDataPoint(index)}
                  className="h-9 w-9 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={addDataPoint} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Data Point
          </Button>

          <div className="space-y-2 pt-4 border-t">
            <Label>Target Year for Prediction</Label>
            <Input
              type="number"
              value={targetYear}
              onChange={(e) => setTargetYear(Number(e.target.value))}
            />
          </div>

          <Button onClick={calculatePrediction} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Prediction
          </Button>

          {prediction !== null && (
            <div className="space-y-2 p-4 bg-accent/20 rounded-lg">
              <h4 className="font-semibold text-sm">Results</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Coefficients:</span> a = {coefficients.a.toFixed(2)}, b = {coefficients.b.toFixed(4)}
                </p>
                <p>
                  <span className="text-muted-foreground">Predicted CPI ({targetYear}):</span> <span className="font-bold">{prediction.toFixed(2)}</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>CPI Trend Visualization</CardTitle>
          <CardDescription>
            Historical data and linear regression fit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={generateChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Observed" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Fitted" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumerPriceIndexTab;
