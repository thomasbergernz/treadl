FROM python:3.7.7-slim-buster

# set work directory
WORKDIR /app

# install dependencies
COPY . /app/
RUN pip install poetry
RUN poetry export -f requirements.txt | pip install -r /dev/stdin

CMD ["gunicorn"  , "-b", "0.0.0.0:8000", "app:app"]
