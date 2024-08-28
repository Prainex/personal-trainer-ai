import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the GoogleGenerativeAI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Set up the model you want to use
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// POST function to handle incoming requests
export async function POST(req) {
  try {
    const messages = await req.json(); // Parse the JSON body of the incoming request

    // Include the system prompt as the initial message in the conversation
    const conversation = [
      {
        role: 'system',
        content: "You are a Fitness, Health, and Nutritional expert. Using your vast, scientifically backed knowledge on subjects such as hypertrophy, weight loss, weight gain, strength training, healthy eating, etc. Please give me a personalized fitness regimen and answers/tips based on my answers to your scientifically motivated questions about my fitness goals. Don't stop asking me questions until you think you have all the information you need to give me solid information that will pertain to me. Don't ask more than 20 questions though, and only ask one at a time."
      },
      ...messages // Add the user messages to the conversation
    ];

// Convert the conversation array to a format the Gemini API can understand
const prompt = conversation.map(msg => msg.content).join("\n");

// Generate content using the Google Generative AI model
const result = await model.generateContent(prompt);
const response = await result.response;
const text = await response.text(); // Extract the text content

    return new Response(text, { status: 200, headers: { 'Content-Type': 'text/plain' } }); // Return the generated text as a plain text response
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // Handle any errors
  }
}
