import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, GripVertical, Trash2, Save, X } from 'lucide-react';
import { QuestionEditor } from './QuestionEditor';

interface WorkflowEditorProps {
  templateId?: number;
  onSave: () => void;
  onCancel: () => void;
}

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

export function WorkflowEditor({ templateId, onSave, onCancel }: WorkflowEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'system' | 'client' | 'course'>('client');
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  const { data: templateData, isLoading } = trpc.workflow.getTemplateById.useQuery(
    { templateId: templateId! },
    { enabled: !!templateId }
  );

  const saveTemplate = trpc.workflow.saveTemplate.useMutation();

  useEffect(() => {
    if (templateData) {
      setName(templateData.name);
      setDescription(templateData.description || '');
      setType(templateData.type as 'system' | 'client' | 'course');
      setIsActive(templateData.isActive ?? true);
      setQuestions(
        templateData.questions.map((q, idx) => ({
          id: q.id,
          questionNumber: q.questionNumber,
          title: q.title,
          description: q.description || '',
          aiPrompt: q.aiPrompt,
          helpText: q.helpText || '',
          requiredSentencesMin: q.requiredSentencesMin || 6,
          requiredSentencesMax: q.requiredSentencesMax || 10,
          icon: q.icon || '',
          sortOrder: idx,
        }))
      );
    }
  }, [templateData]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionNumber: questions.length + 1,
        title: '',
        description: '',
        aiPrompt: '',
        helpText: '',
        requiredSentencesMin: 6,
        requiredSentencesMax: 10,
        icon: 'help-circle',
        sortOrder: questions.length,
      },
    ]);
  };

  const handleUpdateQuestion = (index: number, updated: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = updated;
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    // Re-number questions
    newQuestions.forEach((q, i) => {
      q.questionNumber = i + 1;
      q.sortOrder = i;
    });
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Bitte geben Sie einen Template-Namen ein');
      return;
    }

    if (questions.length === 0) {
      alert('Bitte fügen Sie mindestens eine Frage hinzu');
      return;
    }

    try {
      await saveTemplate.mutateAsync({
        id: templateId,
        name,
        description,
        type,
        isActive,
        questions,
      });
      onSave();
    } catch (error) {
      console.error('Save error:', error);
      alert('Fehler beim Speichern des Templates');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Lade Template...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{templateId ? 'Template bearbeiten' : 'Neues Template'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Grunddaten */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. KOMPASS Social Media"
            />
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Für Social Media Marketing Kurse..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Template-Typ</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Aktiv</Label>
            </div>
          </div>
        </div>

        {/* Fragen */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Fragen ({questions.length})
            </h3>
            <Button onClick={handleAddQuestion} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Frage hinzufügen
            </Button>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="relative">
                <QuestionEditor
                  question={question}
                  questionNumber={index + 1}
                  onChange={(updated) => handleUpdateQuestion(index, updated)}
                  onDelete={() => handleDeleteQuestion(index)}
                />
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Noch keine Fragen hinzugefügt
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={saveTemplate.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveTemplate.isPending ? 'Speichere...' : 'Template Speichern'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
