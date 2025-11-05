# Voltagent Integration Guide for DCS Code Assistant

## Overview

This guide helps you connect the ChatKit interface to your Voltagent agent running at `http://localhost:3141`.

---

## Voltagent Configuration

### Agent Endpoint

```
http://localhost:3141/agents/DCS%20Code%20Assistant/chat
```

### Request Format

```bash
curl 'http://localhost:3141/agents/DCS%20Code%20Assistant/chat' \
  -H 'Content-Type: application/json' \
  -H 'Accept: text/event-stream' \
  -X POST \
  --data-raw '{
    "input": [
      {
        "parts": [
          {
            "type": "text",
            "text": "Your question here"
          }
        ],
        "id": "unique-message-id",
        "role": "user"
      }
    ],
    "options": {
      "conversationId": "unique-conversation-id",
      "userId": "DCS_Student",
      "temperature": 0.7,
      "maxTokens": 16000,
      "maxSteps": 15
    }
  }'
```

---

## Configuration Parameters

### Token Limits (IMPORTANT for Code Responses)

| Parameter     | Value     | Reason                                                         |
| ------------- | --------- | -------------------------------------------------------------- |
| `maxTokens`   | **16000** | Code responses need 4x more tokens than normal chat            |
| `maxSteps`    | **15**    | Complex code explanations may require multiple reasoning steps |
| `temperature` | **0.7**   | Balanced between accuracy and natural language                 |

**Why 16,000 tokens?**

- Java code snippets: ~500-2000 tokens each
- Explanations: ~1000-3000 tokens
- Context/examples: ~1000-2000 tokens
- Total per response: 4000-8000 tokens average
- 16K provides comfortable headroom for complex answers

---

## Response Format (Server-Sent Events)

Voltagent returns responses as an **event stream** (SSE):

```
event: message
data: {"type":"text","content":"In Assignment 1's `EchoServer.java`..."}

event: message
data: {"type":"text","content":" the server uses a ThreadPoolExecutor..."}

event: done
data: {"status":"complete"}
```

ChatKit handles SSE streams automatically - no custom parsing needed!

---

## Integration Steps

### Step 1: Start Voltagent Agent

Make sure your Voltagent agent is running:

```bash
# Verify agent is accessible
curl http://localhost:3141/agents

# Should return list including "DCS Code Assistant"
```

### Step 2: Load System Prompt

Copy the contents of `VOLTAGENT_SETUP_PROMPT.md` into your Voltagent agent's system prompt.

### Step 3: Configure Context

In Voltagent, add these files to the agent's context:

- `src/data/assignments.ts` (all assignment code)
- `CODEBASE_CONTEXT.md` (project overview)
- `VOLTAGENT_SYSTEM_PROMPT.md` (instructions)

### Step 4: Enable ChatKit Backend

In `src/chat/components/ChatDock.tsx`, uncomment the session creation code:

```typescript
async function createSession(): Promise<string> {
  const response = await fetch(
    "http://localhost:3141/agents/DCS%20Code%20Assistant/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        input: [
          {
            parts: [{ type: "text", text: "Initialize session" }],
            id: crypto.randomUUID(),
            role: "user",
          },
        ],
        options: {
          conversationId: crypto.randomUUID(),
          userId: "DCS_Student",
          temperature: 0.7,
          maxTokens: 16000, // ✅ Increased for code
          maxSteps: 15,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create Voltagent session");
  }

  const data = await response.json();
  return data.clientSecret || "voltagent_" + Date.now();
}
```

### Step 5: Test the Connection

1. Start your React dev server: `pnpm dev`
2. Open the app in browser
3. Click the chat button (bottom-right)
4. Try a test prompt: "Explain Echo Server"
5. Check browser console for any errors

---

## Message Flow

```
User Input
    ↓
ChatKit Composer
    ↓
createSession() → Voltagent Session Init
    ↓
ChatKit sends message
    ↓
Voltagent receives POST request
    ↓
Voltagent processes with system prompt + context
    ↓
Voltagent streams response (SSE)
    ↓
ChatKit displays streaming response
    ↓
User sees answer
```

---

## Troubleshooting

### Issue: "Failed to create session"

**Check:**

- Is Voltagent running? `curl http://localhost:3141/agents`
- Is the agent name correct? `DCS%20Code%20Assistant` (URL encoded)
- Are CORS headers enabled on Voltagent?

**Solution:**

```bash
# Add CORS headers to Voltagent config
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
```

---

### Issue: "Response cut off mid-sentence"

**Cause:** `maxTokens` too low

**Solution:** Already set to 16000 in the config above. If still cutting off:

- Increase to 24000 for very long code examples
- Check Voltagent's model token limits

---

### Issue: "Streaming not working"

**Check:**

1. `Accept: text/event-stream` header is set
2. ChatKit version supports SSE (v1.2.0+)
3. Browser DevTools → Network → Check response type

**Solution:**
ChatKit handles SSE automatically. If broken:

- Verify Voltagent returns `Content-Type: text/event-stream`
- Check for intermediate proxies buffering responses

---

### Issue: "Agent gives generic answers, not code-specific"

**Cause:** System prompt not loaded or context missing

**Solution:**

1. Verify `VOLTAGENT_SETUP_PROMPT.md` is in system prompt
2. Add `assignments.ts` to context window
3. Test with: "What files are in Assignment 1?" (should list EchoServer.java, EchoClient.java)

---

## Example Requests

### Simple Question

```json
{
  "input": [
    {
      "parts": [
        {
          "type": "text",
          "text": "How does the Echo Server handle multiple clients?"
        }
      ],
      "id": "msg-001",
      "role": "user"
    }
  ],
  "options": {
    "conversationId": "conv-123",
    "userId": "DCS_Student",
    "temperature": 0.7,
    "maxTokens": 16000,
    "maxSteps": 15
  }
}
```

### Code-Heavy Question

```json
{
  "input": [
    {
      "parts": [
        {
          "type": "text",
          "text": "Show me the complete Berkeley algorithm implementation and explain each part"
        }
      ],
      "id": "msg-002",
      "role": "user"
    }
  ],
  "options": {
    "conversationId": "conv-123",
    "userId": "DCS_Student",
    "temperature": 0.7,
    "maxTokens": 20000, // Higher for full code listing
    "maxSteps": 20
  }
}
```

---

## Performance Optimization

### Reduce Latency

1. Run Voltagent locally (not remote server)
2. Use smaller models for simple questions
3. Cache common responses

### Handle Long Responses

1. Set `maxTokens: 16000` (done ✅)
2. Enable streaming display in ChatKit (automatic)
3. Add "Show More" button for truncated responses

---

## Security Considerations

### Production Deployment

**DO NOT** expose Voltagent directly to the internet. Use a backend proxy:

```typescript
// Instead of calling Voltagent directly:
const response = await fetch("/api/chat", {
  // Your backend
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: userInput }),
});

// Your backend (/api/chat) then calls Voltagent:
// - Validates user authentication
// - Rate limits requests
// - Sanitizes input
// - Forwards to Voltagent
// - Streams response back to frontend
```

---

## Next Steps

1. ✅ Voltagent agent created with system prompt
2. ✅ Token limits increased to 16000
3. ✅ Event streaming configured
4. ⏳ Test with sample questions
5. ⏳ Add conversation history
6. ⏳ Implement rate limiting
7. ⏳ Deploy to production with backend proxy

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Voltagent logs
3. Verify all files are in context
4. Test with curl command first
5. Ensure token limits are sufficient

**Happy Coding!** 🚀
