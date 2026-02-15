# Gebruik een officiële Python image
FROM python:3.11-slim

# Zet de werkmap
WORKDIR /app

# Installeer de benodigde systeem-packages en odfpy
RUN pip install --no-cache-dir odfpy fastapi uvicorn

# Kopieer je code
COPY . .

# Start je API
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "80"]