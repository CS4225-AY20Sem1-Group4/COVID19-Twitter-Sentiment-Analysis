#!/bin/bash
for i in {1..30}
do
	echo $(date) >> apr.log
	echo "Extracting ${i} Apr ..." >> apr.log
	python3 extractTweetId.py geo_2020-04-${i}.json geo_2020-04-${i}.txt
	echo "Hydrating ${i} Apr ..." >> apr.log
	twarc hydrate geo_2020-04-${i}.txt > geo_2020-04-${i}.jsonl
	echo $(date) >> apr.log
	echo "" >> apr.log
done
echo "Finished Hydrating Apr" >> apr.log