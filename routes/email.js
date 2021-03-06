const express = require('express');
const busboy = require('connect-busboy');
const router = express.Router();
const crypto = require('crypto');
const moment = require('moment');

const GeoData = require("../src/geo-data");

const key = process.env.MAILGUN_API_KEY;
const checkSignature = (timestamp, token, signature) => {
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(timestamp + token);
  const digest = hmac.digest('hex');
  return digest === signature;
}

router.use(busboy({ immediate: true }));
router.post('/api/inbound-email', (req, res, next) => {
  console.log("Inbound email");
  if(checkSignature(req.body.timestamp, req.body.token, req.body.signature)) {
    console.log(req.body['X-Spot-Type']);
    if(req.body['X-Spot-Type'] === 'NEWMOVEMENT') {
      console.log({
        x: req.body['X-Spot-Latitude'],
        y: req.body['X-Spot-Longitude'],
        datetime: moment.unix(req.body['X-Spot-Time'])
      });
      res.sendStatus(204);
      /*
      GeoData.addPoint({
        x: req.body['X-Spot-Latitude'],
        y: req.body['X-Spot-Longitude'],
        depth: 0,
        boat: 'sub',
        datetime: moment.unix(req.body['X-Spot-Time'])
      }).then(() => {
        console.log("Point inserted");
        res.sendStatus(201)
      }).catch(next);
      */
    } else {
      res.sendStatus(200);
    }
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
