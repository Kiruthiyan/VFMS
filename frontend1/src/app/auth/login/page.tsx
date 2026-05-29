import { LoginForm } from "@/components/forms/login-form";
import { Truck } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-lg">
              <Truck className="text-amber-400 w-7 h-7" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">FLEETPRO<span className="text-amber-500">.</span></span>
          </Link>
        </div>
        <h2 className="mt-8 text-center text-3xl font-extrabold text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Access your personalized fleet dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}