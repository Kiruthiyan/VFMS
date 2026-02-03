"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, MapPin, Clock, User } from "lucide-react";
import Link from "next/link";

export default function TripsPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Trip Scheduling</h1>
                    <p className="text-slate-500 mt-1">Manage and view trip schedules</p>
                </div>
                <Link href="/dashboard/trips/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> New Booking Request
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="schedule" className="w-full">
                <TabsList>
                    <TabsTrigger value="schedule">Schedule View</TabsTrigger>
                    <TabsTrigger value="list">All Trips List</TabsTrigger>
                    <TabsTrigger value="requests">Pending Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-slate-500" /> Weekly Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[500px] flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-xl m-4">
                            <p className="text-slate-400 font-medium">Calendar Component Placeholder</p>
                            {/* Integrate FullCalendar or react-big-calendar here */}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="list" className="mt-6">
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg">
                                            {24 + i}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">Client Visit - Sector {i}</h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 09:00 AM</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Zone {i}</span>
                                                <span className="flex items-center gap-1"><User className="h-3 w-3" /> Driver: John</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-900">Toyota Camry</div>
                                        <div className="text-xs text-slate-500">ABC-1234</div>
                                        <div className="mt-2 inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">CONFIRMED</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
