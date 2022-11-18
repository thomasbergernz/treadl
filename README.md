# Treadl

This is a monorepo containing the code for the web and mobile front-ends and web API for the Treadl platform.

## Running and developing Treadl locally

To run Treadl locally, we recommend taking the following steps:

1. Check out this repository locally.
1. Follow the instructions in the `api/` directory to launch a MongoDB instance and to run the Treadl API.
1. Follow the instructions in the `web/` directory to install the local dependencies and run the web UI.

## Deploying your own version of Treadl

If you'd like to launch your own version of Treadl in a web production environment, follow the steps below. These instructions set-up a basic version of Treadl, and you may want or need to take additional steps for more advanced options.

We recommend forking this repository. That way you can make adjustments to the code to suit your needs, and pull in upstream updates as we continue to develop them.

### 1. Launch a MongoDB cluster/instance

Treadl uses MongoDB as its data store, and this should be setup first. You can either use a commercial hosted offering, or host the database yourself.

Hosted options:

* [MongoDB Atlas](https://www.mongodb.com)
* [DigitalOcean managed MongoDB](https://www.digitalocean.com/products/managed-databases-mongodb)

Self-hosted guides:

* [Creating a MongoDB Replica Set](https://www.linode.com/docs/guides/create-a-mongodb-replica-set)
* [MongoDB official Docker Image](https://hub.docker.com/_/mongo)

Either way, once launched, make a note of the cluster/instance's:

* URI: The database's URI, probably in a format like `mongodb+srv://USERNAME:PASSWORD@host.com/AUTHDATABASE?retryWrites=true&w=majority`
* Database: The name of the database, within your cluster/instance, where you want Treadl to store the data.

### 2. Provision an S3-compatible bucket

Treadl uses S3-compatible object storage for storing assets (e.g. uploaded files). You should create and configure a bucket for Treadl to use.

Hosted options:

* [Amazon S3](https://aws.amazon.com/s3)
* [Linode Object Storage](https://www.linode.com/products/object-storage) - Recommended option.
* [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces)

Self-hosted options:

* [MinIO](https://min.io/download)

Once you have a bucket, generate some access keys for the bucket that will enable Treadl to read from and write to it. Ensure you make a record of the following for later:

* Bucket name: The name of the S3-compatible bucket you created
* Endpoint URL: The endpoint for your bucket. This helps Treadl understand which provider you are using.
* Access key: The "username" or access key for your bucket
* Secret access key: The "password" or secret access key for the bucket

_Note: assets in your bucket should be public. Treadl does not currently used signed requests to access uploaded files._

### 3. Provision the API

The best way to run the web API is to do so via Docker. A `Dockerfile` is provided in the `api/` directory.

Simply build the image and transfer it to your server (or just build it directly on the server, if easier).

Make a copy of the `envfile.template` file included in the `api/` directory into a new file named `envfile` and make changes to this file to suit your needs. For example, you will likely need to:

* Add in the Mongo URI and database into the relevant parts
* Add the S3 detais into the relevant parts
* Add Mailgun connection details (for sending outbound mail)
* Change the app's URL and email addresses

Once ready, you can launch the API by passing in this envfile (assuming you built the image with a name of `treadl-api`):

```shell
$ docker run --env-file envfile -d treadl-api
```

_Note: a reverse proxy (such as Nginx or Traefik) should be running on your server to proxy traffic through to port 8000 on your running Treadl API container._

### 4. Host the front-end

The front-end is formed from static files that can be simply served from a webserver, from a CDN-fronted object store, or anything else.

Before building or hosting the front-end, please copy the `.env.development` file into a new file called `.env.production` and make changes to it as required. For example, you will need to:

* Include the URL of the web API you deployed earlier in the relevant field.
* Include a contact email address.

**Vercel**

We use [Vercel](https://vercel.com) to host the web UI. Once you have an account to which you are logged-in to locally, the front-end can be deployed by simply running:

```shell
$ vercel --prod
```

_Note: You will need to configure Vercel to use your own domain, and set-up a project, etc. first._

**Manual**

Simply build the app and then deploy the resulting `build/` directory to a server or storage of your choice:

```shell
$ yarn build
$ s3cmd cp build/ s3://my-treadl-ui # Example
```

### 5. Optional extras

**Imaginary server**

To help improve the performance of the app, you may wish to make use of [Imaginary](https://github.com/h2non/imaginary) to crop/resize large images. The web UI is already equipped to handle Imaginary if a server is configured.

To use this feature, simply rebuild the app ensuring that an environment entry is made into `.env.production` that includes `"VITE_IMAGINARY_URL=https://your.imaginaryserver.com"`.

_Note: If this is not set, Treadl will by default fetch the full size images straight from the S3 source._

## Contributions

Contributions to the core project are certainly welcomed. Please [get in touch with the developer](https://wilw.dev) for an invitation to join this repository.