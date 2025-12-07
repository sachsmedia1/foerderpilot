import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  workflowTemplates, 
  workflowQuestions, 
  participantWorkflowAnswers,
  participants,
  courses
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";

export const workflowRouter = router({
  // ============================================================================
  // TEMPLATE MANAGEMENT (Admin)
  // ============================================================================

  /**
   * Get all templates for current tenant
   * Includes system templates + tenant-specific templates
   */
  getTemplates: adminProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get system templates + tenant templates
      const templates = await db
        .select()
        .from(workflowTemplates)
        .where(
          ctx.user.role === 'super_admin' 
            ? undefined // Super admin sees all
            : eq(workflowTemplates.tenantId, ctx.tenant!.id)
        )
        .orderBy(desc(workflowTemplates.createdAt));

      return templates;
    }),

  /**
   * Get single template with all questions
   */
  getTemplateById: adminProcedure
    .input(z.object({
      templateId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [template] = await db
        .select()
        .from(workflowTemplates)
        .where(eq(workflowTemplates.id, input.templateId))
        .limit(1);

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      // Check access
      if (ctx.user.role !== 'super_admin' && template.tenantId !== ctx.tenant!.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Get questions
      const questions = await db
        .select()
        .from(workflowQuestions)
        .where(eq(workflowQuestions.templateId, template.id))
        .orderBy(workflowQuestions.sortOrder);

      return {
        ...template,
        questions,
      };
    }),

  /**
   * Save template (create or update)
   */
  saveTemplate: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(['system', 'client', 'course']).default('client'),
      isActive: z.boolean().default(true),
      questions: z.array(z.object({
        id: z.number().optional(),
        questionNumber: z.number(),
        title: z.string(),
        description: z.string().optional(),
        aiPrompt: z.string(),
        helpText: z.string().optional(),
        requiredSentencesMin: z.number().default(6),
        requiredSentencesMax: z.number().default(10),
        icon: z.string().optional(),
        sortOrder: z.number().default(0),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Create or update template
      let templateId = input.id;

      if (templateId) {
        // Update existing
        await db
          .update(workflowTemplates)
          .set({
            name: input.name,
            description: input.description,
            type: input.type,
            isActive: input.isActive,
            updatedAt: new Date(),
          })
          .where(eq(workflowTemplates.id, templateId));
      } else {
        // Create new
        const [newTemplate] = await db
          .insert(workflowTemplates)
          .values({
            tenantId: ctx.tenant!.id,
            name: input.name,
            description: input.description,
            type: input.type,
            isActive: input.isActive,
          })
          .$returningId();

        templateId = newTemplate.id;
      }

      // Delete old questions
      await db
        .delete(workflowQuestions)
        .where(eq(workflowQuestions.templateId, templateId));

      // Insert new questions
      if (input.questions.length > 0) {
        await db.insert(workflowQuestions).values(
          input.questions.map((q) => ({
            templateId,
            questionNumber: q.questionNumber,
            title: q.title,
            description: q.description,
            aiPrompt: q.aiPrompt,
            helpText: q.helpText,
            requiredSentencesMin: q.requiredSentencesMin,
            requiredSentencesMax: q.requiredSentencesMax,
            icon: q.icon,
            sortOrder: q.sortOrder,
          }))
        );
      }

      return { id: templateId };
    }),

  /**
   * Delete template
   */
  deleteTemplate: adminProcedure
    .input(z.object({
      templateId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check access
      const [template] = await db
        .select()
        .from(workflowTemplates)
        .where(eq(workflowTemplates.id, input.templateId))
        .limit(1);

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      if (ctx.user.role !== 'super_admin' && template.tenantId !== ctx.tenant!.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Delete (cascade will delete questions + answers)
      await db
        .delete(workflowTemplates)
        .where(eq(workflowTemplates.id, input.templateId));

      return { success: true };
    }),

  // ============================================================================
  // PARTICIPANT WORKFLOW
  // ============================================================================

  /**
   * Get template for participant (based on their course)
   * Fallback logic: Course Template → Tenant Default → System Default
   */
  getTemplateForParticipant: protectedProcedure
    .input(z.object({
      participantId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get participant with course
      const [participant] = await db
        .select({
          participant: participants,
          course: courses,
        })
        .from(participants)
        .leftJoin(courses, eq(participants.courseId, courses.id))
        .where(eq(participants.id, input.participantId))
        .limit(1);

      if (!participant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Participant not found" });
      }

      // Check access
      if (participant.participant.userId !== ctx.user.id && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      let template = null;

      // 1. Try course-specific template
      if (participant.course?.workflowTemplateId) {
        [template] = await db
          .select()
          .from(workflowTemplates)
          .where(eq(workflowTemplates.id, participant.course.workflowTemplateId))
          .limit(1);
      }

      // 2. Fallback: Tenant default template
      if (!template) {
        [template] = await db
          .select()
          .from(workflowTemplates)
          .where(
            and(
              eq(workflowTemplates.tenantId, participant.participant.tenantId),
              eq(workflowTemplates.type, 'client'),
              eq(workflowTemplates.isActive, true)
            )
          )
          .limit(1);
      }

      // 3. Fallback: System default
      if (!template) {
        [template] = await db
          .select()
          .from(workflowTemplates)
          .where(
            and(
              eq(workflowTemplates.type, 'system'),
              eq(workflowTemplates.isActive, true)
            )
          )
          .limit(1);
      }

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No workflow template found" });
      }

      // Get questions
      const questions = await db
        .select()
        .from(workflowQuestions)
        .where(eq(workflowQuestions.templateId, template.id))
        .orderBy(workflowQuestions.sortOrder);

      return {
        ...template,
        questions,
      };
    }),

  /**
   * Process user input (voice or text) → AI generation
   */
  processUserInput: protectedProcedure
    .input(z.object({
      participantId: z.number(),
      questionId: z.number(),
      inputType: z.enum(['voice', 'text']),
      content: z.string(), // Base64 audio or text
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get question
      const [question] = await db
        .select()
        .from(workflowQuestions)
        .where(eq(workflowQuestions.id, input.questionId))
        .limit(1);

      if (!question) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }

      let userText = input.content;

      // If voice, transcribe first
      if (input.inputType === 'voice') {
        try {
          // Convert base64 to buffer
          const audioBuffer = Buffer.from(input.content.split(',')[1] || input.content, 'base64');
          
          // Save to temp file
          const tempPath = `/tmp/voice_${Date.now()}.wav`;
          require('fs').writeFileSync(tempPath, audioBuffer);

          // Transcribe
          const transcription = await transcribeAudio({
            audioUrl: tempPath,
            language: 'de',
          });

          userText = transcription.text;

          // Clean up
          require('fs').unlinkSync(tempPath);
        } catch (error) {
          console.error('[processUserInput] Voice transcription error:', error);
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: "Voice transcription failed" 
          });
        }
      }

      // Generate AI text
      const aiPrompt = `${question.aiPrompt}

Benutzer-Input: "${userText}"

Schreibe einen professionellen Text in 3. Person Singular, ${question.requiredSentencesMin}-${question.requiredSentencesMax} Sätze, der die Situation des Teilnehmers beschreibt.`;

      let aiGeneratedText = '';

      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'Du bist ein professioneller Texter für KOMPASS-Förderanträge.' },
            { role: 'user', content: aiPrompt },
          ],
        });

        aiGeneratedText = response.choices[0].message.content || '';
      } catch (error) {
        console.error('[processUserInput] AI generation error:', error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "AI text generation failed" 
        });
      }

      // Save answer
      await db
        .insert(participantWorkflowAnswers)
        .values({
          participantId: input.participantId,
          questionId: input.questionId,
          userInput: userText,
          aiGeneratedText,
          finalText: aiGeneratedText,
          inputMethod: input.inputType,
        })
        .onDuplicateKeyUpdate({
          set: {
            userInput: userText,
            aiGeneratedText,
            finalText: aiGeneratedText,
            inputMethod: input.inputType,
            updatedAt: new Date(),
          },
        });

      return {
        userInput: userText,
        aiGeneratedText,
      };
    }),

  /**
   * Save final edited answer
   */
  saveFinalAnswer: protectedProcedure
    .input(z.object({
      participantId: z.number(),
      questionId: z.number(),
      finalText: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db
        .update(participantWorkflowAnswers)
        .set({
          finalText: input.finalText,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(participantWorkflowAnswers.participantId, input.participantId),
            eq(participantWorkflowAnswers.questionId, input.questionId)
          )
        );

      return { success: true };
    }),

  /**
   * Get participant's answers
   */
  getParticipantAnswers: protectedProcedure
    .input(z.object({
      participantId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const answers = await db
        .select()
        .from(participantWorkflowAnswers)
        .where(eq(participantWorkflowAnswers.participantId, input.participantId));

      return answers;
    }),
});
