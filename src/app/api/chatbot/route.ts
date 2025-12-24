import { NextRequest, NextResponse } from 'next/server';
import { chat, searchScholarships, runEligibilityChecker } from '@/lib/chatbot/rag-chatbot';
import type { ChatMessage, UserProfile } from '@/lib/chatbot/rag-chatbot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, message, conversationHistory, userProfile, scholarshipId, answers } = body;

    switch (action) {
      case 'chat': {
        if (!message) {
          return NextResponse.json(
            { error: 'Message is required' },
            { status: 400 }
          );
        }

        const history: ChatMessage[] = conversationHistory || [];
        const profile: UserProfile | undefined = userProfile;

        const result = await chat(message, history, profile);

        return NextResponse.json({
          success: true,
          response: result.response,
          scholarships: result.scholarships,
          suggestedQuestions: result.suggestedQuestions,
        });
      }

      case 'search': {
        if (!message) {
          return NextResponse.json(
            { error: 'Search query is required' },
            { status: 400 }
          );
        }

        const scholarships = await searchScholarships(message, userProfile, 20);

        return NextResponse.json({
          success: true,
          scholarships,
          count: scholarships.length,
        });
      }

      case 'eligibility': {
        if (!scholarshipId) {
          return NextResponse.json(
            { error: 'Scholarship ID is required' },
            { status: 400 }
          );
        }

        const result = await runEligibilityChecker(scholarshipId, answers || {});

        return NextResponse.json({
          success: true,
          ...result,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: chat, search, or eligibility' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'ScholarSync AI Chatbot',
    version: '1.0.0',
    endpoints: {
      chat: 'POST with { action: "chat", message: string, conversationHistory?: array, userProfile?: object }',
      search: 'POST with { action: "search", message: string, userProfile?: object }',
      eligibility: 'POST with { action: "eligibility", scholarshipId: string, answers: object }',
    },
    status: 'healthy',
  });
}
