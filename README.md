# COVID19-Twitter-Sentiment-Analysis
We are a group of undergraduate and graduate students from the National University of Singapore. As part of our Big Data Systems for Data Science module (CS4225/CS5425), we were tasked to find a trending topic that we found interesting, perform data analysis on a dataset larger than 10GB and lastly, draw new data science insights that can impact the society and improve people's lives. With this is mind, we embarked on a project that involved performing twitter sentiment analysis on over 1TB of data. 

## Table of Contents 

- [Introduction](#introduction)
- [Contributors](#contributors)
- [Methodology and Experimentation](#methodology-and-experimentation)
  * [Approach](#approach)
  * [Architecture](#architecture)
  * [Methodologies](#methodologies)
    + [COVID-19 Tweets Dataset](#covid-19-tweets-dataset)
      - [Hydration](#hydration)
      - [Pre-Processing](#pre-processing)
      - [Sentiment Tool by Azure](#sentiment-tool-by-azure)
      - [Post-Processing](#post-processing)
      - [Presentation and Analysis](#presentation-and-analysis)
        * [Front-end Implementation](#front-end-implementation)
        * [Visualization](#visualization)
    + [COVID-19 Country Statistics](#covid-19-country-statistics)
- [Discussion of Results](#discussion-of-results)
  * [Visual Analysis](#visual-analysis)
  * [Non-Visual Analysis](#non-visual-analysis)
- [Impact of our Findings](#impact-of-our-findings)
- [Summary](#summary)
- [References](#references)

## Introduction 

Covid-19 is turning out to be one of the biggest pandemics that humanity has ever faced. The virus has infected 33.8 million people and claimed 1.01 million lives till date. With governments imposing restrictions, disrupting our daily routines in the process and the threat of getting infected, these are troubling times indeed.

This study aims to give a country-level representation of the sentiments felt by people based on certain Covid-19 events (e.g., death count, actions taken by the government etc.). We wanted to understand the true public sentiments towards some of the measures imposed by their governments. As each country handles the virus differently, some countries are more successful than others. We hope that through this study , we could give world bodies and policy makers an estimate as to how certain events might change the public's outlook. On the other hand, the public could look at what other governments are successfully doing and suggest the same with their own governments. All in all, we want to equip both the public and policymakers with a visualization tool to help them make better decisions. 

Since the start of the pandemic, countries have been reporting their statistics based on Covid-19 events (e.g., death count, case count etc.) to promptly reflect the situation in their country. These numbers are reported by an approved body within each country. With these numbers along with some gauge of sentiment, we can then identify possible correlations. However, gauging the public’s sentiment is no easy task, which is why we have decided to use one of the most popular social media platforms, Twitter. As of the start of 2020, Twitter has 330 million monthly active users and 145 million daily active users. With huge amounts of tweets made publicly available (more data → better averages/predictions) as well as it's easy-to-use APIs, we felt that doing sentiment analysis on these tweets would be worthwhile. 

## Contributors 


## Methodology and Experimentation 

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

Hydration is the process of extracting all of a tweet’s data from Twitter using Twitter’s API. To do this, we made use of twarc, an API which interacts with Twitter’s API and does the hydration for us. We contemplated on using stream processing (e.g Storm) but since Twitter’s API is rate limited to 300 requests per a 15-minute window for each Twitter Developer Account application, there was no point in using stream processing to achieve millisecond latency. This is because, after hydrating 300 requests in ~5 minutes, we would still have to wait for 10 minutes before being able to hydrate again. 

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

There were some decisions made in the pre-processing process mentioned above. More specifically, we decided to only select countries which had the most English tweets per day on average -- India, Hong Kong, United States, Canada, United Kingdom, Malaysia, Singapore, France, Philippines, Thailand, Japan, China, Germany, Russia and Sweden. We also then filtered the tweets to only contain English tweets. We originally planned to include tweets from other languages so that we could account for the sentiments of people of other languages. However, we were pressed for time and given that Azure’s sentiment analysis model takes a fair amount of time to complete, we did not want the sentiment analysis portion to be another bottleneck. Thus, we reduced the dataset size to avoid further delays. 


##### Sentiment Tool by Azure 

We adopted Microsoft Azure’s pre-trained Text Analytics model. It has a pre-trained machine learning model that returns the relative prediction of positive, neutral and negative sentiment. The sum of the positive, neutral and negative will always be 1. 

Using Azure Databricks, the pre-processed data is read from the DBFS. An API endpoint to Azure’s Text Analytics API is sent for each tweet where it will return it's prediction for each tweet. Using Databricks again, we stored the raw prediction along with the tweet back to the DBFS. In this CRUD (create-read-update-delete) process, we optimised the performance by directly connecting the DBFS to Azure Databricks. There was an alternative method where we could mount the DBFS storage directly onto Databricks. This method would have incurred additional writing when moving the updated data back from the mounted storage to the DBFS.  Hence, we chose to write to DBFS directly. 

As the Text Analytic requires a client model, we wrapped it using an express application. Then, we deployed the application on Azure using “app services”. In this way, we had a static IP address to call from. All that had to be done was to put a request with text in JSON to the IP address and we got the prediction details in the response. In Databricks, we sent every tweet to the API to get the sentiment analysis. After which, we stored the respective sentiment result with 3 new columns as positive, neutral and negative. Finally, we saved the tweets along with their respective sentiments into a file so that further analysis can be done.


##### Post-Processing 

We decided to define a tweet as either positive, negative or neutral. We did this by observing if either of the three sentiment scores of a tweet is more than 0.5. After defining each tweet, we aggregated the data, count the number of the positive and negative per country per day before storing it into the SQL database where it would be further analyzed from front-end framework. 

<p align="center">
  <img src="https://user-images.githubusercontent.com/35773953/101312848-c4e8c500-388f-11eb-8c09-ddf240e218ab.png">
  <br>
    <em>Sentiment Ratio Equation </em>
</p>

Using the equation shown above, we calculated the sentiment ratio per day per country. This method measures the proportion of positive tweets to negative tweets. If there are more positive tweets as compared to negative tweets, the proportion increases. Thus, we opted to use this metric for measurement and analysis as we felt it was more accurate and representative in gauging a country’s sentiment for a particular day as compared to simply calculating the average tweet sentiment scores for a country on a particualr day. We also opted to leave neutral tweets out of the equation as we were only concerned with the ratio of really positive tweets (i.e., positive rating > 0.5) to really negative tweets (i.e., negative rating > 0.5), discarding all other potential outliers which might disrupt the data.

##### Presentation and Analysis 

At this stage, the processed COVID-19 tweets dataset and COVID-19 Country Statistics are stored in the SQL database. A dedicated section for COVID-19 Country statistics is detailed after this. We wanted to present the data to a layman user so that it is visually appealing and easy to understand. The presentation involves displaying the data on meaningful charts and analysis then involves studying these charts for possible correlations. 

###### Front-end Implementation 

<p align="center">
  <img src="https://user-images.githubusercontent.com/35773953/101313076-59532780-3890-11eb-8973-9a137466e059.png">
  <br>
    <em>Sentiment Ratio Equation </em>
</p>

The front-end is built using React js. React was chosen because we were familiar with it and this allowed us to build the front-end quickly. The world map is built using the leaflet library and charts using the charts.js library. 

World map allows us to quickly see where the covid cases are around the world based on countries. Charts allow us to see trends between sentiments and variables such as the number of cases, deaths, tests, government stringency index, hospital beds, handwashing facility.

The back-end server is built using node and express to serve the response to the front-end. The backend-server uses tedious to retrieve rows of data (sentiments, covid cases, deaths, stringency index, etc) from the SQL database. The rows of data are then processed into JSON objects for the front-end to consume.


###### Visualization 

Line charts were used for sentiment vs time as a base for comparison. For example, to find out if there is a possible correlation between sentiment vs government stringency index over a period of time, the two-line charts were combined together to give a clear visual representation on the movement between the value of sentiment and government stringency index over time. Showcasing the general trend for each line and comparing them side by side allows us to see whether a change in one drives a change in the other.

#### COVID-19 Country Statistics 

The country statistics dataset [2] comes as a compiled CSV with reported data provided by each country.

We pre-processed the data to extract columns of the necessary information that we wanted. These information include:
  1. Number of daily new cases
  2. Number of daily new tests
  3. Number of daily new deaths
  4. Number of hospital beds available per thousand residents
  5. Share of population with access to basic hand washing facilities
  6. Government stringency index (Measure of the extent of government actions towards covid)
These are stored into a relational SQL Database for ease of queries for the front-end. 

<p align="center">
  <img src="https://user-images.githubusercontent.com/35773953/101313360-f6ae5b80-3890-11eb-90be-cb201008c55a.png">
  <br>
    <em>Country Statistics SQL Schema </em>
</p>

## Discussion of Results 

### Visual Analysis 

<p align="center">
  <img src="https://user-images.githubusercontent.com/35773953/101315630-e2b92880-3895-11eb-9134-6c201f00cf56.png">
  <br>
    <em>Sentiment vs Time (Red Line) & Government Response Stringency Index (Green Line) vs Time for Canada </em>
</p>

| Pearson's R | P-value | Spearman's Rho | P-value | 
| --- | --- | --- | --- | 
| 0.8420406632026404 | 1.25369987414744e-19 | 0.8289424303915198 | 1.445122426988031e-18 | 


<p align="center">
  <img src="https://user-images.githubusercontent.com/35773953/101316031-ab974700-3896-11eb-8c87-be6f00ff16b4.png">
  <br>
    <em>Sentiment vs Time (Red Line) & Government Response Stringency Index (Green Line) vs Time for France </em>
</p>

| Pearson's R | P-value | Spearman's Rho | P-value | 
| --- | --- | --- | --- | 
| 0.7758286880757572 | 4.9296130085577346e-15 | 0.8232895332088125 | 3.897050806530124e-18 | 

From the results generated, it can be seen that for some graphs, there are strong correlations. For example, with time, it is found that a Country’s Sentiment Rating increases as the Country’s Government Response Stringency Index (an indicator of the number of measures taken by a Country’s Government to battle Covid) increase. On March 11th, Justin Trudeau, the Prime Minister of Canada announced a $1 billion response fund and on March 13th, the Canadian federal government announced that it was preparing a stimulus package to help those affected. These announcements contributed to Canadian Government Response Stringency Index. As a result, we could see an increase in positive sentiments. The same could also be said for France. On March 12th, Emmanuel Macron announced that all schools and universities were to be closed. The following day, he announced the closure of all pubs, restaurants, cinemas and nightclubs. A few days later, he announced a nationwide lockdown. The French government responded differently to the Canadian government but its stringency index still rose. 

In hindsight, this correlation, be it stimulus packages or lockdown measures, makes sense as the general population would tend to feel much safer and happier as their Government starts to take measures in order to protect them from the virus. Furthermore, to solidify our claims on this correlation, this correlation was observed to be present in more than two countries mentioned above and the actual values calculated from known correlation metrics (Pearson and Spearman) indicates a strong positive correlation. 

<p align="center">
  <img src="https://user-images.githubusercontent.com/35773953/101316036-af2ace00-3896-11eb-941b-51b0a66e4da2.png">
  <br>
    <em>No of COVID Deaths vs Time (Red Line) & Government Response Stringency Index (Green Line) vs Time for Canada </em>
</p>

However, we observed that there were graphs that showed promise of correlation but made no sense at all. This can be attributed to coincidence and will be explained in further detail under the Non-Visual Analysis section.

### Non-Visual Analysis 

To determine the extent of correlation between the Sentiments obtained with each COVID-19 Country Dataset, we tried out 3 of the commonly used methods to obtain a correlation score, which was Pearson’s, Spearman’s and Kendall’s correlation. 

As several spikes were observed in certain countries that did not represent the general trend, this resulted in some countries having no correlation when using only Pearson’s. As a result, we also included Spearman’s correlation as an additional comparison as a ranked correlation provides a better snapshot of the trend and it is less susceptible to outliers.

| Type | Mean Person's Correlation | Mean Pearson's P-Value | Mean Spearman Correlation | Mean Spearman's P-value |
| --- | --- | --- | --- | --- | 
| New Daily Cases | 0.426748 | 5.127948e-03 | 0.612606 | 6.230477e-04 |
| New Daily Deaths | 0.320437	 | 2.540525e-02 | 0.511649 | 9.900429e-03 |
| New Daily Tests | 0.471147	 | 5.468281e-01	 | 0.480766	| 4.054155e-03 | 
| Available Hospital Beds per 1000 People | 1.605326e-17	 | 1.0 | NaN | NaN |
| Access to Handwashing | -2.440037e-16	 | 1.0 | NaN | NaN |
| Government Strigency Index | 0.619291	| 3.511850e-03 | 0.681723 | 7.577993e-02 |
<p align="center">
    <em> Average (mean) of all Countries' sentiments vs COVID-19 Data Metric </em>
</p>

The mean of the correlation scores of each country is taken from each metric to first observe a general trend in the data. From the above, we observe that there is the strongest correlation between an increase in Government Stringency Index and Sentiment of the public, showing that actions taken by the government towards COVID-19 results in people being more positive when talking about the Coronavirus. This can be supported with a medium correlation between tests and sentiments, as the number of tests also increased with government actions. 

Even though Cases and Deaths are correlated too, we identified that they are not the main factors that directly cause sentiment to increase as they are only indirectly related. Cases and Deaths increased only due to the mathematical progression of disease spreading while still in the early cycle. This can be supported by the data from China, as the disease spread started earlier than other countries, showing that the cases and deaths do not always increase with an increase in Sentiment. For China, there was a negative correlation for Sentiments vs Cases and Sentiments vs Deaths instead. Therefore, the correlation between Sentiments vs Cases and Sentiments vs Deaths can be attributed to a coincidence.


## Impact of our Findings 

These results can be used by companies/government bodies to identify correlations between a country’s sentiment and respective COVID-19 events (Government Actions via the Government Stringency Index, Daily Cases and Daily Deaths etc.). With correlations, the possibilities are endless. For example, as shown in previous sections, most countries generally become more positive with more government actions. Thus, to make the general population of a country happier, the government can step up its efforts in battling COVID-19 . 

We also observed that a high government stringency index over 2 months will result in a decrease in the number of daily new cases, as seen in the data from China. From this, other countries may learn to choose to increase the government stringency before the cases increase to reduce the impact of the disease outbreak. For Feb - Apr 2020, most countries only increased government stringency once the cases and deaths increased. Countries should not act in this same way in the future as it results in a huge loss in human life.

Companies can also use this data for various means. One such example is targeted ads. Companies would generally prefer to list their ads when the general population is in a more positive and happier state as compared when the population is in a more negative state. This is because, naturally speaking, the happier one is, the more likely one is to spend. And thus, for huge companies who can afford to spend millions in advertisements, advertising at the right time (e.g., when the country’s sentiment is predicted to improve as the government announces new actions to battle covid) can increase their sales by a significant amount. These results can also be used by the general public, in efforts to shine a light on the impact their government’s actions in confronting COVID-19 has had on them.

These results can be impactful in many ways. We hope that this project at least improves the awareness of how people in various countries are feeling towards the current pandemic. Of course, the impact can be magnified if government bodies/companies choose to act on this as they then become aware. Thus, if it is acted upon, the impact could be huge. Companies profit as they then now have a better gauge of when to advertise and the general population of countries becomes happier as their governments now have a gauge of how the general public feels about certain pandemic events.



## Summary 

The main objective of this project is to gain insights from big data as efficiently as possible. Here, we chose to analyze the effect Covid-19 has had on society via sentiment analysis on Covid-19 related tweets. The general data pipeline is as follows: hydration → pre-processing → prediction → post-processing → presentation → analysis. Firstly, using Twitter’s API and multiple Virtual Machines on Azure Cloud, we are able to hydrate the original dataset (tweet IDs) in order to get the tweet texts. Secondly, using the Apache Spark framework, we are able to efficiently pre-process the hydrated tweets (e.g., remove unnecessary columns/rows and clean the tweet text etc.). Thirdly, with the help of pre-trained machine learning models, we are able to then predict the sentiment of each tweet. Fourthly, post-processing of the data would entail using the Apache Spark framework once again to aggregate tweets for presentation (e.g., group tweets by country and day and calculate the average sentiment rating for each country on each day etc.). Presentation of data would then entail displaying the data on specific charts so as to gain insights on the data. Lastly, analysis of data would entail identifying possible correlations on the charts generated via different methods (e.g., visual and Pearson's correlation etc.) and then back up our findings with real-world data (e.g., government actions).

In terms of architecture, the frontend (React) would be responsible for displaying the data on their respective charts. The backend (Azure Cloud) would basically contain the initial data sets, pre-processed data, post-processed data and multiple virtual machines to hydrate the initial data sets. Using Azure Databricks, a Distributed File System (DBFS) and SQL Database will be set up. Apache Spark will also be executed on Azure Databricks. Thus, almost everything will be done via the cloud, as mentioned during the lecture, “DB evolving towards BD”.

All in all, this project hopes to identify possible correlations between the society’s sentiment towards the current pandemic and events which occur during the pandemic. Keeping in mind that correlation does not necessarily entail causation, we hope to give world bodies an estimate on how certain events might be seen by the public. Thus, in turn, events which take a stronger toll on society might attract more attention from the various world bodies.


## References 

[1] - Umair Qazi, Muhammad Imran, Ferda Ofli, "GeoCoV19: A Dataset of Hundreds of Millions of Multilingual COVID-19 Tweets with Location Information", IEEE Dataport, 2020. [Online]. Available: http://dx.doi.org/10.21227/et8d-w881. Accessed: Oct. 07, 2020.


[2] - Diana Beltekian, Daniel Gavrilov, Charlie Giattino, Joe Hasell, Bobbie Macdonald, Edouard Mathieu, Esteban Ortiz-Ospina, Hannah Ritchie, Max Roser, “Complete Covid-19 Dataset”, GitHub, 2020. [Online]. Available: https://github.com/owid/covid-19-data/tree/master/public/data/. Accessed: Oct. 06, 2020.
