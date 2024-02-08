const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')

router.get('/login', userController.login)
router.get('/register', userController.register)
router.get('/feed', userController.feed)
router.get('/posts', userController.posts)
router.get('/account', userController.account)

module.exports = router