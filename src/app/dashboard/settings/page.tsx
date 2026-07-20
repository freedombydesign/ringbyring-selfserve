'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  Save,
  Building2,
  Clock,
  Wrench,
  MessageCircle,
  Bell,
  Loader2,
  Check,
  Plus,
  X,
} from 'lucide-react';
import type { BusinessConfig, Industry, BusinessHours, DayOfWeek, DaySchedule } from '@/types';

interface LocalQAPair {
  question: string;
  answer: string;
}

function getDefaultHours(): BusinessHours {
  return {
    timezone: 'America/New_York',
    schedule: {
      monday: { is_open: true, open_time: '09:00', close_time: '17:00' },
      tuesday: { is_open: true, open_time: '09:00', close_time: '17:00' },
      wednesday: { is_open: true, open_time: '09:00', close_time: '17:00' },
      thursday: { is_open: true, open_time: '09:00', close_time: '17:00' },
      friday: { is_open: true, open_time: '09:00', close_time: '17:00' },
      saturday: { is_open: false, open_time: null, close_time: null },
      sunday: { is_open: false, open_time: null, close_time: null },
    },
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'hours' | 'services' | 'qa' | 'notifications'>('business');

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [industry, setIndustry] = useState<Industry | ''>('');
  const [customGreeting, setCustomGreeting] = useState('');
  const [coverageMode, setCoverageMode] = useState<'after_hours' | 'always' | 'overflow' | 'custom'>('after_hours');
  const [businessHours, setBusinessHours] = useState<BusinessHours>(getDefaultHours());
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [qaPairs, setQaPairs] = useState<LocalQAPair[]>([]);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notificationSms, setNotificationSms] = useState('');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/dashboard/config');
        const data = await res.json();

        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }

        if (data.config) {
          setConfig(data.config);
          setBusinessName(data.config.business_name || '');
          setBusinessPhone(data.config.business_phone || '');
          setIndustry(data.config.industry || '');
          setCustomGreeting(data.config.custom_greeting || '');
          setCoverageMode(data.config.coverage_mode || 'after_hours');
          setBusinessHours(data.config.business_hours || getDefaultHours());
          // Extract just service names for simpler editing
          const serviceNames = (data.config.services || []).map((s: { name: string }) => s.name);
          setServices(serviceNames);
          // Extract just question/answer for simpler editing
          const simplifiedQA = (data.config.qa_pairs || []).map((qa: { question: string; answer: string }) => ({
            question: qa.question,
            answer: qa.answer,
          }));
          setQaPairs(simplifiedQA);
          setNotificationEmail(data.config.notification_email || '');
          setNotificationSms(data.config.notification_sms || '');
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConfig();
  }, [router]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Transform services to the full Service type
      const transformedServices = services.map((name, index) => ({
        id: `service-${index}`,
        name,
        description: '',
        duration_minutes: null,
        price: null,
      }));

      // Transform Q&A pairs to the full QAPair type
      const transformedQAPairs = qaPairs.map((qa, index) => ({
        id: `qa-${index}`,
        question: qa.question,
        answer: qa.answer,
        category: 'general' as const,
      }));

      const updates: Partial<BusinessConfig> = {
        business_name: businessName,
        business_phone: businessPhone,
        ...(industry && { industry: industry as Industry }),
        custom_greeting: customGreeting,
        coverage_mode: coverageMode,
        business_hours: businessHours,
        services: transformedServices,
        qa_pairs: transformedQAPairs,
        notification_email: notificationEmail,
        notification_sms: notificationSms,
      };

      const res = await fetch('/api/dashboard/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const addQAPair = () => {
    setQaPairs([...qaPairs, { question: '', answer: '' }]);
  };

  const updateQAPair = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...qaPairs];
    updated[index][field] = value;
    setQaPairs(updated);
  };

  const removeQAPair = (index: number) => {
    setQaPairs(qaPairs.filter((_, i) => i !== index));
  };

  const updateHours = (day: DayOfWeek, field: 'is_open' | 'open_time' | 'close_time', value: string | boolean | null) => {
    setBusinessHours({
      ...businessHours,
      schedule: {
        ...businessHours.schedule,
        [day]: {
          ...businessHours.schedule[day],
          [field]: value,
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building2 },
    { id: 'hours', label: 'Hours & Coverage', icon: Clock },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'qa', label: 'Q&A', icon: MessageCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border p-6">
              {/* Business Info Tab */}
              {activeTab === 'business' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Your Business Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Phone
                        </label>
                        <input
                          type="tel"
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="(555) 123-4567"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Your main business number (callers will be transferred here when needed)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Industry
                        </label>
                        <select
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value as Industry | '')}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Select industry</option>
                          <option value="dental">Dental Office</option>
                          <option value="medspa">Medical Spa / Aesthetics</option>
                          <option value="chiropractor">Chiropractic / Wellness</option>
                          <option value="trades">Home Services (HVAC, Plumbing, Electrical)</option>
                          <option value="salon">Salon / Beauty</option>
                          <option value="auto_repair">Auto Repair</option>
                          <option value="legal">Law Firm / Legal</option>
                          <option value="real_estate">Real Estate</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Custom Greeting (Optional)
                        </label>
                        <textarea
                          value={customGreeting}
                          onChange={(e) => setCustomGreeting(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Thank you for calling [Business Name]! How can I help you today?"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Leave blank to use the default greeting
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hours & Coverage Tab */}
              {activeTab === 'hours' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Coverage Mode</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'after_hours', label: 'After Hours', desc: 'Answer outside business hours' },
                        { value: 'always', label: '24/7', desc: 'Answer all calls' },
                        { value: 'overflow', label: 'Overflow', desc: 'Answer when you miss calls' },
                      ].map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setCoverageMode(mode.value as 'after_hours' | 'always' | 'overflow' | 'custom')}
                          className={`p-4 border rounded-lg text-left transition-colors ${
                            coverageMode === mode.value
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'hover:border-gray-300'
                          }`}
                        >
                          <p className="font-medium text-gray-900">{mode.label}</p>
                          <p className="text-sm text-gray-500">{mode.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {coverageMode !== 'always' && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h2>
                      <div className="space-y-3">
                        {(Object.keys(businessHours.schedule) as DayOfWeek[]).map((day) => {
                          const hours = businessHours.schedule[day];
                          return (
                            <div key={day} className="flex items-center gap-4">
                              <div className="w-28">
                                <span className="text-sm font-medium text-gray-700 capitalize">
                                  {day}
                                </span>
                              </div>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={hours.is_open}
                                  onChange={(e) => updateHours(day, 'is_open', e.target.checked)}
                                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-gray-600">Open</span>
                              </label>
                              {hours.is_open && (
                                <>
                                  <input
                                    type="time"
                                    value={hours.open_time || '09:00'}
                                    onChange={(e) => updateHours(day, 'open_time', e.target.value)}
                                    className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  />
                                  <span className="text-gray-500">to</span>
                                  <input
                                    type="time"
                                    value={hours.close_time || '17:00'}
                                    onChange={(e) => updateHours(day, 'close_time', e.target.value)}
                                    className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  />
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Services You Offer</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      List the services your business offers. RingByRing will use this to answer questions about what you do.
                    </p>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addService()}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., Drain cleaning"
                      />
                      <button
                        onClick={addService}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                    {services.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {services.map((service, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                          >
                            {service}
                            <button
                              onClick={() => removeService(index)}
                              className="p-0.5 hover:bg-gray-200 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No services added yet</p>
                    )}
                  </div>
                </div>
              )}

              {/* Q&A Tab */}
              {activeTab === 'qa' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Common Q&A</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Add questions callers often ask and how RingByRing should answer them.
                    </p>
                    <div className="space-y-4">
                      {qaPairs.map((pair, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-xs font-medium text-gray-500">Q&A #{index + 1}</span>
                            <button
                              onClick={() => removeQAPair(index)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question
                              </label>
                              <input
                                type="text"
                                value={pair.question}
                                onChange={(e) => updateQAPair(index, 'question', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="e.g., Do you offer emergency services?"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Answer
                              </label>
                              <textarea
                                value={pair.answer}
                                onChange={(e) => updateQAPair(index, 'answer', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="e.g., Yes, we offer 24/7 emergency plumbing services..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addQAPair}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Q&A Pair
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Get notified when RingByRing takes a message or books an appointment.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Notifications
                        </label>
                        <input
                          type="email"
                          value={notificationEmail}
                          onChange={(e) => setNotificationEmail(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="you@example.com"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Receive call summaries and messages via email
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMS Notifications
                        </label>
                        <input
                          type="tel"
                          value={notificationSms}
                          onChange={(e) => setNotificationSms(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="(555) 123-4567"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Get text alerts for urgent messages
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
