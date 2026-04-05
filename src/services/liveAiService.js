export class LiveAiService {
  constructor(apiKey, onMessage, onError) {
    this.apiKey = apiKey;
    this.onMessage = onMessage; // callback for UI chat
    this.onError = onError;
    this.ws = null;
  }

  connect() {
    // We use the v1alpha endpoint which exposes the BidiGenerateContent stream interface for "Live" interactions.
    // gemini-2.0-flash-exp is the current standard model supporting this endpoint.
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
    
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        // Send initial setup message to establish the session constraints and model
        const setupMessage = {
          setup: {
            model: "models/gemini-2.0-flash-exp",
            systemInstruction: {
              parts: [{ text: "You are an expert technical interviewer and career coach. The user might share their screen showing code, or their web camera to practice an interview. Respond conversationally, concisely, and supportively." }]
            }
          }
        };
        this.ws.send(JSON.stringify(setupMessage));
        this.onMessage("[System]: Connected to Gemini Live Server!");
      };

      this.ws.onmessage = (event) => {
         try {
           let blobRaw = event.data;
           // If the server sends a Blob instead of string, we must read it
           if (event.data instanceof Blob) {
              const reader = new FileReader();
              reader.onload = () => {
                this.handleServerMessage(JSON.parse(reader.result));
              };
              reader.readAsText(event.data);
           } else {
             this.handleServerMessage(JSON.parse(event.data));
           }
         } catch (e) {
           console.error("Error parsing Gemini message", e);
         }
      };

      this.ws.onerror = (err) => {
        console.error("Gemini WebSocket Error", err);
        if (this.onError) this.onError("WebSocket Connection Error.");
      };

      this.ws.onclose = () => {
        this.onMessage("[System]: Disconnected from Gemini LiveServer.");
      };

    } catch (err) {
      if (this.onError) this.onError(err.message);
    }
  }

  handleServerMessage(data) {
    if (data.serverContent && data.serverContent.modelTurn) {
      const parts = data.serverContent.modelTurn.parts;
      parts.forEach(part => {
        if (part.text) {
          // Send text fragments to the UI
          this.onMessage(part.text);
        }
      });
    }
  }

  sendImageChunk(base64Data) {
    // Send a real-time base64 string slice of a JPEG stream
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    const msg = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: "image/jpeg",
          data: base64Data
        }]
      }
    };
    this.ws.send(JSON.stringify(msg));
  }
  
  sendTextMessage(text) {
    // Send standard text prompts to the stream
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    // As per Bidi documentation, client turns wrap parts.
    const msg = {
      clientContent: {
        turns: [{
          role: "user",
          parts: [{ text: text }]
        }],
        turnComplete: true
      }
    };
    this.ws.send(JSON.stringify(msg));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
