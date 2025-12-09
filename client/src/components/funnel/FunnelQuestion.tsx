/**
 * FUNNEL QUESTION COMPONENT
 * 
 * Zeigt EINE Frage pro Screen mit Animation
 * Unterstützt: RadioGroup, Select, Input (Text/Date/Number)
 */

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { useState } from 'react';

export interface Question {
  id: string;
  type: 'radio' | 'select' | 'input' | 'date' | 'number';
  label: string;
  description?: string;
  icon?: string;
  options?: { value: string; label: string; icon?: string }[];
  placeholder?: string;
  inputType?: string;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
}

interface FunnelQuestionProps {
  question: Question;
  onNext: () => void;
  onBack?: () => void;
  currentIndex: number;
  totalQuestions: number;
}

export function FunnelQuestion({ question, onNext, onBack, currentIndex, totalQuestions }: FunnelQuestionProps) {
  const [showCheckmark, setShowCheckmark] = useState(false);

  const handleAnswer = (value: any) => {
    question.onChange(value);
    
    // Auto-advance für Radio/Select (nach Checkmark)
    if (question.type === 'radio' || question.type === 'select') {
      setShowCheckmark(true);
      setTimeout(() => {
        setShowCheckmark(false);
        onNext();
      }, 600);
    }
  };

  const handleManualNext = () => {
    if (question.required && !question.value) {
      return; // Validation fehlt
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Frage {currentIndex + 1} von {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">⏱️ ~2 Min</span>
        </div>

        {/* Question Label */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            {question.icon && <span className="text-4xl">{question.icon}</span>}
            <span>{question.label}</span>
          </h2>
          {question.description && (
            <p className="text-gray-600 text-sm md:text-base">{question.description}</p>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-4">
          {/* RADIO GROUP */}
          {question.type === 'radio' && question.options && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`
                    w-full p-6 rounded-xl border-2 text-left transition-all
                    ${question.value === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {option.icon && <span className="text-3xl">{option.icon}</span>}
                      <span className="text-lg font-medium">{option.label}</span>
                    </div>
                    {question.value === option.value && showCheckmark && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-600"
                      >
                        <Check className="w-6 h-6" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* SELECT DROPDOWN */}
          {question.type === 'select' && question.options && (
            <Select value={question.value?.toString() || ''} onValueChange={handleAnswer}>
              <SelectTrigger className="w-full h-16 text-lg">
                <SelectValue placeholder={question.placeholder || 'Bitte wählen'} />
              </SelectTrigger>
              <SelectContent>
                {question.options.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-lg py-3">
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* TEXT/NUMBER/DATE INPUT */}
          {(question.type === 'input' || question.type === 'date' || question.type === 'number') && (
            <div className="space-y-4">
              <Input
                type={question.type === 'date' ? 'date' : question.type === 'number' ? 'number' : 'text'}
                value={question.value || ''}
                onChange={(e) => question.onChange(e.target.value)}
                placeholder={question.placeholder}
                className="w-full h-16 text-lg"
              />
              <Button
                onClick={handleManualNext}
                disabled={question.required && !question.value}
                className="w-full h-14 text-lg"
              >
                Weiter →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2"
        >
          ← Zurück
        </button>
      )}

      {/* Trust Signals */}
      <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500">
        <span className="flex items-center gap-2">🔒 SSL-verschlüsselt</span>
        <span className="flex items-center gap-2">🛡️ DSGVO-konform</span>
      </div>
    </motion.div>
  );
}
