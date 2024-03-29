let express = require('express');
let router = express.Router();
const HAM = require('@harvardartmuseums/ham');
const selected = require('../libs/selected');
const settings = require('../libs/settings');
const aiWriter = require('../libs/ai-writer');
const {ChatOpenAI} = require('@langchain/openai');
const {ChatPromptTemplate} = require('@langchain/core/prompts');

let api = new HAM(process.env.HAM_APIKEY);
let lists;

const model = new ChatOpenAI ({
    modelName: "gpt-4",
    temperature: 0.7,
    maxTokens: 1000,
    maxRetries: 5,
  });

router.get('/', async function(req, res, next) {
    res.render('chat', { title: settings.sitename, subtitle: 'Chat with the handbook'});
});

router.get('/prompt', async function(req, res, next) {
    lists = await selected.getLists();
    let stories = lists.objects.map(o => o.stories.plaintext);

    res.json({stories: stories});
});

router.post('/message', async function(req, res, next) {

    let message = req.body.message;
   
    const response = await model.invoke(message);    

    res.json({response: response.content});
});

router.get('/:id', async function(req, res, next) {
    lists = await selected.getLists();
    let artwork = lists.objects.find((r) => r.objectid == req.params.id);

    let dialog = await aiWriter.generateStory(artwork);

    res.json({dialog: dialog});
});

module.exports = router;