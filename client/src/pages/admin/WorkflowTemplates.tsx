import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Trash2, Edit, Copy } from 'lucide-react';
import { WorkflowEditor } from '@/components/admin/WorkflowEditor';
import { toast } from 'sonner';

export default function WorkflowTemplates() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | 'new' | null>(null);


  const { data: templates, isLoading, refetch } = trpc.workflow.getTemplates.useQuery();
  const deleteTemplate = trpc.workflow.deleteTemplate.useMutation();
  const duplicateTemplate = trpc.workflow.duplicateTemplate.useMutation();

  const handleDelete = async (templateId: number) => {
    if (!confirm('Template wirklich löschen? Alle zugehörigen Fragen und Antworten werden ebenfalls gelöscht.')) {
      return;
    }

    try {
      await deleteTemplate.mutateAsync({ templateId });
      toast({
        title: 'Template gelöscht',
        description: 'Das Template wurde erfolgreich gelöscht.',
      });
      refetch();
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null);
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Template konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSuccess = () => {
    refetch();
    setSelectedTemplateId(null);
    toast({
      title: 'Template gespeichert',
      description: 'Das Template wurde erfolgreich gespeichert.',
    });
  };

  const handleDuplicate = async (templateId: number, templateName: string) => {
    try {
      const result = await duplicateTemplate.mutateAsync({ templateId });
      toast({
        title: 'Template dupliziert',
        description: `"${result.name}" wurde erstellt.`,
      });
      refetch();
      setSelectedTemplateId(result.id);
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Template konnte nicht dupliziert werden.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Lade Templates...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workflow Templates</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Begründungsfragen für verschiedene Kurstypen
          </p>
        </div>
        <Button onClick={() => setSelectedTemplateId('new')}>
          <Plus className="w-4 h-4 mr-2" />
          Neues Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Liste */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">System Templates</h2>
            {templates?.filter(t => t.type === 'system').length === 0 && (
              <p className="text-sm text-muted-foreground">Keine System-Templates vorhanden</p>
            )}
            {templates?.filter(t => t.type === 'system').map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateId === template.id}
                onSelect={() => setSelectedTemplateId(template.id)}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Client Templates</h2>
            {templates?.filter(t => t.type === 'client').length === 0 && (
              <p className="text-sm text-muted-foreground">Keine Client-Templates vorhanden</p>
            )}
            {templates?.filter(t => t.type === 'client').map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateId === template.id}
                onSelect={() => setSelectedTemplateId(template.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {selectedTemplateId === 'new' && (
            <WorkflowEditor
              onSave={handleSaveSuccess}
              onCancel={() => setSelectedTemplateId(null)}
            />
          )}
          {typeof selectedTemplateId === 'number' && (
            <WorkflowEditor
              templateId={selectedTemplateId}
              onSave={handleSaveSuccess}
              onCancel={() => setSelectedTemplateId(null)}
            />
          )}
          {!selectedTemplateId && (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Wählen Sie ein Template aus oder erstellen Sie ein neues</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}

interface TemplateCardProps {
  template: {
    id: number;
    name: string;
    description: string | null;
    type: string;
    isActive: boolean | null;
  };
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: number) => void;
  onDuplicate?: (id: number, name: string) => void;
}

function TemplateCard({ template, isSelected, onSelect, onDelete, onDuplicate }: TemplateCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{template.name}</CardTitle>
            {template.description && (
              <CardDescription className="text-xs mt-1">
                {template.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {template.isActive ? (
              <Badge variant="default" className="text-xs">Aktiv</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Inaktiv</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {template.type === 'system' ? 'System' : 'Client'}
          </Badge>
          <div className="flex items-center gap-2">
            {template.type === 'system' && onDuplicate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(template.id, template.name);
                }}
                title="Template duplizieren"
              >
                <Copy className="w-3 h-3" />
              </Button>
            )}
            {template.type !== 'system' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
            )}
            {template.type !== 'system' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(template.id);
                }}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
