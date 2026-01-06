import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyC8lIiqtHqA9w6b85BT3OH33UepY5oR1dM";

/**
 * Service for interacting with the Google Gemini API to provide logical
 * trade analysis and AI assistance for the platform.
 */
export class GeminiService {
  /**
   * Initialize the Gemini Service.
   */
  constructor() {
    this.apiKey = API_KEY;
    if (!this.apiKey) {
      console.warn("GeminiService: No API Key provided.");
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // Using standard gemini-pro for broad compatibility
    console.log("DEBUG: Initializing GeminiService with gemini-pro");
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Initialize chat history
    this.chatSession = this.model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "You are an expert AI assistant. You can answer any question the user asks. If the question is about trading, provide concise, helpful advice. If it is about other topics, answer helpfully and accurately within your knowledge cutoff." }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I'm ready to help users with trading insights and platform navigation." }],
            },
        ],
    });
  }

  /**
   * Sends a message to the AI assistant and gets a response.
   * @param {string} message - The user's query.
   * @returns {Promise<string>} - The AI's response.
   */
  async chat(message) {
      try {
          const result = await this.chatSession.sendMessage(message);
          return result.response.text();
      } catch (error) {
          console.error("Gemini Chat Error:", error);
          return "I'm having trouble connecting to my brain right now. Please try again in a moment.";
      }
  }

  /**
   * Generates a trade insight based on market data.
   * @param {Object} marketData - The current market data context.
   * @returns {Promise<string>} - The AI-generated insight.
   */
  async getTradeInsight(marketData) {
    try {
      const prompt = `
        Analyze the following market data and provide a concise trading insight:
        ${JSON.stringify(marketData)}
        
        Focus on risk factors and potential upside.
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating trade insight:", error);
      return "AI analysis currently unavailable.";
    }
  }

  /**
   * Analyzes a trader's portfolio profile.
   * @param {Object} traderProfile - The trader's historical data and allocation.
   * @returns {Promise<string>} - A risk assessment report.
   */
  async analyzeTraderRisk(traderProfile) {
    try {
      const message = `Assess the risk level for this trader strictly based on data: ${JSON.stringify(traderProfile)}`;
      const result = await this.chatSession.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error("Error analyzing risk:", error);
      return "Unable to assess risk at this moment.";
    }
  }
}

// Export a singleton instance for global use
export const geminiService = new GeminiService();

