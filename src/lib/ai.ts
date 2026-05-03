export async function askAssistant(prompt: string, history: any[] = []) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history })
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      } else {
        const text = await response.text();
        throw new Error(`Server Error (${response.status}): ${text.substring(0, 50)}`);
      }
    }

    const data = await response.json();
    return data.text;
  } catch (error: any) {
    console.error("Neural Link Error:", error);
    return `[Neural Link Interrupted]: ${error.message || "Unknown error"}. Check Vercel environment variables.`;
  }
}
