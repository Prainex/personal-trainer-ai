import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the GoogleGenerativeAI client with your API key
const genAI = new GoogleGenerativeAI("AIzaSyAyE-TKXhv2eQflaDSqdSEBYfoqSvg0M1U");

// Set up the model you want to use
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// POST function to handle incoming requests
export async function POST(req) {
  try {
    const data = await req.json(); // Parse the JSON body of the incoming request
    const prompt = data.prompt || 'Write a story about an AI and magic'; // Use the provided prompt or a default one

    // Generate content using the Google Generative AI model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // Extract the text content

    return NextResponse.json({ text }); // Return the generated text as a JSON response
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 }); // Handle any errors
  }
}
