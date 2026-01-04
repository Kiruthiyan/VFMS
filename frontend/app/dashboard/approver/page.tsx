import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, FileCheck, AlertCircle } from 'lucide-react';

export default function ApproverDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Approval Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Review and approve pending requests.</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
          <FileCheck className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-yellow-200 mt-1">Requires review</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">45</div>
            <p className="text-xs text-green-200 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-rose-500 text-white hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-red-200 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:shadow-xl transition-all duration-200 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-blue-200 mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Review and take action on pending requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                <div className="flex-1">
                  <p className="font-semibold">Trip Request #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">Requested by John Doe • 2 hours ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
