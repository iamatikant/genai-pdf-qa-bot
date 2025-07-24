from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
import fitz  # PyMuPDF
import faiss
import numpy as np
from transformers import pipeline
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load text generation model locally
generator = pipeline("text2text-generation", model="google/flan-t5-base")

index = None
chunks = []

def embed_text(texts):
    return model.encode(texts)

@app.post("/upload")
async def upload_pdf(file: UploadFile):
    global index, chunks
    text = ""
    pdf = fitz.open(stream=await file.read(), filetype="pdf")
    for page in pdf:
        text += page.get_text()
    pdf.close()

    # Chunk text
    chunks = [text[i:i+500] for i in range(0, len(text), 500)]
    embeddings = embed_text(chunks)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings))
    return {"status": "PDF processed and indexed."}

@app.post("/ask")
async def ask_question(question: str = Form(...)):
    global index, chunks
    if index is None:
        return {"answer": "Please upload a PDF first."}

    q_embed = embed_text([question])
    D, I = index.search(np.array(q_embed), k=3)
    context = "\n".join([chunks[i] for i in I[0]])

    prompt = f"Answer the question based on the following context:\n\n{context}\n\nQuestion: {question}\nAnswer:"

    result = generator(prompt, max_length=200)[0]['generated_text']

    return {"answer": result}
