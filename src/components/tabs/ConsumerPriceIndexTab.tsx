import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { simpleLinearRegression } from "@/lib/regression";

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

    // Use least squares method
    const { a, b } = simpleLinearRegression(x, y);
    setCoefficients({ a, b });

    // Calculate prediction: CPI = a + b * Year
    const predictedCPI = a + b * targetYear;
    setPrediction(predictedCPI);
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
                  className="h-9"
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

          <div className="border-t pt-4 space-y-3">
            <div>
              <Label>Target Year</Label>
              <Input
                type="number"
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
              />
            </div>

            <Button onClick={calculatePrediction} className="w-full">
              Calculate CPI
            </Button>

            {prediction !== null && (
              <div className="bg-secondary/20 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Least Squares Coefficients:</p>
                <p className="text-xs">a (intercept) = {coefficients.a.toFixed(2)}</p>
                <p className="text-xs">b (slope) = {coefficients.b.toFixed(4)}</p>
                <div className="border-t pt-2 mt-2">
                  <p className="text-sm font-semibold">
                    Predicted CPI for {targetYear}: {prediction.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>CPI Trend Visualization</CardTitle>
          <CardDescription>
            Historical data and least squares prediction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={generateChartData()}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Observed" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-3))', r: 4 }}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="Fitted" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">About Least Squares Method:</p>
            <p>Uses simple linear least squares to fit CPI = a + b·Year, minimizing the sum of squared residuals to find the best-fit line through historical data.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumerPriceIndexTab;
