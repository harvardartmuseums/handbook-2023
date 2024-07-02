var express = require('express');
var router = express.Router();
const settings = require('../libs/settings');

var selected = require('../libs/selected');
let lists;
let stats;

/* GET home page. */
router.get('/', async function(req, res, next) {
  lists = await selected.getLists();
  stats = await selected.getStats();

  res.render('index', { title: settings.sitename, subtitle: settings.description, data: lists.objects });
});

router.get('/list', async function(req, res, next) {
  lists = await selected.getLists();
  stats = await selected.getStats();

  res.render('list', { title: settings.sitename, subtitle: 'Tabular view of the handbook', objects: lists.objects, exhibitions: lists.exhibitions, stats: stats });
});

router.get('/gradients', function(req, res, next) {
  res.render('gradients', { title: settings.sitename, subtitle: 'Visualizations of color, image samples, and stats'});
});

router.get('/stats', function(req, res, next) {
  res.render('stats', { title: settings.sitename, subtitle: 'Statistics about the artworks'});
});

router.get('/objects/:id', async function(req, res, next) {
  lists = await selected.getLists();
  let artwork = lists.objects.find((r) => r.objectid == req.params.id);

  res.render('object-details', {title: settings.sitename, subtitle: 'Everything we know about this object', object: artwork});
});

router.get('/objects/:id/talk', async function(req, res, next) {
  lists = await selected.getLists();
  let object = lists.objects.find((r) => r.objectid == req.params.id);

  res.render('object-talk', {layout: 'layout-object-chat', title: settings.sitename, subtitle: 'We need to talk', object: object});
});

module.exports = router;
