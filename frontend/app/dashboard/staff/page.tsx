import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function StaffDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Staff Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Manage your trip requests and track your vehicle usage.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg">
          <Link href="/trips/request">
            <Plus className="mr-2 h-4 w-4" />
            New Trip Request
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">My Requests</CardTitle>
            <Calendar className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-blue-200 mt-1">5 pending approval</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Active Trips</CardTitle>
            <Clock className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-green-200 mt-1">Currently on trip</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">28</div>
            <p className="text-xs text-purple-200 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader>
          <CardTitle>Recent Trip Requests</CardTitle>
          <CardDescription>Your latest vehicle booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold">Trip to City Center</p>
                  <p className="text-sm text-muted-foreground">Requested 2 hours ago</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
