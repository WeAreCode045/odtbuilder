FROM python:3.11-slim

WORKDIR /app

# Installeer odfpy en andere dependencies
RUN pip install --no-cache-dir odfpy fastapi uvicorn pillow

# Kopieer de backend broncode (context staat op ./backend)
COPY . .

# Start de API vanuit de 'src' submap
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "80"]