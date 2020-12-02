# Hydration and Upload Scripts
Documentation and Code Author: Rajdeep Singh Hundal (A0168468L)

## Hydration Scripts

The files in this folder contain the scripts used to hydrate the Covid-19 Tweets Dataset on Azure's Virtual Machines. In total we hydrated 2 and a third months worth of tweet data. 
- Feb 2020
- Mar 2020
- 1-9 Apr 2020

### Pseudo Code for hydrate.sh

	for files to hydrate:
		log start date
		extract tweet ids from original json dataset into a txt file
		use twarc to hydrate tweet ids in txt file and output to jsonl file 
		log end date

### Pseudo Code for extractTweetId.py

	set input file
	set output file
	for each line in input file (json):
		extract tweet
		write tweet id to output file (txt)


### Prerequisites
1. Linux based system (able to run bash scripts), preferably ubuntu
2. twarc api is already installed
	- `pip install twarc`
3. Python 3 
4. You possess a twitter developer account with a standalone application
	- Visit twitter developer portal
	- Register for a developer account 
	- Create a standalone application
5. twarc is configured with keys to access your twitter standalone app
	- `twarc configure`
	- Enter keys of your twitter standalone application

### Instructions to run scripts
1. To hydrate a months worth of tweets, you have to use the scripts located in the month's directory
	- So to hydrate february, use scripts located in `/hydrationAndUploadScripts/feb/`
2. Put the Covid-19 Dataset json files of the month you want to hydrate in the same directory as hydrate.sh and extractTweetId.py.
3. Rename the json files __only for dates 1 to 9__ of the month you are hydrating to `geo_2020-i-j.json`
	- i is the month you are currently hydrating. So i = 02, 03 or 04.
	- j is the day of the month. So j = 1, 2, 3, 4, 5, 6, 7, 8 or 9.
4. Start hydration
	- `nohup ./hydrate.sh &` 
5. You can then see the progress of the hydration by looking at the log file which is generated: feb.log, mar.log or apr.log. 
	- `cat feb.log`
6. Ensure that you have enough storage space (idly 1TB for one month)

## Upload Scripts

The files in this folder also contain the script used to upload the hydrated tweets (jsonl files) to Azure's Distributed File System (DBFS).

### Pseudo Code for upload.py

	set connection to DBFS
	create container on DBFS
	try:
		for hydrated files to upload:
			log start date
			set client
			read file and upload file to client
	except:
		log excption

### Prerequisites
1. Python 3
2. Azure DBFS Connection String
3. Azure Libraries
	- `pip install azure-storage-blob`
4. For more info
	- https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-python#upload-blobs-to-a-container

### Instructions to run scripts
1. Put upload.py into the same directory as the hydrated tweet jsonl files of the month you want to upload
2. Change the DBFS connection string in upload.py to your own DBFS connection string
3. Upload files
	- `nohup python3 upload.py &`