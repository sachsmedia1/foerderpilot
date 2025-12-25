/**
 * CUSTOM HOOK: useFunnelState
 * 
 * Features:
 * - Auto-Save zu localStorage nach jeder Änderung
 * - Auto-Restore beim Mount
 * - Automatisches Clear nach 7 Tagen
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'foerderpilot_funnel_state';
const EXPIRY_DAYS = 7;

export interface FunnelState {
  currentStep: number;
  currentQuestion: number;
  foerdercheck: {
    wohnsitzDeutschland: boolean;
    hauptberuflichSelbststaendig: boolean;
    mindestens51ProzentEinkuenfte: boolean;
    mitarbeiterVzae: number;
    selbststaendigkeitSeit: string;
    deminimisBeihilfen: number;
    kompassSchecksAnzahl: number;
    hadKompassCheck: boolean; // NEU: Ob bereits KOMPASS-Check erhalten
    letzterKompassScheckDatum: string;
  };
  selectedCourseId: number | null;
  persoenlicheDaten: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    zipCode: string;
    city: string;
    company: string;
    dateOfBirth: string;
  };
  checkboxes: {
    zuarbeit: boolean;
    teilnahme: boolean;
    datenschutz: boolean;
    agb: boolean;
  };
  savedAt?: number;
}

const defaultState: FunnelState = {
  currentStep: 1,
  currentQuestion: 0,
  foerdercheck: {
    wohnsitzDeutschland: true,
    hauptberuflichSelbststaendig: true,
    mindestens51ProzentEinkuenfte: true,
    mitarbeiterVzae: 0,
    selbststaendigkeitSeit: '',
    deminimisBeihilfen: 0,
    kompassSchecksAnzahl: 0,
    hadKompassCheck: false, // Default: Nein
    letzterKompassScheckDatum: '',
  },
  selectedCourseId: null,
  persoenlicheDaten: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    zipCode: '',
    city: '',
    company: '',
    dateOfBirth: '',
  },
  checkboxes: {
    zuarbeit: false,
    teilnahme: false,
    datenschutz: false,
    agb: false,
  },
};

export function useFunnelState() {
  const [state, setState] = useState<FunnelState>(() => {
    // Auto-Restore from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return defaultState;

      const parsed = JSON.parse(saved);
      
      // Check expiry (7 days)
      if (parsed.savedAt) {
        const daysSince = (Date.now() - parsed.savedAt) / (1000 * 60 * 60 * 24);
        if (daysSince > EXPIRY_DAYS) {
          localStorage.removeItem(STORAGE_KEY);
          return defaultState;
        }
      }

      return { ...defaultState, ...parsed };
    } catch (error) {
      console.error('Error loading funnel state:', error);
      return defaultState;
    }
  });

  // Auto-Save to localStorage on every change
  useEffect(() => {
    try {
      const toSave = { ...state, savedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving funnel state:', error);
    }
  }, [state]);

  const updateFoerdercheck = (updates: Partial<FunnelState['foerdercheck']>) => {
    setState(prev => ({
      ...prev,
      foerdercheck: { ...prev.foerdercheck, ...updates },
    }));
  };

  const updatePersoenlicheDaten = (updates: Partial<FunnelState['persoenlicheDaten']>) => {
    setState(prev => ({
      ...prev,
      persoenlicheDaten: { ...prev.persoenlicheDaten, ...updates },
    }));
  };

  const updateCheckboxes = (updates: Partial<FunnelState['checkboxes']>) => {
    setState(prev => ({
      ...prev,
      checkboxes: { ...prev.checkboxes, ...updates },
    }));
  };

  const nextStep = () => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1, currentQuestion: 0 }));
  };

  const prevStep = () => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep - 1, currentQuestion: 0 }));
  };

  const nextQuestion = () => {
    setState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
  };

  const prevQuestion = () => {
    setState(prev => ({ ...prev, currentQuestion: Math.max(0, prev.currentQuestion - 1) }));
  };

  const setStep = (step: number) => {
    setState(prev => ({ ...prev, currentStep: step, currentQuestion: 0 }));
  };

  const setCourseId = (courseId: number | null) => {
    setState(prev => ({ ...prev, selectedCourseId: courseId }));
  };

  const clearState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
  };

  return {
    state,
    updateFoerdercheck,
    updatePersoenlicheDaten,
    updateCheckboxes,
    nextStep,
    prevStep,
    nextQuestion,
    prevQuestion,
    setStep,
    setCourseId,
    clearState,
  };
}
