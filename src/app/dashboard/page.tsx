'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone,
  PhoneCall,
  Settings,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import type { BusinessConfig, CallLog, Customer } from '@/types';

interface DashboardData {
  user: { id: string; email: string } | null;
  customer: Customer | null;
  config: BusinessConfig | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentCalls, setRecentCalls] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get session data
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        if (!sessionData.authenticated) {
          router.push('/auth/login');
          return;
        }

        setData(sessionData);

        // Get recent calls
        const callsRes = await fetch('/api/dashboard/calls?limit=5');
        const callsData = await callsRes.json();
        setRecentCalls(callsData.calls || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleBilling = async () => {
    try {
      const res = await fetch('/api/dashboard/billing', { method: 'POST' });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to open billing:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!data?.config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Setup incomplete</p>
          <a
            href="/onboarding"
            className="text-emerald-600 hover:underline font-medium"
          >
            Complete setup
          </a>
        </div>
      </div>
    );
  }

  const { config } = data;
  const isLive = config.status === 'live';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">
                {config.business_name || 'RingByRing'}
              </h1>
              <p className="text-sm text-gray-500">{data.user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Banner */}
        <div
          className={`rounded-lg p-4 mb-8 ${
            isLive
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {isLive ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <Clock className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <p
                className={`font-medium ${
                  isLive ? 'text-emerald-900' : 'text-yellow-900'
                }`}
              >
                {isLive ? 'RingByRing is live' : 'Setup in progress'}
              </p>
              <p
                className={`text-sm ${
                  isLive ? 'text-emerald-700' : 'text-yellow-700'
                }`}
              >
                {isLive
                  ? `Answering calls at ${config.twilio_number}`
                  : 'Complete setup to start receiving calls'}
              </p>
            </div>
            {!isLive && (
              <a
                href="/onboarding"
                className="ml-auto flex items-center gap-1 text-yellow-700 hover:text-yellow-900 font-medium text-sm"
              >
                Continue setup
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PhoneCall className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {recentCalls.length}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Recent calls</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {config.twilio_number || 'Not assigned'}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Your RingByRing number</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isLive ? 'bg-emerald-100' : 'bg-yellow-100'
                }`}
              >
                {isLive ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <span
                className={`text-lg font-semibold capitalize ${
                  isLive ? 'text-emerald-600' : 'text-yellow-600'
                }`}
              >
                {config.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Status</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a
            href="/dashboard/calls"
            className="bg-white rounded-lg border p-6 hover:border-emerald-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <PhoneCall className="w-8 h-8 text-gray-400 mb-2" />
                <h3 className="font-semibold text-gray-900">Call History</h3>
                <p className="text-sm text-gray-600">View all calls</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
            </div>
          </a>

          <a
            href="/dashboard/settings"
            className="bg-white rounded-lg border p-6 hover:border-emerald-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <Settings className="w-8 h-8 text-gray-400 mb-2" />
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600">Edit your config</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
            </div>
          </a>

          <button
            onClick={handleBilling}
            className="bg-white rounded-lg border p-6 hover:border-emerald-300 transition-colors group text-left w-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <CreditCard className="w-8 h-8 text-gray-400 mb-2" />
                <h3 className="font-semibold text-gray-900">Billing</h3>
                <p className="text-sm text-gray-600">Manage subscription</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
            </div>
          </button>
        </div>

        {/* Recent Calls */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Calls</h2>
            <a
              href="/dashboard/calls"
              className="text-sm text-emerald-600 hover:underline"
            >
              View all
            </a>
          </div>

          {recentCalls.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <PhoneCall className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No calls yet</p>
              <p className="text-sm">
                Calls will appear here once RingByRing starts answering
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {recentCalls.map((call) => (
                <div
                  key={call.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {call.caller_name || call.caller_phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(call.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        call.outcome === 'message_taken'
                          ? 'bg-blue-100 text-blue-800'
                          : call.outcome === 'appointment_booked'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {call.outcome.replace('_', ' ')}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.floor(call.duration_seconds / 60)}:
                      {(call.duration_seconds % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
