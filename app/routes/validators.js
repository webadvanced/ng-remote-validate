var express = require('express');
var router = express.Router();


router.post('/duplicate', function( req, res ) {
  var valid = (req.body.value === 'good' || req.body.value != 'paul@wa.com');
  res.json( { isValid:valid, value: req.body.value } );
});

router.post('/restricted', function( req, res ) {
  var valid = (req.body.value === 'good' || req.body.value === 'paul@wa.com');
  res.json( { isValid:valid, value: req.body.value } );
});

module.exports = router;
