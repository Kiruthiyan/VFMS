"use client";

import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
    return (
        <ModuleLayout title="Reports & Analytics">
            <div className="space-y-6">
                <Tabs defaultValue="fuel" className="w-full">
                    <TabsList className="bg-slate-100">
                        <TabsTrigger value="fuel">Fuel Reports</TabsTrigger>
                        <TabsTrigger value="vehicle">Vehicle Reports</TabsTrigger>
                        <TabsTrigger value="trip">Trip Reports</TabsTrigger>
                        <TabsTrigger value="financial">Financial Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="fuel" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Monthly Fuel Report</CardTitle>
                                            <CardDescription>Consumption and costs by month</CardDescription>
                                        </div>
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Fuel By Vehicle</CardTitle>
                                            <CardDescription>Per-vehicle consumption analysis</CardDescription>
                                        </div>
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Station Analysis</CardTitle>
                                            <CardDescription>Spending by fuel station</CardDescription>
                                        </div>
                                        <FileText className="h-5 w-5 text-amber-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="vehicle">
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Vehicle reports coming soon</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="trip">
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Trip reports coming soon</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="financial">
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Financial reports coming soon</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ModuleLayout>
    );
}
