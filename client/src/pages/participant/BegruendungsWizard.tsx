import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  MicOff, 
  Type, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function BegruendungsWizard() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const participantId = parseInt(params.id || '0');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputMethod, setInputMethod] = useState<'text' | 'voice'>('text');
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [finalText, setFinalText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { data: templateData, isLoading: templateLoading } = trpc.workflow.getTemplateForParticipant.useQuery(
    { participantId },
    { enabled: !!participantId }
  );

  const { data: existingAnswers, refetch: refetchAnswers } = trpc.workflow.getParticipantAnswers.useQuery(
    { participantId },
    { enabled: !!participantId }
  );

  const processInput = trpc.workflow.processUserInput.useMutation();
  const saveFinal = trpc.workflow.saveFinalAnswer.useMutation();

  const questions = templateData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Load existing answer for current question
  useEffect(() => {
    if (currentQuestion && existingAnswers) {
      const existingAnswer = existingAnswers.find(a => a.questionId === currentQuestion.id);
      if (existingAnswer) {
        setTextInput(existingAnswer.userInput || '');
        setAiGeneratedText(existingAnswer.aiGeneratedText || '');
        setFinalText(existingAnswer.finalText || '');
        setInputMethod(existingAnswer.inputMethod as 'text' | 'voice');
      } else {
        // Reset for new question
        setTextInput('');
        setAiGeneratedText('');
        setFinalText('');
      }
    }
  }, [currentQuestion, existingAnswers]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await handleProcessInput(base64Audio, 'voice');
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Aufnahme gestartet', { description: 'Sprechen Sie jetzt...' });
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Mikrofon-Zugriff fehlgeschlagen', {
        description: 'Bitte erlauben Sie den Zugriff auf Ihr Mikrofon.',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info('Aufnahme beendet', { description: 'Verarbeite Audio...' });
    }
  };

  const handleProcessInput = async (content: string, method: 'text' | 'voice') => {
    if (!currentQuestion) return;

    setIsProcessing(true);
    try {
      const result = await processInput.mutateAsync({
        participantId,
        questionId: currentQuestion.id!,
        inputType: method,
        content,
      });

      setTextInput(result.userInput);
      setAiGeneratedText(result.aiGeneratedText);
      setFinalText(result.aiGeneratedText);
      
      toast.success('Text generiert', {
        description: 'Sie können den Text jetzt bearbeiten.',
      });
    } catch (error) {
      console.error('Process error:', error);
      toast.error('Verarbeitung fehlgeschlagen', {
        description: 'Bitte versuchen Sie es erneut.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFromText = () => {
    if (!textInput.trim()) {
      toast.error('Bitte geben Sie Text ein');
      return;
    }
    handleProcessInput(textInput, 'text');
  };

  const handleSaveAndNext = async () => {
    if (!currentQuestion || !finalText.trim()) {
      toast.error('Bitte generieren oder bearbeiten Sie den Text');
      return;
    }

    try {
      await saveFinal.mutateAsync({
        participantId,
        questionId: currentQuestion.id!,
        finalText,
      });

      await refetchAnswers();

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        toast.success('Antwort gespeichert');
      } else {
        toast.success('Alle Fragen beantwortet!', {
          description: 'Sie haben den Begründungs-Wizard abgeschlossen.',
        });
        setLocation('/teilnehmer/dashboard');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Speichern fehlgeschlagen');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const countSentences = (text: string) => {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  };

  const sentenceCount = countSentences(finalText);
  const minSentences = currentQuestion?.requiredSentencesMin || 6;
  const maxSentences = currentQuestion?.requiredSentencesMax || 10;
  const isValidLength = sentenceCount >= minSentences && sentenceCount <= maxSentences;

  if (templateLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!templateData || questions.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Kein Workflow-Template gefunden</p>
            <p className="text-sm text-muted-foreground mt-2">
              Bitte kontaktieren Sie Ihren Bildungsträger.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Begründungs-Wizard</h1>
          <Badge variant="outline">
            Frage {currentQuestionIndex + 1} von {totalQuestions}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">
              {currentQuestion?.icon === 'briefcase' && '💼'}
              {currentQuestion?.icon === 'target' && '🎯'}
              {currentQuestion?.icon === 'lightbulb' && '💡'}
              {currentQuestion?.icon === 'rocket' && '🚀'}
              {currentQuestion?.icon === 'trending-up' && '📈'}
              {currentQuestion?.icon === 'users' && '👥'}
              {currentQuestion?.icon === 'book-open' && '📖'}
              {currentQuestion?.icon === 'award' && '🏆'}
              {!currentQuestion?.icon && '❓'}
            </span>
            {currentQuestion?.title}
          </CardTitle>
          {currentQuestion?.description && (
            <CardDescription>{currentQuestion.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Method Tabs */}
          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as 'text' | 'voice')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">
                <Type className="w-4 h-4 mr-2" />
                Text eingeben
              </TabsTrigger>
              <TabsTrigger value="voice">
                <Mic className="w-4 h-4 mr-2" />
                Sprechen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Beschreiben Sie Ihre Situation in eigenen Worten..."
                  rows={4}
                  className="resize-none"
                />
                {currentQuestion?.helpText && (
                  <p className="text-sm text-muted-foreground mt-2">
                    💡 {currentQuestion.helpText}
                  </p>
                )}
              </div>
              <Button
                onClick={handleGenerateFromText}
                disabled={!textInput.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generiere Text...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Professionellen Text generieren
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="voice" className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Button
                  size="lg"
                  variant={isRecording ? 'destructive' : 'default'}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className="w-32 h-32 rounded-full"
                >
                  {isRecording ? (
                    <MicOff className="w-12 h-12" />
                  ) : (
                    <Mic className="w-12 h-12" />
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {isRecording ? 'Aufnahme läuft... Klicken zum Stoppen' : 'Klicken zum Aufnehmen'}
                </p>
                {currentQuestion?.helpText && (
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    💡 {currentQuestion.helpText}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* AI Generated Text */}
          {aiGeneratedText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Generierter Text (editierbar)</label>
                <div className="flex items-center gap-2">
                  <Badge variant={isValidLength ? 'default' : 'secondary'}>
                    {sentenceCount} Sätze
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({minSentences}-{maxSentences} empfohlen)
                  </span>
                </div>
              </div>
              <Textarea
                value={finalText}
                onChange={(e) => setFinalText(e.target.value)}
                rows={8}
                className="font-serif"
              />
              {!isValidLength && (
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Empfehlung: {minSentences}-{maxSentences} Sätze für optimale Begründung
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>
        <Button
          onClick={handleSaveAndNext}
          disabled={!finalText.trim() || saveFinal.isPending}
        >
          {saveFinal.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Speichere...
            </>
          ) : currentQuestionIndex < totalQuestions - 1 ? (
            <>
              Speichern & Weiter
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Abschließen
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
