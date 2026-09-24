import {
  ChatMessage,
  StructuredSolution,
  SnapSolveAnalysisResult,
  AIContextPayload,
  PracticeSet,
} from '../../../types/ai';
import {
  getDeterministicDemoAnswer,
  DEMO_SNAP_SOLVE_RESULT,
  getDemoPracticeSet,
} from './demoAIService';

export interface ChatRequest {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  context?: AIContextPayload;
  mode?: 'normal' | 'explain-simpler' | 'give-example' | 'practice' | 'test-me';
  subject?: string;
  topic?: string;
}

export interface PracticeRequest {
  subject: string;
  topic: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  count?: number;
}

export interface ChatResponse {
  content: string;
  structuredSolution?: StructuredSolution;
  suggestedActions?: {
    type: string;
    label: string;
    payload?: any;
  }[];
  isDemo?: boolean;
}

export interface SnapSolveRequest {
  imageBase64: string;
  mimeType: string;
  userPrompt?: string;
  context?: AIContextPayload;
}

export interface AIProvider {
  getStatus(): Promise<{ configured: boolean; model: string }>;
  chat(request: ChatRequest): Promise<ChatResponse>;
  snapSolve(request: SnapSolveRequest): Promise<SnapSolveAnalysisResult>;
  generatePractice(request: PracticeRequest): Promise<PracticeSet>;
}

class FocusAIClientProvider implements AIProvider {
  private statusCache: { configured: boolean; model: string } | null = null;

  async getStatus(): Promise<{ configured: boolean; model: string }> {
    if (this.statusCache) return this.statusCache;
    try {
      const res = await fetch('/api/ai/status', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.statusCache = data;
      return data;
    } catch {
      // Offline or dev server without backend API
      return { configured: false, model: 'demo-fallback' };
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      return {
        content: data.content,
        structuredSolution: data.structuredSolution,
        suggestedActions: data.suggestedActions,
        isDemo: data.isDemo || false,
      };
    } catch (err: any) {
      console.warn('AI API call failed, using intelligent demo fallback:', err.message);

      // Fallback to intelligent deterministic academic tutor response
      const lastUserMsg = [...request.messages].reverse().find((m) => m.role === 'user')?.content || '';
      const demoResult = getDeterministicDemoAnswer(lastUserMsg, request.subject);

      return {
        content: demoResult.content,
        suggestedActions: demoResult.actions,
        isDemo: true,
      };
    }
  }

  async snapSolve(request: SnapSolveRequest): Promise<SnapSolveAnalysisResult> {
    try {
      const res = await fetch('/api/ai/snap-solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data: SnapSolveAnalysisResult = await res.json();
      return data;
    } catch (err: any) {
      console.warn('Snap & Solve API call failed, using high-fidelity demo analysis:', err.message);
      // Return high-fidelity demo solution
      return DEMO_SNAP_SOLVE_RESULT;
    }
  }

  async generatePractice(request: PracticeRequest): Promise<PracticeSet> {
    try {
      const res = await fetch('/api/ai/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error('Empty questions returned');
      }

      return {
        id: `prac-${Date.now()}`,
        subject: data.subject || request.subject,
        topic: data.topic || request.topic,
        difficulty: data.difficulty || request.difficulty || 'Medium',
        questions: data.questions,
        completed: false,
      };
    } catch (err: any) {
      console.warn('Practice generation API failed, using curated curriculum demo set:', err.message);
      return getDemoPracticeSet(
        request.subject,
        request.topic,
        request.difficulty || 'Medium',
        request.count || 5
      );
    }
  }
}

export const aiProvider = new FocusAIClientProvider();
