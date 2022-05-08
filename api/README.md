# Treadl web API

This directory contains the code for the back-end Treadl API.

## Run locally

To run this web API locally, follow the steps below.

### 1. Run a local MongoDB instance

Install MongoDB for your operating system and then launch a local version in the background. For example:

```shell
$ mongod --fork --dbpath=/path/to/.mongo --logpath /dev/null
```

(Remember to restart the database upon system restart or if the instance stops for another reason.)

### 2. Create and activate a virtual environment

Install and activate the environment using `virtualenv`:

```shell
$ virtualenv -p python3 .venv # You only need to run this the first time
$ source .venv/bin/activate
```

### 3. Install dependencies

We use Poetry to manage dependencies. If you don't have this yet, please refer to [the Poetry documentation](https://python-poetry.org) to install it. Once done, install the dependencies (ensuring you have `source`d your virtualenv first):

```shell
$ poetry install
```

### 4. Create an `envfile`

Copy the template file into a new `envfile`:

```shell
$ cp envfile.template envfile
```

If you need to, make any changes to your new `envfile`. Note that changes are probably not required if you are running this locally. When happy, you can `source` this file too:

```shell
$ source envfile
```

### 5. Run the API

Ensure that both the virtualenv and `envfile` have been loaded into the environment:

```shell
$ source .venv/bin/activate
$ source envfile
```

Now you can run the API:

```shell
$ flask run
```

The API will now be available on port 2001.

Remember that you will need a local instance of [MongoDB](https://www.mongodb.com) running for the API to connect to.