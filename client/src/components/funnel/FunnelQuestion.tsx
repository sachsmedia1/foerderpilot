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
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';
import { useState } from 'react';

export interface Question {
  id: string;
  type: 'radio' | 'select' | 'input' | 'date' | 'number';
  label: string;
  description?: string;
  icon?: string;
  helpText?: string; // ← NEU: Für Tooltips/Hilfe-Texte
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
  isLastQuestion?: boolean;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

export function FunnelQuestion({ question, onNext, onBack, currentIndex, totalQuestions, isLastQuestion, onSubmit, isSubmitting }: FunnelQuestionProps) {
  const [showCheckmark, setShowCheckmark] = useState(false);

  const handleAnswer = (value: any) => {
    question.onChange(value);
    
    // Auto-advance für Radio (nach Checkmark)
    if (question.type === 'radio') {
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
    if (isLastQuestion && onSubmit) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-full max-w-3xl mx-auto px-4"
    >
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PROGRESS BAR (Prominent & Animiert)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-6">
        <Progress 
          value={((currentIndex + 1) / totalQuestions) * 100} 
          className="h-3 mb-2" 
        />
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-indigo-700">
            Frage {currentIndex + 1} von {totalQuestions}
          </span>
          <span className="text-gray-600">⏱️ ~2 Min</span>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOKUS-CARD (Shadow + Border für Prominence)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Card className="shadow-2xl border-2 border-indigo-100">
        <CardContent className="p-8 md:p-12 space-y-8">
          
          {/* Icon + Frage-Label */}
          <div className="text-center">
            {question.icon && (
              <div className="mb-4">
                <span className="text-5xl md:text-6xl">{question.icon}</span>
              </div>
            )}
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
              {question.label}
            </h2>
            {question.description && (
              <p className="text-base md:text-lg text-gray-600">
                {question.description}
              </p>
            )}
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              ANSWER OPTIONS (Größer & Klarer)
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="space-y-4">
            
            {/* RADIO GROUP */}
            {question.type === 'radio' && question.options && (
              <div className="space-y-3">
                {question.options.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`
                      w-full p-6 md:p-8 rounded-xl border-2 text-left transition-all
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
                        {option.icon && <span className="text-3xl md:text-4xl">{option.icon}</span>}
                        <span className="text-lg md:text-xl font-medium">{option.label}</span>
                      </div>
                      {question.value === option.value && showCheckmark && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-600"
                        >
                          <Check className="w-6 h-6 md:w-8 md:h-8" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* SELECT DROPDOWN */}
            {question.type === 'select' && question.options && (
              <div className="space-y-4">
                <Select 
                  value={question.value?.toString() || ''} 
                  onValueChange={question.onChange}
                >
                  <SelectTrigger className="h-16 md:h-20 text-lg md:text-xl border-2 hover:border-indigo-500">
                    <SelectValue placeholder={question.placeholder || 'Bitte wählen...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-lg md:text-xl py-4"
                      >
                        {option.icon && <span className="mr-2 text-2xl">{option.icon}</span>}
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* HILFE-TEXT (NEU!) */}
                {question.helpText && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-sm md:text-base text-blue-900">
                      <span className="text-xl mr-2">💡</span>
                      <strong>Tipp:</strong> {question.helpText}
                    </p>
                  </div>
                )}

                {/* Weiter-Button bei Select */}
                <Button
                  onClick={handleManualNext}
                  disabled={(question.required && !question.value) || isSubmitting}
                  size="lg"
                  className="w-full h-14 md:h-16 text-lg md:text-xl bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLastQuestion ? (isSubmitting ? "Prüfe Förderfähigkeit..." : "Förderfähigkeit prüfen") : "Weiter zur nächsten Frage →"}
                </Button>
              </div>
            )}

            {/* TEXT/NUMBER/DATE INPUT */}
            {(question.type === 'input' || question.type === 'date' || question.type === 'number') && (
              <div className="space-y-4">
                <Input
                  type={question.type === 'date' ? 'date' : question.type === 'number' ? 'number' : 'text'}
                  value={question.value || ''}
                  onChange={(e) => question.onChange(e.target.value)}
                  placeholder={question.placeholder}
                  className="h-16 md:h-20 text-lg md:text-xl border-2"
                />
                
                {/* HILFE-TEXT für Input */}
                {question.helpText && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-sm md:text-base text-blue-900">
                      <span className="text-xl mr-2">💡</span>
                      <strong>Tipp:</strong> {question.helpText}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleManualNext}
                  disabled={(question.required && !question.value) || isSubmitting}
                  size="lg"
                  className="w-full h-14 md:h-16 text-lg md:text-xl bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLastQuestion ? (isSubmitting ? "Prüfe Förderfähigkeit..." : "Förderfähigkeit prüfen") : "Weiter zur nächsten Frage →"}
                </Button>
              </div>
            )}
          </div>

          {/* BACK BUTTON */}
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 text-sm md:text-base flex items-center gap-2 mx-auto"
            >
              ← Zurück zur vorherigen Frage
            </button>
          )}

        </CardContent>
      </Card>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TRUST-SIGNALE (Unten, aber sichtbarer)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mt-8 flex items-center justify-center gap-6 text-sm md:text-base text-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">🔒</span>
          <span>SSL-verschlüsselt</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl md:text-2xl">🛡️</span>
          <span>DSGVO-konform</span>
        </div>
      </div>
    </motion.div>
  );
}
