/**
 * FUNNEL RESULT SCREEN
 * 
 * Zeigt Fördercheck-Ergebnis nach Frage 7
 */

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FunnelResultProps {
  ergebnis: {
    ergebnis: 'foerderfaehig_90' | 'foerderfaehig_50' | 'nicht_foerderfaehig';
    foerderprozent: number;
    foerderbetrag: number;
    message: string;
  };
  onNext: () => void;
}

export function FunnelResult({ ergebnis, onNext }: FunnelResultProps) {
  const isSuccess = ergebnis.ergebnis !== 'nicht_foerderfaehig';

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className={`${isSuccess ? 'border-green-500' : 'border-red-500'} border-2`}>
        <CardContent className="p-8 text-center space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            {isSuccess ? (
              <span className="text-8xl">🎉</span>
            ) : (
              <span className="text-8xl">😔</span>
            )}
          </motion.div>

          {/* Headline */}
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
              {isSuccess ? 'Fördercheck erfolgreich!' : 'Leider nicht förderfähig'}
            </h2>
            <p className="text-lg text-gray-700">{ergebnis.message}</p>
          </div>

          {/* Förder-Details */}
          {isSuccess && (
            <div className="bg-green-50 rounded-lg p-6 space-y-2">
              <p className="text-sm text-green-600 font-semibold uppercase">Ihre Förderung</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-green-700">{ergebnis.foerderprozent}%</span>
              </div>
              <p className="text-gray-600">
                bis zu <strong>€{ergebnis.foerderbetrag}</strong> Förderung
              </p>
            </div>
          )}

          {/* CTA */}
          {isSuccess && (
            <Button
              onClick={onNext}
              className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
            >
              Jetzt Kurs auswählen →
            </Button>
          )}

          {!isSuccess && (
            <p className="text-sm text-gray-600">
              Sie können dennoch einen Kurs ohne Förderung buchen.
              <br />
              <a href="/kurse" className="text-indigo-600 underline">Zu den Kursen →</a>
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
