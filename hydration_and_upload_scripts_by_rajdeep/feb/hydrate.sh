#!/bin/bash
for i in {1..29}
do
	echo $(date) >> feb.log
	echo "Extracting ${i} Feb ..." >> feb.log
	python3 extractTweetId.py geo_2020-02-${i}.json geo_2020-02-${i}.txt
	echo "Hydrating ${i} Feb ..." >> feb.log
	twarc hydrate geo_2020-02-${i}.txt > geo_2020-02-${i}.jsonl
	echo $(date) >> feb.log
	echo "" >> feb.log
done
echo "Finished Hydrating Feb" >> feb.log