import os
from pymongo import MongoClient
from flask import g

db = None

def get_db():
  global db

  if db is None:
    db = MongoClient(os.environ['MONGO_URL'])[os.environ['MONGO_DATABASE']]
  return db
