# Script to migrate from the old data: string URLs for images to image files directly on S3.

from pymongo import MongoClient
import base64, os

db = MongoClient('mongodb://USER:PASS@db/admin')['treadl']

os.makedirs('migration_projects/projects', exist_ok=True)

for obj in db.objects.find({'preview': {'$regex': '^data:'}}, {'preview': 1, 'project': 1}):
  preview = obj['preview']
  preview = preview.replace('data:image/png;base64,', '')
  
  imgdata = base64.b64decode(preview)
  filename = 'some_image.png'
  
  os.makedirs('migration_projects/projects/'+str(obj['project']), exist_ok=True)
  with open('migration_projects/projects/'+str(obj['project'])+'/preview_'+str(obj['_id'])+'.png' , 'wb') as f:
    f.write(imgdata)
  db.objects.update_one({'_id': obj['_id']}, {'$set': {'previewNew': 'preview_'+str(obj['_id'])+'.png'}})
  #exit()
