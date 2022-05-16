FROM python:3.9-slim-buster

# set work directory
WORKDIR /app

# Install dependencies
RUN pip install poetry

COPY poetry.lock .
COPY pyproject.toml .

RUN poetry export --without-hashes -f requirements.txt | pip install -r /dev/stdin

# Add remaining files
COPY app.py .
COPY chalicelib/ ./chalicelib

CMD ["gunicorn"  , "-b", "0.0.0.0:8000", "app:app"]
