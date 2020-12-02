import sys
import json

input = sys.argv[1]
output = sys.argv[2]
file = open(output, 'w')
for line in open(input):
	tweet = json.loads(line)
	file.write(tweet["tweet_id"] + "\n")
file.close()