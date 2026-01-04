import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function DriverDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            Driver Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">View your assigned trips and complete your routes.</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl shadow-lg">
          <Navigation className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Active Trip Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">Active Trip</CardTitle>
              <CardDescription className="text-purple-200">Trip #1001 - In Progress</CardDescription>
            </div>
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-purple-200 mb-1">From</p>
              <p className="font-semibold text-lg">Office Building</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-purple-200 mb-1">To</p>
              <p className="font-semibold text-lg">City Center</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-purple-200 mb-1">Estimated Time</p>
              <p className="font-semibold text-lg">45 minutes</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="bg-white text-purple-600 hover:bg-purple-50 flex-1">
              <Navigation className="h-4 w-4 mr-2" />
              View Route
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete Trip
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">127</div>
            <p className="text-xs text-green-200 mt-1">Total trips</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">This Month</CardTitle>
            <Clock className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">23</div>
            <p className="text-xs text-blue-200 mt-1">Trips completed</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Rating</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.8</div>
            <p className="text-xs text-orange-200 mt-1">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Trips */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader>
          <CardTitle>Upcoming Trips</CardTitle>
          <CardDescription>Your scheduled trips for the next few days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-900/50 dark:to-purple-900/20 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold">Trip #{1002 + i}</p>
                  <p className="text-sm text-muted-foreground">Scheduled for tomorrow at 9:00 AM</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Scheduled
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
