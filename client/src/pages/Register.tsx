/**
 * REDIRECT: /register → /anmeldung
 * Leitet alte Links auf neuen RegisterFunnel um (mit Query-Params)
 * 
 * WICHTIG: Diese Seite ist ein Redirect für Marketing-Links.
 * Die alte E-Mail/Passwort-Registrierung wurde durch den Fördercheck-Funnel ersetzt.
 */

import { useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';

export default function Register() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();

  useEffect(() => {
    // Redirect mit Query-Parametern (z.B. ?courseId=450001)
    // useSearch() gibt Query-String OHNE "?" zurück (z.B. "courseId=450001")
    const targetUrl = searchParams ? `/anmeldung?${searchParams}` : '/anmeldung';
    setLocation(targetUrl);
  }, [searchParams, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Weiterleitung zum Anmeldeformular...</p>
      </div>
    </div>
  );
}
