import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Plus, Trash2, Calculator } from "lucide-react";
import { polynomialRegression } from "@/lib/regression";

interface DataPoint {
  year: number;
  temperature: number;
}

const ClimateTab = () => {
  const [data, setData] = useState<DataPoint[]>([
    { year: 1980, temperature: 13.5 },
    { year: 1990, temperature: 13.8 },
    { year: 2000, temperature: 14.1 },
    { year: 2010, temperature: 14.6 },
    { year: 2020, temperature: 15.1 },
  ]);
  const [predictionYear, setPredictionYear] = useState(2030);
  const [coefficients, setCoefficients] = useState({ a: 0, b: 0, c: 0 });
  const [prediction, setPrediction] = useState<number | null>(null);

  const addDataPoint = () => {
    const lastYear = data[data.length - 1]?.year || 2020;
    setData([...data, { year: lastYear + 5, temperature: 15 }]);
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
    if (data.length < 3) return;

    const baseYear = data[0].year;
    
    // Transform years to offset from base year
    const x = data.map(d => d.year - baseYear);
    const y = data.map(d => d.temperature);
    
    // Use least squares polynomial regression (degree 2)
    const coef = polynomialRegression(x, y, 2);
    
    // coef[0] is intercept, coef[1] is linear term, coef[2] is quadratic term
    setCoefficients({ a: coef[0], b: coef[1], c: coef[2] });

    // Calculate prediction
    const t = predictionYear - baseYear;
    const predictedTemp = coef[0] + coef[1] * t + coef[2] * t * t;
    setPrediction(predictedTemp);
  };

  const chartData = [
    ...data.map(d => ({ year: d.year, actual: d.temperature, predicted: null })),
    ...(prediction ? [{ year: predictionYear, actual: null, predicted: prediction }] : [])
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Data Input & Configuration
          </CardTitle>
          <CardDescription>
            Model: T(t) = a + b·t + c·t²
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.map((point, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor={`year-${index}`} className="text-xs">Year</Label>
                  <Input
                    id={`year-${index}`}
                    type="number"
                    value={point.year}
                    onChange={(e) => updateDataPoint(index, "year", Number(e.target.value))}
                    className="h-9"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`temp-${index}`} className="text-xs">Temperature (°C)</Label>
                  <Input
                    id={`temp-${index}`}
                    type="number"
                    step="0.1"
                    value={point.temperature}
                    onChange={(e) => updateDataPoint(index, "temperature", Number(e.target.value))}
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
            <Label htmlFor="prediction-year">Prediction Year</Label>
            <Input
              id="prediction-year"
              type="number"
              value={predictionYear}
              onChange={(e) => setPredictionYear(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <Button onClick={calculateRegression} className="w-full" disabled={data.length < 3}>
            Calculate Regression
          </Button>

          {prediction && (
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <p className="text-sm font-medium">Least Squares Coefficients:</p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>a (intercept) = {coefficients.a.toFixed(4)}</p>
                <p>b (linear) = {coefficients.b.toFixed(6)}</p>
                <p>c (quadratic) = {coefficients.c.toFixed(8)}</p>
              </div>
              <p className="text-lg font-bold text-primary mt-3">
                Predicted Temperature ({predictionYear}): {prediction.toFixed(2)}°C
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Temperature Trend Visualization</CardTitle>
          <CardDescription>Historical data and future predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="year" 
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                tick={{ fill: "hsl(var(--foreground))" }}
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
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
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                name="Historical"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--chart-3))", r: 6 }}
                name="Prediction"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClimateTab;
