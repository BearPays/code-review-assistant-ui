import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

// Define response structure
export interface ChatResponse {
  message: string;
  timestamp: string;
}

export async function POST(req: Request) {
  try {
    const { messages, mode, apiKey } = await req.json();

    // Check if mock API is enabled
    if (process.env.USE_MOCK_API === 'true') {
      return NextResponse.json(MOCK_RESPONSE);
    }

    // Initialize OpenAI client with the API key from the request
    const openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });

    // Generate initial summary for Mode A if requested
    const isInitialSummary = mode === 'A' && messages.length === 0;

    let prompt = '';

    if (isInitialSummary) {
      prompt = 'You are a code review assistant. Please provide an initial summary of the code changes, highlighting major points and potential areas of interest or concern.';
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful code review assistant that provides detailed, insightful feedback on code.' },
        ...messages,
        ...(isInitialSummary ? [{ role: 'user', content: prompt }] : [])
      ],
    });

    // Extract the response
    const assistantMessage = response.choices[0].message.content || '';

    // Log the interaction (in a real app, this would go to a database)
    console.log(`[${new Date().toISOString()}] User: ${messages.length > 0 ? messages[messages.length - 1].content : 'Initial request'}`);
    console.log(`[${new Date().toISOString()}] Assistant: ${assistantMessage}`);

    // Return the response
    return NextResponse.json<ChatResponse>({
      message: assistantMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}