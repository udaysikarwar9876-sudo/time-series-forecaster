import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calculator, Plus, Trash2, Save, FolderOpen } from "lucide-react";
import { useModelConfigurations } from "@/hooks/useModelConfigurations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DataPoint {
  month: number;
  price: number;
}

const SilverTab = () => {
  const [data, setData] = useState<DataPoint[]>([
    { month: 1, price: 22 },
    { month: 2, price: 23 },
    { month: 3, price: 24 },
    { month: 4, price: 25 },
    { month: 5, price: 26 },
  ]);
  const [predictionMonth, setPredictionMonth] = useState(6);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [growthRate, setGrowthRate] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configName, setConfigName] = useState("");
  
  const { configurations, loading, saveConfiguration, loadConfiguration, deleteConfiguration } = 
    useModelConfigurations('silver');

  const addDataPoint = () => {
    const lastMonth = data[data.length - 1]?.month || 5;
    setData([...data, { month: lastMonth + 1, price: 26 }]);
  };

  const removeDataPoint = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const updateDataPoint = (index: number, field: keyof DataPoint, value: number) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  const calculateRegression = () => {
    if (data.length < 2) return;

    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.month, 0);
    const sumY = data.reduce((sum, d) => sum + d.price, 0);
    const sumXY = data.reduce((sum, d) => sum + d.month * d.price, 0);
    const sumX2 = data.reduce((sum, d) => sum + d.month * d.month, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    setGrowthRate(slope);

    const predictedPrice = slope * predictionMonth + intercept;
    setPrediction(predictedPrice);
  };

  const handleSave = async () => {
    if (!configName.trim()) return;
    
    const configuration = { data, predictionMonth };
    const predictionResult = { prediction, growthRate };
    
    await saveConfiguration(configName, configuration, predictionResult);
    setSaveDialogOpen(false);
    setConfigName("");
  };

  const handleLoad = (configId: string) => {
    const config = configurations.find(c => c.id === configId);
    if (!config) return;

    const { configuration, predictionResult } = loadConfiguration(config);
    setData(configuration.data);
    setPredictionMonth(configuration.predictionMonth);
    setPrediction(predictionResult.prediction);
    setGrowthRate(predictionResult.growthRate);
    setLoadDialogOpen(false);
  };

  const chartData = [
    ...data.map(d => ({ month: d.month, actual: d.price, predicted: null })),
    ...(prediction ? [{ month: predictionMonth, actual: null, predicted: prediction }] : [])
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Silver Price Data
          </CardTitle>
          <CardDescription>
            Model: Linear Regression (Price = m·Month + b)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.map((point, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Month</Label>
                  <Input
                    type="number"
                    value={point.month}
                    onChange={(e) => updateDataPoint(index, "month", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Price ($/oz)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={point.price}
                    onChange={(e) => updateDataPoint(index, "price", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeDataPoint(index)}
                  disabled={data.length <= 2}
                  className="h-9 w-9"
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

          <div className="pt-4 border-t">
            <Label htmlFor="prediction-month">Prediction Month</Label>
            <Input
              id="prediction-month"
              type="number"
              value={predictionMonth}
              onChange={(e) => setPredictionMonth(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={calculateRegression} className="flex-1" disabled={data.length < 2}>
              Calculate Price Prediction
            </Button>
            <Button onClick={() => setSaveDialogOpen(true)} variant="outline" size="icon">
              <Save className="h-4 w-4" />
            </Button>
            <Button onClick={() => setLoadDialogOpen(true)} variant="outline" size="icon">
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>

          {prediction !== null && (
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <p className="text-sm font-medium">Investment Insights:</p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>Monthly growth rate: ${growthRate.toFixed(2)}/month</p>
                <p>{growthRate > 0 ? "Upward trend" : "Downward trend"}</p>
              </div>
              <p className="text-lg font-bold text-primary mt-3">
                Predicted Price (Month {predictionMonth}): ${prediction.toFixed(2)}/oz
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Silver Price Trend</CardTitle>
          <CardDescription>Investment price analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
                label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
                label={{ value: 'Price ($/oz)', angle: -90, position: 'insideLeft' }}
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
                dataKey="actual" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                name="Actual"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--chart-3))", r: 6 }}
                name="Predicted"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Configuration</DialogTitle>
            <DialogDescription>
              Save your current silver price model configuration
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

export default SilverTab;
