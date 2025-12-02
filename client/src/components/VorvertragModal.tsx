/**
 * FOERDERPILOT - VORVERTRAG MODAL
 * 
 * Modal für digitale Vertragsunterzeichnung:
 * - Vertrags-Bedingungen anzeigen
 * - Checkboxen für Zustimmung
 * - Unterschrift-Feld
 * - Sign/Decline Actions
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileSignature, AlertCircle, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface VorvertragModalProps {
  participantId: number;
  participantName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VorvertragModal({
  participantId,
  participantName,
  open,
  onOpenChange,
}: VorvertragModalProps) {
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [agreed3, setAgreed3] = useState(false);
  const [signatureName, setSignatureName] = useState("");

  const utils = trpc.useUtils();

  // Get existing vorvertrag
  const { data: vorvertrag, isLoading } = trpc.vorvertrag.getByParticipantId.useQuery(
    { participantId },
    { enabled: open }
  );

  // Sign mutation
  const signMutation = trpc.vorvertrag.sign.useMutation({
    onSuccess: () => {
      toast.success("Vorvertrag erfolgreich unterschrieben!");
      utils.vorvertrag.getByParticipantId.invalidate({ participantId });
      utils.participants.getById.invalidate({ id: participantId });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Decline mutation
  const declineMutation = trpc.vorvertrag.decline.useMutation({
    onSuccess: () => {
      toast.success("Vorvertrag abgelehnt");
      utils.vorvertrag.getByParticipantId.invalidate({ participantId });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const resetForm = () => {
    setAgreed1(false);
    setAgreed2(false);
    setAgreed3(false);
    setSignatureName("");
  };

  const handleSign = () => {
    if (!agreed1 || !agreed2 || !agreed3) {
      toast.error("Bitte stimmen Sie allen Bedingungen zu");
      return;
    }

    if (!signatureName.trim()) {
      toast.error("Bitte geben Sie Ihren Namen ein");
      return;
    }

    // Get client info for tracking
    const ipAddress = ""; // Will be set by backend
    const userAgent = navigator.userAgent;

    signMutation.mutate({
      participantId,
      signatureData: signatureName,
      ipAddress,
      userAgent,
    });
  };

  const handleDecline = () => {
    if (confirm("Möchten Sie den Vorvertrag wirklich ablehnen?")) {
      declineMutation.mutate({ participantId });
    }
  };

  const isAlreadySigned = vorvertrag?.status === "signed";
  const isDeclined = vorvertrag?.status === "declined";
  const canSign = agreed1 && agreed2 && agreed3 && signatureName.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileSignature className="h-6 w-6 text-primary" />
            <DialogTitle>Vorvertrag - Digitale Unterschrift</DialogTitle>
          </div>
          <DialogDescription>
            Teilnehmer: <strong>{participantName}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Lade Vorvertrag...
          </div>
        ) : isAlreadySigned ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Vorvertrag bereits unterschrieben</strong>
              <br />
              Unterschrieben am: {vorvertrag.signedAt ? new Date(vorvertrag.signedAt).toLocaleString("de-DE") : "Unbekannt"}
              <br />
              Unterschrift: {vorvertrag.signatureData}
            </AlertDescription>
          </Alert>
        ) : isDeclined ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Vorvertrag abgelehnt</strong>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Vertrags-Text */}
            <div className="border rounded-lg p-4 bg-muted/50 max-h-64 overflow-y-auto">
              <h3 className="font-semibold mb-2">Vorvertrag - Bedingungen</h3>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p>
                  Hiermit bestätige ich, dass ich die Teilnahme am Förderprogramm beantragen möchte
                  und alle erforderlichen Dokumente vollständig und wahrheitsgemäß eingereicht habe.
                </p>
                <p>
                  Ich verpflichte mich, an allen Kursen und Veranstaltungen teilzunehmen und die
                  Anforderungen des Förderprogramms zu erfüllen.
                </p>
                <p>
                  Ich bin damit einverstanden, dass meine Daten im Rahmen des Förderprogramms
                  verarbeitet werden.
                </p>
              </div>
            </div>

            {/* Checkboxen */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agree1"
                  checked={agreed1}
                  onCheckedChange={(checked) => setAgreed1(checked as boolean)}
                />
                <Label htmlFor="agree1" className="text-sm leading-relaxed cursor-pointer">
                  Ich bestätige, dass alle eingereichten Dokumente vollständig und wahrheitsgemäß sind.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agree2"
                  checked={agreed2}
                  onCheckedChange={(checked) => setAgreed2(checked as boolean)}
                />
                <Label htmlFor="agree2" className="text-sm leading-relaxed cursor-pointer">
                  Ich verpflichte mich zur Teilnahme an allen Kursen und Veranstaltungen.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agree3"
                  checked={agreed3}
                  onCheckedChange={(checked) => setAgreed3(checked as boolean)}
                />
                <Label htmlFor="agree3" className="text-sm leading-relaxed cursor-pointer">
                  Ich stimme der Datenverarbeitung im Rahmen des Förderprogramms zu.
                </Label>
              </div>
            </div>

            {/* Unterschrift-Feld */}
            <div className="space-y-2">
              <Label htmlFor="signature">Digitale Unterschrift (Ihr vollständiger Name)</Label>
              <Input
                id="signature"
                type="text"
                placeholder="Max Mustermann"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                disabled={!agreed1 || !agreed2 || !agreed3}
              />
              <p className="text-xs text-muted-foreground">
                Mit Ihrer Unterschrift bestätigen Sie die Richtigkeit aller Angaben.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {!isAlreadySigned && !isDeclined && (
            <>
              <Button
                variant="outline"
                onClick={handleDecline}
                disabled={declineMutation.isPending}
              >
                Ablehnen
              </Button>
              <Button
                onClick={handleSign}
                disabled={!canSign || signMutation.isPending}
              >
                {signMutation.isPending ? "Unterschreibe..." : "Unterschreiben"}
              </Button>
            </>
          )}
          {(isAlreadySigned || isDeclined) && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
