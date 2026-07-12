# Build a partir da raiz do repositório (ver docker-compose.yml: context: ..)
FROM python:3.12-slim

WORKDIR /app

# Dependências do sistema para psycopg2 e compilação de pacotes nativos
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
