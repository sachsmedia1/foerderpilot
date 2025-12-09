/**
 * FUNNEL QUESTION COMPONENT
 * 
 * Zeigt EINE Frage pro Screen mit Animation
 * Unterstützt: RadioGroup, Select, Input (Text/Date/Number)
 * 
 * DESIGN: Professional, kompakt, business-like
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
  helpText?: string;
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
          PROGRESS BAR (Kompakt & Professional)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mb-5">
        <Progress 
          value={((currentIndex + 1) / totalQuestions) * 100} 
          className="h-2 mb-2" 
        />
        <div className="flex justify-between text-xs">
          <span className="font-medium text-indigo-600">
            Frage {currentIndex + 1} von {totalQuestions}
          </span>
          <span className="text-gray-500">~2 Min</span>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOKUS-CARD (Kompakt, Professional)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <Card className="shadow-lg border border-gray-200">
        <CardContent className="p-6 md:p-8 space-y-6">
          
          {/* Frage-Label (OHNE Icon) */}
          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              {question.label}
            </h2>
            {question.description && (
              <p className="text-sm md:text-base text-gray-600">
                {question.description}
              </p>
            )}
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              ANSWER OPTIONS (Kompakt & Professional)
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
                      w-full p-4 md:p-5 rounded-lg border text-left transition-all
                      ${question.value === option.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                      }
                    `}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {option.icon && <span className="text-xl md:text-2xl">{option.icon}</span>}
                        <span className="text-base md:text-lg font-medium">{option.label}</span>
                      </div>
                      {question.value === option.value && showCheckmark && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-600"
                        >
                          <Check className="w-5 h-5" />
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
                  <SelectTrigger className="h-12 md:h-14 text-base border hover:border-indigo-400">
                    <SelectValue placeholder={question.placeholder || 'Bitte wählen...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-base py-2"
                      >
                        {option.icon && <span className="mr-2 text-lg">{option.icon}</span>}
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* HILFE-TEXT (Kompakt) */}
                {question.helpText && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs md:text-sm text-blue-900">
                      <span className="text-base mr-1">💡</span>
                      <strong>Tipp:</strong> {question.helpText}
                    </p>
                  </div>
                )}

                {/* Weiter-Button bei Select */}
                <Button
                  onClick={handleManualNext}
                  disabled={(question.required && !question.value) || isSubmitting}
                  className="w-full h-11 md:h-12 text-base font-medium bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLastQuestion ? (isSubmitting ? "Prüfe..." : "Förderfähigkeit prüfen") : "Weiter →"}
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
                  className="h-12 md:h-14 text-base border"
                />
                
                {/* HILFE-TEXT für Input */}
                {question.helpText && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs md:text-sm text-blue-900">
                      <span className="text-base mr-1">💡</span>
                      <strong>Tipp:</strong> {question.helpText}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleManualNext}
                  disabled={(question.required && !question.value) || isSubmitting}
                  className="w-full h-11 md:h-12 text-base font-medium bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLastQuestion ? (isSubmitting ? "Prüfe..." : "Förderfähigkeit prüfen") : "Weiter →"}
                </Button>
              </div>
            )}
          </div>

          {/* BACK BUTTON */}
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2 mx-auto"
            >
              ← Zurück
            </button>
          )}

        </CardContent>
      </Card>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TRUST-SIGNALE (Kompakt)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🔒</span>
          <span>SSL-verschlüsselt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">🛡️</span>
          <span>DSGVO-konform</span>
        </div>
      </div>
    </motion.div>
  );
}
