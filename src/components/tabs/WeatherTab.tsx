import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

const WeatherTab = () => {
  const [todayTemp, setTodayTemp] = useState(25);
  const [humidity, setHumidity] = useState(70);
  const [pressure, setPressure] = useState(1013);
  const [prediction, setPrediction] = useState<number | null>(null);

  const calculatePrediction = () => {
    // Multiple linear regression: T_next = a + b*T_today + c*H + d*P
    // Using example coefficients
    const a = 2;
    const b = 0.8;
    const c = 0.02;
    const d = -0.01;
    
    const result = a + b * todayTemp + c * humidity + d * pressure;
    setPrediction(result);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Weather Parameters
          </CardTitle>
          <CardDescription>
            Model: T_next = a + b·T_today + c·H + d·P
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="today-temp">Today's Temperature (°C)</Label>
            <Input
              id="today-temp"
              type="number"
              value={todayTemp}
              onChange={(e) => setTodayTemp(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="humidity">Humidity (%)</Label>
            <Input
              id="humidity"
              type="number"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pressure">Pressure (hPa)</Label>
            <Input
              id="pressure"
              type="number"
              value={pressure}
              onChange={(e) => setPressure(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <Button onClick={calculatePrediction} className="w-full">
            Predict Tomorrow's Temperature
          </Button>

          {prediction !== null && (
            <div className="p-4 bg-accent/10 rounded-lg space-y-2">
              <p className="text-sm font-medium">Model Coefficients:</p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>a (base) = 2.0</p>
                <p>b (temp factor) = 0.8</p>
                <p>c (humidity factor) = 0.02</p>
                <p>d (pressure factor) = -0.01</p>
              </div>
              <p className="text-lg font-bold text-primary mt-3">
                Tomorrow's Temperature: {prediction.toFixed(1)}°C
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>About Weather Prediction</CardTitle>
          <CardDescription>Understanding the multiple linear regression model</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Model Explanation</h3>
            <p className="text-muted-foreground">
              This model uses multiple linear regression to predict tomorrow's temperature based on current weather conditions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Variables</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>b:</strong> How strongly today's temp influences tomorrow's</li>
              <li><strong>c:</strong> How humidity affects temperature (high humidity → warmer nights)</li>
              <li><strong>d:</strong> How air pressure relates (falling pressure → stormy weather)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Interpretation</h3>
            <p className="text-muted-foreground">
              A coefficient of 0.8 for today's temperature means tomorrow will be about 80% similar to today, 
              with adjustments for humidity and pressure conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherTab;
