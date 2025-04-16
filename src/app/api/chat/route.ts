import { NextResponse } from 'next/server';

const MOCK_RESPONSE: { message: string; timestamp: string } = {
  message: `# My Heading

## Subheading

This is a text demonstration in which we will be **bolding** some text, making text *italic*, and also, we are going to show a \`code snippet\`.

### Python Code Snippet

The following is a little piece of Python code:

\`\`\`python
def hello_world(name):
    """A simple function that greets you"""
    print(f"Hello, {name}!")

hello_world("Mark")
\`\`\`

### Bullet Points

Here are some bullet points:
- Point 1
- Point 2
- Point 3

#### Numbered List

Alternatively, here's a numbered list:
1. Number 1
2. Number 2
3. Number 3

For strikethrough, you can use \`~~strikethrough~~\` to achieve the following output: ~~strikethrough~~

##### Hyperlink

Lastly, [Click here to visit Google](https://www.google.com)

-----
### Another Heading

More text goes here. 

#### Bold & Italic

You can even use ***bold and italic*** together.

That is all for this markdown demonstration. Goodbye!`,
  timestamp: new Date().toISOString(),
};

// Define new response structure from the backend API
interface BackendResponse {
  session_id: string;
  answer: string;
  sources?: Array<{
    text_preview: string;
    filename: string;
    // Other source properties
  }>;
  collections_used?: string[];
  mode: string;
  pr_id: string;
}

// Define response structure for our frontend
export interface ChatResponse {
  content: string;
  timestamp: string;
  sessionId: string;
  sources?: any[];
}

const API_URL = 'http://localhost:8000/chat';

export async function POST(req: Request) {
  try {
    const { query, mode, messages = [], selectedProject, sessionId } = await req.json();

    console.log('API route received query:', query);
    console.log('API route received project:', selectedProject);
    console.log('API route received sessionId:', sessionId);
    
    // Check if we should use mock API instead of the real backend API
    if (process.env.USE_MOCK_API === 'true') {
      console.log('Using mock API response');
      // Add a delay to simulate loading
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return NextResponse.json<ChatResponse>({
        content: MOCK_RESPONSE.message,
        timestamp: new Date().toISOString(),
        sessionId: sessionId || 'mock-session-1234',
        sources: []
      });
    }
    
    // Map UI mode to backend API mode
    const apiMode = mode === 'A' ? 'co_reviewer' : 'interactive_assistant';
    
    // Prepare request body for the backend API
    const requestBody = {
      query,
      pr_id: selectedProject,
      mode: apiMode,
      session_id: sessionId || null
    };
    
    console.log('Sending request to backend API:', JSON.stringify(requestBody));
    
    // Call the backend API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from backend API: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch from backend API: ${response.statusText}`);
    }

    // Parse the response from the backend API
    const data: BackendResponse = await response.json();
    console.log('Backend API response received:', JSON.stringify(data, null, 2).substring(0, 200) + '...');

    // Ensure the response has the expected format
    if (!data || typeof data !== 'object') {
      console.error('Invalid response format from backend API: Not an object');
      throw new Error('Invalid response format from backend API: Not an object');
    }
    
    if (!data.answer || !data.session_id) {
      console.error('Invalid response format from backend API: Missing required properties', data);
      throw new Error('Invalid response format from backend API: Missing required properties');
    }

    // Return a properly formatted response that the frontend expects
    return NextResponse.json<ChatResponse>({
      content: data.answer,
      timestamp: new Date().toISOString(),
      sessionId: data.session_id,
      sources: data.sources || []
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}