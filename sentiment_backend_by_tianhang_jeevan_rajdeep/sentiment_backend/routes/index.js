var express = require('express');
var router = express.Router();
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const key = '';
const endpoint = 'https://cs4225test.cognitiveservices.azure.com/';
const textAnalyticsClient = new TextAnalyticsClient(endpoint,  new AzureKeyCredential(key));
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });

});

router.post('/sentiment', function(req, res, next) {
  sentimentAnalysis(textAnalyticsClient,req.body.data).then((result)=>{
    res.send(result)
  })
});

router.post('/language', function(req, res, next) {
  languageDetection(textAnalyticsClient,req.body.data).then((result)=>{
    res.send(result)
  })
});
async function languageDetection(client,sentence) {

  const languageInputArray = [sentence];
  const languageResult = await client.detectLanguage(languageInputArray);

  return languageResult;
}

async function sentimentAnalysis(client,sentence){

  const sentimentInput = [sentence];
  const sentimentResult = await client.analyzeSentiment(sentimentInput);

  return sentimentResult;
}
module.exports = router;
