'use client';

import { useEffect } from 'react';
import { useFuelStore } from '@/store/fuelStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

export default function FuelAnalyticsPage() {
  const { analytics, fetchAnalytics } = useFuelStore();

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Fuel Analytics</h1>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading analytics...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Fuel Analytics
          </h1>
          <p className="text-muted-foreground mt-2">Analyze fuel efficiency and detect misuse</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Alerts */}
      {analytics.alerts && analytics.alerts.length > 0 && (
        <Card className="border-0 shadow-lg border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Alerts
            </CardTitle>
            <CardDescription>Unusual fuel usage detected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.alerts.map((alert, index) => (
              <Alert key={index} variant="destructive">
                <AlertTitle>{alert.vehicleName}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Monthly Consumption Chart */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Monthly Fuel Consumption
          </CardTitle>
          <CardDescription>Fuel consumption trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyConsumption}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="consumption"
                stroke="#8884d8"
                name="Consumption (Liters)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Comparison */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Cost Comparison per Vehicle
          </CardTitle>
          <CardDescription>Total fuel costs by vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.costComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicleName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#8884d8" name="Cost (Rs)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Mileage */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Average Mileage
          </CardTitle>
          <CardDescription>Overall fuel efficiency metric</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {analytics.averageMileage.toFixed(2)}
            </div>
            <p className="text-lg text-muted-foreground font-medium">Kilometers per Liter</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

