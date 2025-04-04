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
    const { query, mode } = await req.json();

    console.log('API route received query:', query);
    
    // Call the RAG API backend
    const response = await fetch(`${RAG_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error(`Error from RAG API: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch from RAG API: ${response.statusText}`);
    }

    // Parse the response from the RAG API
    const data: RAGAPIResponse = await response.json();
    console.log('RAG API response received:', JSON.stringify(data, null, 2));

    // Ensure the response has the expected format
    if (!data.answer) {
      console.error('Invalid response format from RAG API:', data);
      throw new Error('Invalid response format from RAG API');
    }

    // Return a properly formatted response that the frontend expects
    return NextResponse.json<ChatResponse>({
      content: data.answer,
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