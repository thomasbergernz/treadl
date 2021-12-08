FROM python:3.7.7-slim-buster

# set work directory
WORKDIR /app

# Install dependencies
RUN pip install poetry

COPY poetry.lock /app
COPY pyproject.toml /app

RUN poetry export -f requirements.txt | pip install -r /dev/stdin

# Add remaining files
COPY . /app/

CMD ["gunicorn"  , "-b", "0.0.0.0:8000", "app:app"]
