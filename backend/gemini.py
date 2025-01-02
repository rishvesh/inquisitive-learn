import google.generativeai as genai
from PyPDF2 import PdfReader
from flask import Flask, request, render_template, jsonify

app = Flask(__name__)

GOOGLE_API_KEY = "AIzaSyAPZT1PjHhbnI7rO5Wt-XeUzTpplgmg1cU"  # Replace with your actual API key

def promptLLM(model_name, prompt):
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel(model_name)
    try:
        response = model.generate_content(prompt)

        print(response)

        # Correct way to extract text:
        text_content = ""
        for part in response.parts:
            text_content += part.text

        return text_content
    except Exception as e:
        print(f"Error during LLM call: {e}")
        return None # Return None to indicate an error

def summarize_pdf(pdf_text):
    summary_prompt = f"""Summarize the following text, focusing on the main topics, key concepts, and important details. The summary should be concise and informative, highlighting the essential information needed to understand the content. Avoid redundancy.

    TEXT:
    {pdf_text}
    """



    return promptLLM('gemini-1.5-flash', summary_prompt)  # Using a less expensive model for summarization

def generate_questions_from_summary(summary, question_type, question_amount, additional_requests):
    prompt = f"""Based on the following summary of a textbook chapter:

    {summary}

    Please generate {question_amount} practice questions that are {question_type}. {additional_requests}

    Format the output as a JSON array of objects. Each object should have two keys: "question" and "answer". Ensure the questions and answers are suitable for embedding in HTML, using appropriate HTML tags for formatting (e.g., <b> for bold, <i> for italics, \\n for line breaks). For mathematical notation, use appropriate HTML entities or tags if possible.

    Example JSON format:
    [
      {{
        "question": "<b>Question 1:</b> What is the principle of Le Chatelier?",
        "answer": "The principle of Le Chatelier states that..."
      }},
      {{
        "question": "<b>Question 2:</b>  Explain the common ion effect.",
        "answer": "The common ion effect is..."
      }}
    ]
    """
    return promptLLM('gemini-2.0-flash-thinking-exp-1219', prompt)
