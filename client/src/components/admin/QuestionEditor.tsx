import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical } from 'lucide-react';

interface Question {
  id?: number;
  questionNumber: number;
  title: string;
  description?: string;
  aiPrompt: string;
  helpText?: string;
  requiredSentencesMin: number;
  requiredSentencesMax: number;
  icon?: string;
  sortOrder: number;
}

interface QuestionEditorProps {
  question: Question;
  questionNumber: number;
  onChange: (updated: Question) => void;
  onDelete: () => void;
}

const ICON_OPTIONS = [
  { value: 'briefcase', label: '💼 Briefcase (Beruf)' },
  { value: 'target', label: '🎯 Target (Ziel)' },
  { value: 'lightbulb', label: '💡 Lightbulb (Idee)' },
  { value: 'rocket', label: '🚀 Rocket (Start)' },
  { value: 'trending-up', label: '📈 Trending Up (Wachstum)' },
  { value: 'users', label: '👥 Users (Team)' },
  { value: 'book-open', label: '📖 Book (Lernen)' },
  { value: 'award', label: '🏆 Award (Erfolg)' },
  { value: 'help-circle', label: '❓ Help Circle (Frage)' },
];

export function QuestionEditor({ question, questionNumber, onChange, onDelete }: QuestionEditorProps) {
  const handleChange = (field: keyof Question, value: any) => {
    onChange({
      ...question,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
            <CardTitle className="text-base">Frage {questionNumber}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`title-${questionNumber}`}>Frage-Titel *</Label>
          <Input
            id={`title-${questionNumber}`}
            value={question.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="z.B. Aktuelle berufliche Tätigkeit"
          />
        </div>

        <div>
          <Label htmlFor={`description-${questionNumber}`}>Beschreibung</Label>
          <Textarea
            id={`description-${questionNumber}`}
            value={question.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Erklärung für den Teilnehmer..."
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor={`helpText-${questionNumber}`}>Hilfe-Text</Label>
          <Textarea
            id={`helpText-${questionNumber}`}
            value={question.helpText || ''}
            onChange={(e) => handleChange('helpText', e.target.value)}
            placeholder="Tipps für den Teilnehmer..."
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor={`aiPrompt-${questionNumber}`}>AI-Prompt *</Label>
          <Textarea
            id={`aiPrompt-${questionNumber}`}
            value={question.aiPrompt}
            onChange={(e) => handleChange('aiPrompt', e.target.value)}
            placeholder="Prompt für AI Text-Generierung..."
            rows={4}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Dieser Prompt wird verwendet, um aus dem User-Input einen professionellen Text zu generieren.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`icon-${questionNumber}`}>Icon</Label>
            <Select
              value={question.icon || 'help-circle'}
              onValueChange={(v) => handleChange('icon', v)}
            >
              <SelectTrigger id={`icon-${questionNumber}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`minSentences-${questionNumber}`}>Min. Sätze</Label>
            <Input
              id={`minSentences-${questionNumber}`}
              type="number"
              value={question.requiredSentencesMin}
              onChange={(e) => handleChange('requiredSentencesMin', parseInt(e.target.value) || 6)}
              min={1}
              max={20}
            />
          </div>

          <div>
            <Label htmlFor={`maxSentences-${questionNumber}`}>Max. Sätze</Label>
            <Input
              id={`maxSentences-${questionNumber}`}
              type="number"
              value={question.requiredSentencesMax}
              onChange={(e) => handleChange('requiredSentencesMax', parseInt(e.target.value) || 10)}
              min={1}
              max={20}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
