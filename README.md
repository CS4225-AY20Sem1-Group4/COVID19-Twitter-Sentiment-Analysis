# COVID19-Twitter-Sentiment-Analysis
We are a group of undergraduate and graduate students from the National University of Singapore. As part of our Big Data Systems for Data Science module (CS4225), we embarked on a project that involved performing sentiment analysis on over 1TB of data (tweets). 


## Introduction 

Covid-19 is turning out to be one of the biggest pandemics that humanity has ever faced. The virus has infected 33.8 million people and claimed 1.01 million lives till date. With governments imposing restrictions, disrupting our daily routines in the process and the threat of getting infected, these are troubling times indeed.

This study aims to give a country-level representation of the sentiments felt by people based on certain Covid-19 events (e.g., death count, actions taken by the government etc.). 
We wanted to understand the true public sentiments towards some of the measures imposed by their governments. As each country handles the virus differently, some countries are more successful than others. We hope that through this study , we could give world bodies and policy makers an estimate as to how certain events might change the public's outlook. On the other hand, the public could look at what other governments are successfully doing and suggest the same with their own governments. All in all, we want to equip both the public and policymakers with a visualization tool to help them make better decisions. 

Since the start of the pandemic, countries have been reporting their statistics based on Covid-19 events (e.g., death count, case count etc.) to promptly reflect the situation in their country. These numbers are reported by an approved body within each country. With these numbers along with some gauge of sentiment, we can then identify possible correlations. However, gauging the public’s sentiment is no easy task, which is why we have decided to use one of the most popular social media platforms, Twitter. As of the start of 2020, Twitter has 330 million monthly active users and 145 million daily active users. With huge amounts of tweets made publicly available (more data → better averages/predictions) as well as it's easy-to-use API’s, we felt that doing sentiment analysis on these tweets would be worthwhile. 


## Methodology & Experimentation 

### Approach 

We started with the idea of performing a time-based analysis of people’s sentiments over specific time frames (i.e. sentiment changes for days, weeks or months instead of aggregated results over a singular time frame). With our time-sensitive approach, we were able to identify how the events in the real-world (i.e. Government stringency, handwashing facilities or testing facilities) truly affected people’s sentiments. This meant that we needed two sets of data - COVID-19 related tweets and COVID-19 statistics per country. The datasets that we chose had to also be available during an extended period (2 - 3 months).

To choose the specific timeframes for our dataset, we had to look at the timeline of when COVID-19 started. The first few cases of COVID-19 were identified in Wuhan City, China in December 2019. According to the World Health Organisation (WHO), the first few confirmed cases outside mainland China occurred in Japan, South Korea and Thailand in mid-January. On January 30th, the WHO declared the outbreak of COVID-19 to be a Public Health Emergency of International Concern. On March 11th, the WHO then declared it to be a pandemic. Hence, we decided to extract data from February to April. 

We also decided to expand our analysis to many countries across the world. This allowed us to do a comparative analysis between countries. This can be looked at in two different ways -- people and policy maker’s point of view. People in countries that are not doing so well could look at what successful countries had done to successfully combat the virus and suggest similar actions to their respective country’s authorities. On the other hand, policymakers could look at what actions drive people’s sentiments in a positive or negative direction and hence, act accordingly.   

### Architecture 

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/35773953/101277303-78997880-37ee-11eb-8d9f-86fbb45ab132.png>
</p>

