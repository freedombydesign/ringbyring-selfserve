'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  Calendar,
  Clock,
} from 'lucide-react';
import type { CallLog } from '@/types';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CallsPage() {
  const router = useRouter();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  const fetchCalls = async (page: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/calls?page=${page}&limit=20`);
      const data = await res.json();

      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }

      setCalls(data.calls || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls(1);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const outcomeColors: Record<string, string> = {
    message_taken: 'bg-blue-100 text-blue-800',
    appointment_booked: 'bg-emerald-100 text-emerald-800',
    transferred: 'bg-purple-100 text-purple-800',
    voicemail: 'bg-yellow-100 text-yellow-800',
    hangup: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-gray-900">Call History</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Loading...
            </div>
          ) : calls.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <PhoneCall className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No calls yet</p>
              <p className="text-sm">
                Calls will appear here once RingByRing starts answering
              </p>
            </div>
          ) : (
            <>
              {/* Call List */}
              <div className="divide-y">
                {calls.map((call) => (
                  <button
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <PhoneCall className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {call.caller_name || call.caller_phone}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(call.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(call.duration_seconds)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          outcomeColors[call.outcome] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {call.outcome.replace('_', ' ')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchCalls(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => fetchCalls(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Call Detail Modal */}
        {selectedCall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Call Details</h2>
                <button
                  onClick={() => setSelectedCall(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Caller</p>
                    <p className="font-medium">
                      {selectedCall.caller_name || selectedCall.caller_phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedCall.caller_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {formatDate(selectedCall.timestamp)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {formatDuration(selectedCall.duration_seconds)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Outcome</p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        outcomeColors[selectedCall.outcome] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedCall.outcome.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {selectedCall.message && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Message</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedCall.message}</p>
                    </div>
                  </div>
                )}

                {selectedCall.transcript &&
                  selectedCall.transcript.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Transcript</p>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-60 overflow-auto">
                        {selectedCall.transcript.map((entry, i) => (
                          <div key={i}>
                            <span
                              className={`text-xs font-medium ${
                                entry.speaker === 'ringbyring'
                                  ? 'text-emerald-600'
                                  : 'text-blue-600'
                              }`}
                            >
                              {entry.speaker === 'ringbyring'
                                ? 'RingByRing'
                                : 'Caller'}
                              :
                            </span>
                            <p className="text-gray-700">{entry.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedCall.recording_url && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Recording</p>
                    <audio
                      controls
                      src={selectedCall.recording_url}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
