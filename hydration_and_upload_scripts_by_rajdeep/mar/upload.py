import logging
from datetime import datetime
import os, uuid
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, __version__

logging.basicConfig(filename='upload.log',level=logging.DEBUG)
blob_service_client = BlobServiceClient.from_connection_string("")
container_client = blob_service_client.create_container("mar")

try:
    for i in range(1, 32):
        filename = 'geo_2020-03-' + str(i) + '.jsonl'
        logging.info(datetime.now())
        logging.info("Uploading " + filename)

        blob_client = blob_service_client.get_blob_client(container="mar", blob=filename)
        with open(filename, "rb") as data:
            blob_client.upload_blob(data)

    logging.info('Finished Uploading Files')
except Exception as ex:
    logging.warning('Exception:')
    logging.warning(ex)

