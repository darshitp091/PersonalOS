export async function askGemini(prompt: string, history: any[] = []) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `Error: Unable to connect to neural link. ${error.message || ""}`;
  }
}
