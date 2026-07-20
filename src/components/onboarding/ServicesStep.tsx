'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { BusinessConfig, Service, QAPair } from '@/types';

interface ServicesStepProps {
  data: Partial<BusinessConfig>;
  onUpdate: (data: Partial<BusinessConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ServicesStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: ServicesStepProps) {
  const [services, setServices] = useState<Service[]>(
    data.services || [{ id: '1', name: '', description: '', duration_minutes: null, price: null }]
  );
  const [qaPairs, setQaPairs] = useState<QAPair[]>(
    data.qa_pairs || []
  );

  const addService = () => {
    setServices([
      ...services,
      { id: Date.now().toString(), name: '', description: '', duration_minutes: null, price: null },
    ]);
  };

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const updateService = (id: string, field: keyof Service, value: string) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addQA = () => {
    setQaPairs([
      ...qaPairs,
      { id: Date.now().toString(), question: '', answer: '', category: 'general' },
    ]);
  };

  const removeQA = (id: string) => {
    setQaPairs(qaPairs.filter((q) => q.id !== id));
  };

  const updateQA = (id: string, field: keyof QAPair, value: string) => {
    setQaPairs(
      qaPairs.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleContinue = () => {
    onUpdate({
      services: services.filter((s) => s.name.trim()),
      qa_pairs: qaPairs.filter((q) => q.question.trim() && q.answer.trim()),
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          What do we need to know?
        </h2>
        <p className="text-sm text-gray-500">
          Add your services and common questions so RingByRing can answer accurately.
        </p>
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services You Offer
        </label>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.id} className="flex gap-2">
              <input
                type="text"
                placeholder="Service name (e.g., Teeth Cleaning)"
                value={service.name}
                onChange={(e) => updateService(service.id, 'name', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm
                  focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Price (optional)"
                value={service.price || ''}
                onChange={(e) => updateService(service.id, 'price', e.target.value)}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm
                  focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {services.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeService(service.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addService}
          className="mt-2 flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {/* Q&A Pairs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Common Questions (Optional)
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Add questions callers frequently ask and how RingByRing should answer.
        </p>

        <div className="space-y-4">
          {qaPairs.map((qa) => (
            <div key={qa.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Question (e.g., What are your hours?)"
                  value={qa.question}
                  onChange={(e) => updateQA(qa.id, 'question', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm
                    focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => removeQA(qa.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                placeholder="Answer RingByRing should give..."
                value={qa.answer}
                onChange={(e) => updateQA(qa.id, 'answer', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                  focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addQA}
          className="mt-2 flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Q&A
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium
            rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg
            hover:bg-emerald-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
