import requests


OLLAMA_URL = "http://localhost:11434/api/generate"


SYSTEM_PROMPT = """
[ROLE]
You are a precise assistant that analyzes student comments about a university professor, written in Spanish.


[TASK]
Summarize the provided comments into a single cohesive paragraph in Spanish.
Focus on: teaching quality, clarity of explanations, attitude toward students, and recurring praise or complaints.


[CONSTRAINTS]
- Respond ONLY with a valid JSON object — no preamble, no markdown, no extra text.
- Keep the summary under 80 words.
- Do not invent information not present in the comments.
- If comments are too few or uninformative, say so briefly.


[OUTPUT FORMAT]
{"summary": "<Spanish summary here>"}
"""


def summarize_text(text):
    comments = f"""
    Comentarios:
    {text}
    """


    response = requests.post(OLLAMA_URL, json={
        "model": "mistral",
        "system": SYSTEM_PROMPT,
        "prompt": comments,
        "options": {
            "num_predict": 125,
            "temperature": 0.3,
        },
        "stream": False
    })


    return response.json()["response"]


def chunk_text(text, max_chars=3000):
    chunks = []
    current = ""


    for line in text.split("\n"):
        if len(current) + len(line) < max_chars:
            current += line + "\n"
        else:
            chunks.append(current)
            current = line


    if current:
        chunks.append(current)


    return chunks


def summarize_comments(comments):
    text = "\n".join(comments)
    chunks = chunk_text(text)


    partial_summaries = []


    for chunk in chunks:
        summary = summarize_text(chunk)
        partial_summaries.append(summary)


    # Final summary
    final_summary = summarize_text("\n".join(partial_summaries))


    return final_summary

