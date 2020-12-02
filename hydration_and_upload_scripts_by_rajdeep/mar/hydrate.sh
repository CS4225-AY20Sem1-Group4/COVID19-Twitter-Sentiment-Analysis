#!/bin/bash
for i in {1..31}
do
	echo $(date) >> mar.log
	echo "Extracting ${i} Mar ..." >> mar.log
	python3 extractTweetId.py geo_2020-03-${i}.json geo_2020-03-${i}.txt
	echo "Hydrating ${i} Mar ..." >> mar.log
	twarc hydrate geo_2020-03-${i}.txt > geo_2020-03-${i}.jsonl
	echo $(date) >> mar.log
	echo "" >> mar.log
done
echo "Finished Hydrating Mar" >> mar.log