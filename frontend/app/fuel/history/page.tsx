'use client';

import { useEffect, useState } from 'react';
import { useFuelStore } from '@/store/fuelStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

// Mock vehicles
const mockVehicles = [
  { id: '1', name: 'Vehicle 1' },
  { id: '2', name: 'Vehicle 2' },
  { id: '3', name: 'Vehicle 3' },
];

export default function FuelHistoryPage() {
  const { fuelLogs, fetchFuelLogs } = useFuelStore();
  const [vehicleFilter, setVehicleFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('');

  useEffect(() => {
    fetchFuelLogs({
      vehicleId: vehicleFilter || undefined,
      month: monthFilter || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleFilter, monthFilter]);

  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Fuel History
          </h1>
          <p className="text-muted-foreground mt-2">View historical fuel usage records</p>
        </div>
        <Button asChild>
          <Link href="/fuel/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Fuel Entry
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Filters
          </CardTitle>
          <CardDescription>Filter fuel entries by vehicle or month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleFilter">Vehicle</Label>
              <Select
                id="vehicleFilter"
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
              >
                <option value="">All Vehicles</option>
                {mockVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthFilter">Month</Label>
              <Input
                id="monthFilter"
                type="month"
                value={monthFilter || currentMonth}
                onChange={(e) => setMonthFilter(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setVehicleFilter('');
                  setMonthFilter('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b">
          <CardTitle className="text-xl">Fuel Entries</CardTitle>
          <CardDescription>
            {fuelLogs.length} {fuelLogs.length === 1 ? 'entry' : 'entries'} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {fuelLogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground text-lg mb-4">No fuel entries found</p>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href="/fuel/add">Add First Entry</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Vehicle</th>
                    <th className="text-right p-4 font-semibold text-gray-700 dark:text-gray-300">Quantity (L)</th>
                    <th className="text-right p-4 font-semibold text-gray-700 dark:text-gray-300">Cost (Rs)</th>
                    <th className="text-right p-4 font-semibold text-gray-700 dark:text-gray-300">Cost/Liter</th>
                    <th className="text-center p-4 font-semibold text-gray-700 dark:text-gray-300">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map((log, index) => (
                    <tr 
                      key={log.id} 
                      className={`border-b transition-colors ${
                        index % 2 === 0 
                          ? 'bg-white dark:bg-slate-900' 
                          : 'bg-gray-50 dark:bg-slate-800/50'
                      } hover:bg-blue-50 dark:hover:bg-blue-900/10`}
                    >
                      <td className="p-4 font-medium">
                        {format(new Date(log.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="p-4">{log.vehicleName || log.vehicleId}</td>
                      <td className="p-4 text-right font-semibold">{log.fuelQuantity.toFixed(2)}</td>
                      <td className="p-4 text-right font-semibold text-blue-600">Rs. {log.cost.toFixed(2)}</td>
                      <td className="p-4 text-right font-semibold text-purple-600">
                        Rs. {(log.cost / log.fuelQuantity).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        {log.receiptUrl ? (
                          <a
                            href={log.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

