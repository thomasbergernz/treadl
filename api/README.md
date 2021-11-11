# Treadl web API

This directory contains the code for the back-end Treadl API.

## Run locally

To run this code locally, first clone this repository and then;

Create and activate a Python virtual environment:

```shell
$ virtualenv -p python3 .venv # You only need to run this the first time
$ source .venv/bin/activate
```

Install dependencies (you may need to [install Poetry](https://python-poetry.org) first):

```shell
$ poetry install
```

Source the environment file:

```shell
$ source envfile # Note: you will need to create this file from the template
```

Run the API:

```shell
$ flask run
```

The API will now be available on port 2001.

Note that you will need a local instance of [MongoDB](https://www.mongodb.com) for the API to connect to.