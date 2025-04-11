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

// Define response structure matching what the frontend expects
export interface ChatResponse {
  content: string;
  timestamp: string;
}

// Define structure of the RAG API response
interface RAGAPIResponse {
  answer: string;
  sources?: Array<{
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    creation_date: string;
    last_modified_date: string;
  }>;
}

const RAG_API_URL = 'http://localhost:8001';

export async function POST(req: Request) {
  try {
    const { query, mode, messages = [] } = await req.json();

    console.log('API route received query:', query);
    console.log('API route received messages:', messages.length);
    
    // Check if we should use mock API instead of the real RAG API
    if (process.env.USE_MOCK_API === 'true') {
      console.log('Using mock API response');
      // Add a delay to simulate loading
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return NextResponse.json<ChatResponse>({
        content: MOCK_RESPONSE.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Prepare a more contextual query if there are previous messages
    let contextualQuery = query;
    if (messages.length > 0) {
      // Get the last few messages to provide context (limit to avoid token limits)
      const recentMessages = messages.slice(-5);
      const conversationContext = recentMessages
        .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
        .join('\n');
      
      // Append conversation history to the query for better context
      contextualQuery = `Previous conversation:\n${conversationContext}\n\nCurrent query: ${query}`;
    }
    
    console.log('Sending contextual query to RAG API:', contextualQuery.substring(0, 100) + '...');
    
    // Call the RAG API backend
    const response = await fetch(`${RAG_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: contextualQuery }),
    });

    // Get the response status and text for better error handling
    const status = response.status;
    const statusText = response.statusText;
    
    if (!response.ok) {
      console.error(`Error from RAG API: ${status} ${statusText}`);
      throw new Error(`Failed to fetch from RAG API: ${statusText}`);
    }

    // Parse the response from the RAG API
    const data = await response.json();
    console.log('RAG API response received:', JSON.stringify(data, null, 2).substring(0, 200) + '...');

    // Ensure the response has the expected format
    if (!data || typeof data !== 'object') {
      console.error('Invalid response format from RAG API: Not an object');
      throw new Error('Invalid response format from RAG API: Not an object');
    }
    
    if (!data.answer && !data.message) {
      console.error('Invalid response format from RAG API: No answer or message property', data);
      throw new Error('Invalid response format from RAG API: Missing answer property');
    }

    // Handle different response formats - prefer 'answer' but fall back to 'message'
    const content = data.answer || data.message;
    
    // Return a properly formatted response that the frontend expects
    return NextResponse.json<ChatResponse>({
      content,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}