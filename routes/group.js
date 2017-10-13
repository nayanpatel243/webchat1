const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/', (req, res, next) => {
  axios.get('http://104.251.219.35:9090/plugins/restapi/v1/groups', {
    headers: { Authorization: 'KwnQEEWJXb5XmSa6', 'Content-Type': 'application/json', Accept: 'application/json' },
  }).then((response) => {
    console.log('response from fetch Tasks ', response.data);
    res.json({ success: true, data: response.data });
  }).catch((e) => {
    console.log('Error from getTasks ', e);
  });
});

/*router.get('/', (req, res, next) => {
  axios.get('http://104.251.219.35:9090/plugins/restapi/v1/groups', {
    headers: { Authorization: 'KwnQEEWJXb5XmSa6', 'Content-Type': 'application/json', Accept: 'application/json' },
  }).then((response) => {
    console.log('response from fetch Tasks ', response.data);
    res.json({ success: true, data: response.data });
  }).catch((e) => {
    console.log('Error from getTasks ', e);
  });
});*/

module.exports = router;
