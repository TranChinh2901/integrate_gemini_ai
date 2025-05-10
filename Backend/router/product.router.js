const express = require('express');
const { createProduct, getAllProduct } = require('../controller/product.controller');
const router = express.Router();

router.post('/product', createProduct)
router.get('/product', getAllProduct)

module.exports = router;