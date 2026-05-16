import json

import requests

from ai.services.mistral_prompts import SUMMARY, SUGGESTION

OLLAMA_URL = "http://localhost:11434/api/generate"


SUMMARY_PROMPT = SUMMARY
SUGGESTION_PROMPT = SUGGESTION

OLLAMA_RESPONSE = ['summary', 'result', 'suggestion']

def __mistral_config(prompt:str):
    return {
        "model": "mistral",
        "system": prompt,
        "options": {
            "num_predict": 250,
            "temperature": 0.3,
        },
        "stream": False
    }

def __send_text(text, prompt):
    text = f"""
    Comentarios:
    {text}
    """
    response = requests.post(OLLAMA_URL, json={
        **__mistral_config(prompt),
        "prompt": text,
    })

    try:
        response_json = response.json()
        model_response = response_json.get("response", "")

        # Intentar parsear el JSON
        try:
            parsed = json.loads(model_response)
            # Verificar que tenga el campo esperado (summary o suggestion)
            if not any(key in parsed for key in OLLAMA_RESPONSE):
                raise ValueError("El JSON no contiene el campo esperado (summary o suggestion)")
        except json.JSONDecodeError:
            # Intentar corregir el JSON (ej: cerrar llaves)
            if not model_response.strip().endswith("}"):
                model_response += "}"
    except Exception as e:
        print(f"Error al procesar la respuesta: {e}")
        return '{"summary": "Error: Respuesta inválida del modelo"}'
    
    for key in OLLAMA_RESPONSE:
        if key in model_response:
            print(f"Respuesta del modelo para {key}: {model_response}")
            return json.loads(model_response).get(key)

def __summarize_text(text):
    return __send_text(text, SUMMARY_PROMPT)

def __suggest_improvements(text):
    return __send_text(text, SUGGESTION_PROMPT)

def __chunk_text(text, max_chars=3000):
    chunks = []
    current = ""

    for line in text.split("\n"):
        line = line.strip()
    
        if not line:
            continue
    
        if len(current) + len(line) + 1 < max_chars:  # +1 por el salto de línea
            current += line + "\n"
        else:
            chunks.append(current)
            current = line + "\n"
    
    if current:
        chunks.append(current)
    return chunks

def __process_comments(comments, function=__summarize_text):
    text = "\n".join(comments)
    chunks = __chunk_text(text)
    print(chunks)

    partial_summaries = []

    for chunk in chunks:
        summary = function(chunk)
        partial_summaries.append(summary)

    # Final summary
    final_summary = function("\n".join(partial_summaries))

    return final_summary

def get_summary(comments):
    return __process_comments(comments, function=__summarize_text)

def get_suggestions(comments):
    return __process_comments(comments, function=__suggest_improvements)