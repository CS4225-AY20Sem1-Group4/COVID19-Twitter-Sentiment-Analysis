# COVID19-Twitter-Sentiment-Analysis
We are a group of undergraduate and graduate students from the National University of Singapore. As part of our Big Data Systems for Data Science module (CS4225/CS5425), we were tasked to find a trending topic that we found interesting, perform data analysis on a dataset larger than 10GB and lastly, draw new data science insights that can impact the society and improve people's lives. With this is mind, we embarked on a project that involved performing twitter sentiment analysis on over 1TB of data. 


## Introduction 

Covid-19 is turning out to be one of the biggest pandemics that humanity has ever faced. The virus has infected 33.8 million people and claimed 1.01 million lives till date. With governments imposing restrictions, disrupting our daily routines in the process and the threat of getting infected, these are troubling times indeed.

This study aims to give a country-level representation of the sentiments felt by people based on certain Covid-19 events (e.g., death count, actions taken by the government etc.). We wanted to understand the true public sentiments towards some of the measures imposed by their governments. As each country handles the virus differently, some countries are more successful than others. We hope that through this study , we could give world bodies and policy makers an estimate as to how certain events might change the public's outlook. On the other hand, the public could look at what other governments are successfully doing and suggest the same with their own governments. All in all, we want to equip both the public and policymakers with a visualization tool to help them make better decisions. 

Since the start of the pandemic, countries have been reporting their statistics based on Covid-19 events (e.g., death count, case count etc.) to promptly reflect the situation in their country. These numbers are reported by an approved body within each country. With these numbers along with some gauge of sentiment, we can then identify possible correlations. However, gauging the public’s sentiment is no easy task, which is why we have decided to use one of the most popular social media platforms, Twitter. As of the start of 2020, Twitter has 330 million monthly active users and 145 million daily active users. With huge amounts of tweets made publicly available (more data → better averages/predictions) as well as it's easy-to-use APIs, we felt that doing sentiment analysis on these tweets would be worthwhile. 

## Contributors 


## Methodology & Experimentation 

### Approach 

We started with the idea of performing a time-based analysis of people’s sentiments over specific time frames (i.e. sentiment changes for days, weeks or months instead of aggregated results over a singular time frame). With our time-sensitive approach, we were able to identify how the events in the real-world (i.e. Government stringency, handwashing facilities or testing facilities) truly affected people’s sentiments. This meant that we needed two sets of data - COVID-19 related tweets and COVID-19 statistics per country. The datasets that we chose had to also be available during an extended period (2 - 3 months).

To choose the specific timeframes for our dataset, we had to look at the timeline of when COVID-19 started. The first few cases of COVID-19 were identified in Wuhan City, China in December 2019. According to the World Health Organisation (WHO), the first few confirmed cases outside mainland China occurred in Japan, South Korea and Thailand in mid-January. On January 30th, the WHO declared the outbreak of COVID-19 to be a Public Health Emergency of International Concern. On March 11th, the WHO then declared it to be a pandemic. Hence, we decided to extract data from February to April. 

We also decided to expand our analysis to many countries across the world. This allowed us to do a comparative analysis between countries. This can be looked at in two different ways -- people and policy maker’s point of view. People in countries that are not doing so well could look at what successful countries had done to successfully combat the virus and suggest similar actions to their respective country’s authorities. On the other hand, policymakers could look at what actions drive people’s sentiments in a positive or negative direction and hence, act accordingly.   

### Architecture 

<p align="center">
  <img src="https://user-images.githubusercontent.com/35773953/101277564-46891600-37f0-11eb-8412-67d56c68ac1f.png">
  <br>
    <em>Overall Architecture</em>
</p>

As illustrated in the above figure, with the help of Azure Databricks, we set up a SQL Database (result storage), Distributed File System (COVID-19 tweets dataset storage), Apache pyspark and Azure Text Analytics (Tweet Sentiment Prediction). In other words, the backend was entirely hosted on Azure’s Cloud infrastructure. Lastly, we used React as a frontend framework to display the results of our project.

### Methodologies 

#### COVID-19 Tweets Dataset 

The COVID-19 tweets dataset [1] has over 524 million tweets from 218 countries collected between February 1st to May 1st. This dataset is unique because it has already been filtered to be COVID-19 specific. The researchers used more than 800 keywords and hashtags to collect the data. As mentioned in their report [5], they hope their data would help give research communities the resource to combat the pandemic as well as develop “computational methods” to address challenges. We accredit those researches and would like to pay homage by doing exactly what they hoped to happen. 
 
The dataset only contained the tweet ID and other metadata. The below figure illustrates the data pipelines for the dataset. We had to manually hydrate the actual data so that we could extract the actual tweet text. We hydrated around 1TB worth of raw data dating from February 1st to April 9th 2020. We initially wanted to do a complete analysis from February 1st to April 30th but were unable to do so due to time constraints. After hydration, the dataset was pre-processed to clean the data (e.g., remove unnecessary data columns/rows etc.). After pre-processing, we passed each tweet into a sentiment model (Azure Text Analysis) for sentiment prediction. Each tweet would then have a sentiment rating (positive, negative or neutral) before it is post-processed where the tweets were aggregated (e.g., group tweets by country and by date, calculate average sentiment for country_x on date_y etc.). After post-processing was done and we have computed the necessary metrics, the data was then stored in the SQL Database where it would be called by the frontend framework to present the results on graphs.

<p align="center">
  <img src="https://user-images.githubusercontent.com/35773953/101278060-bc42b100-37f3-11eb-872a-d0fa4d133a38.png">
  <br>
    <em>COVID-19 Tweets Data Pipeline </em>
</p>

##### Hydration 

Hydration is the process of extracting all of a tweet’s data from Twitter using Twitter’s API. To do this, we made use of twarc, an API which interacts with Twitter’s API and does the hydration for us. We contemplated on using stream processing (e.g Storm) but since Twitter’s API is rate limited to 300 requests per a 15-minute window for each Twitter Developer Account application, there was no point in using stream processing to achieve millisecond latency. This is because, after hydrating 300 requests in ~5 minutes, we would still have to wait for 10 minutes before being able to hydrate again. Thus, Twitter’s API was the main bottleneck in the hydration process. Moreover, storage was not a concern, meaning that we did not need to sieve out data and could store it all since Azure had scalable storage and we had the funds to scale our usage. As such, we decided to move away from the idea of using stream processing as it had minimal gains in our context.

<p align="center">
  <img src="https://user-images.githubusercontent.com/35773953/101278160-97027280-37f4-11eb-850d-c3f29381557c.png">
  <br>
    <em>Hydration Architecture Diagram </em>
</p>

With the decision to move away from stream processing, we then looked as to how we could parallelize the hydration process as much as possible. We decided to use Azure’s Virtual Machines (VM). There were 2 main factors which led to this decision. Firstly, given the fact that Twitter rate limits API requests for each Developer Account Application, we needed multiple Developer Accounts/Applications in order to parallelize this process. Hence, we needed multiple machines as twarc only allows one Developer Account per machine due to the way the API stores its configuration files. Secondly, since the dataset size after hydration would be around 20-50 GB per day (e.g., Hydrated Covid Tweets for 1st March 2020 was ~21 GB), we would need a lot of storage space. Thus, since the storage on Azure is scalable and we had the funds from NUS, it made Azure VM’s an ideal choice for hydration. We allocated 1 TB of storage to each VM and configured a bash script to first extract the tweet IDs from the original dataset and then to use twarc to hydrate the tweet IDs. We then ran the script as a background process on each of the VM’s. After the datasets were hydrated (hydration took about 1 week for 1 month’s worth of tweets), we uploaded the hydrated COVID-19 Tweets to the distributed file system (DBFS) on Azure using Microsoft’s Blob API.


##### Pre-Processing 

<p align="center">
  <img src="https://user-images.githubusercontent.com/35773953/101278230-0b3d1600-37f5-11eb-9a2b-2fe5acf9ee48.png">
  <br>
    <em>Pre-Processing Data Pipeline </em>
</p>


Once the hydrated tweets were stored in the DBFS on Azure, we pre-processed the tweets using pyspark on Azure Databricks. We first dropped any unnecessary columns/fields. Following which, we cleaned the tweet’s text by removing symbols, dates, links etc. After cleaning the text, we identified the country of a tweet’s user by using pycountry to see if there was a match in the location field. We also reformatted the date field to make it more legible. Lastly, we removed stopwords and filtered the data frame to only contain English tweets from a select list of countries.

There were some decisions made in the pre-processing process mentioned above. More specifically, we decided to only select countries which had the most English tweets per day on average -- India, Hong Kong, United States, Canada, United Kingdom, Malaysia, Singapore, France, Philippines, Thailand, Japan, China, Germany, Russia and Sweden. We also then filtered the tweets to only contain English tweets. 

##### Sentiment Tool by Azure 

Using Azure Databricks, the pre-processed data is read from the DBFS. An API endpoint to Azure’s Text Analytics API / NLTK is sent for each tweet. The respective services will return their prediction for each tweet. Using Databricks again, we stored the raw prediction along with the tweet back to the DBFS. In this CRUD (create-read-update-delete) process, we optimised the performance by directly connecting the DBFS to Azure Databricks. There was an alternative method where we could mount the DBFS storage directly onto Databricks This method would have incurred additional writing when moving the updated data back from the mounted storage to the DBFS.  Hence, we chose to write to DBFS directly. 
When deciding upon which sentiment tool to use for our use case, we drew inspiration from what we had learnt in our prior research [1]. They had used NRC Emotion Lexicon where they could categorize the sentiments of the tweets into 8 emotions: fear, joy, anger, disgust, sadness and trust.  We considered using NRC Emotion Lexicon but we decided not to overcomplicate things by extracting emotions that makes it even harder to properly quantify public sentiments. In addition, emotions such as sarcasm and irony were not detected. Thus, we stuck to simply classifying tweets into either positive, negative or neutral. We experimented with two choices -- Microsoft Azure’s Text Analytics Model and Natural Language Toolkit. 

We adopted Microsoft Azure’s pre-trained Text Analytics model. It has a pre-trained machine learning model that returns the relative prediction of positive, neutral and negative sentiment. The sum of the positive, neutral and negative will always be 1.  

As the Text Analytic requires a client model, we wrapped it using an express application. Then, we deployed the application on Azure using “app services”. In this way, we had a static IP address to call from. All that had to be done was to put a request with text in JSON to the IP address and we got the prediction details in the response. In Databricks, we sent every tweet to the API to get the sentiment analysis. After which, we stored the respective sentiment result with 3 new columns as positive, neutral and negative. Finally, we saved the tweets along with their respective sentiments into a file so that further analysis can be done.


##### Post-Processing 

##### Presentation and Analysis 

#### COVID-19 Country Statistics 




