import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calculator, Plus, Trash2 } from "lucide-react";

interface DataPoint {
  day: number;
  volume: number;
}

const DiseaseTab = () => {
  const [data, setData] = useState<DataPoint[]>([
    { day: 0, volume: 1.0 },
    { day: 5, volume: 1.8 },
    { day: 10, volume: 3.2 },
    { day: 15, volume: 5.5 },
    { day: 20, volume: 8.1 },
  ]);
  const [predictionDay, setPredictionDay] = useState(25);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [growthRate, setGrowthRate] = useState(0);

  const addDataPoint = () => {
    const lastDay = data[data.length - 1]?.day || 20;
    setData([...data, { day: lastDay + 5, volume: 8 }]);
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

    // Exponential regression: V(t) = V0 * e^(r*t)
    // Taking ln: ln(V) = ln(V0) + r*t
    const n = data.length;
    const sumT = data.reduce((sum, d) => sum + d.day, 0);
    const sumLnV = data.reduce((sum, d) => sum + Math.log(d.volume), 0);
    const sumTLnV = data.reduce((sum, d) => sum + d.day * Math.log(d.volume), 0);
    const sumT2 = data.reduce((sum, d) => sum + d.day * d.day, 0);

    const r = (n * sumTLnV - sumT * sumLnV) / (n * sumT2 - sumT * sumT);
    const lnV0 = (sumLnV - r * sumT) / n;
    const V0 = Math.exp(lnV0);

    setGrowthRate(r);

    // Calculate prediction
    const predictedVolume = V0 * Math.exp(r * predictionDay);
    setPrediction(predictedVolume);
  };

  const chartData = [
    ...data.map(d => ({ day: d.day, actual: d.volume, predicted: null })),
    ...(prediction ? [{ day: predictionDay, actual: null, predicted: prediction }] : [])
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Disease Progression Data
          </CardTitle>
          <CardDescription>
            Model: V(t) = V₀·e^(r·t)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.map((point, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Day</Label>
                  <Input
                    type="number"
                    value={point.day}
                    onChange={(e) => updateDataPoint(index, "day", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Volume (cm³)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={point.volume}
                    onChange={(e) => updateDataPoint(index, "volume", Number(e.target.value))}
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
            <Label htmlFor="prediction-day">Prediction Day</Label>
            <Input
              id="prediction-day"
              type="number"
              value={predictionDay}
              onChange={(e) => setPredictionDay(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <Button onClick={calculateRegression} className="w-full" disabled={data.length < 2}>
            Calculate Growth Prediction
          </Button>

          {prediction !== null && (
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <p className="text-sm font-medium">Growth Parameters:</p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>Growth rate (r) = {growthRate.toFixed(4)} per day</p>
                <p>{growthRate > 0.1 ? "High aggressiveness" : "Moderate growth"}</p>
              </div>
              <p className="text-lg font-bold text-primary mt-3">
                Predicted Volume (Day {predictionDay}): {prediction.toFixed(2)} cm³
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Tumor Growth Curve</CardTitle>
          <CardDescription>Exponential growth model visualization</CardDescription>
        </CardHeader>
        <CardContent>
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
                label={{ value: 'Volume (cm³)', angle: -90, position: 'insideLeft' }}
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
                stroke="hsl(var(--chart-4))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-4))", r: 4 }}
                name="Measured"
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
    </div>
  );
};

export default DiseaseTab;
