const router = require('express').Router()
const authUser = require('../helpers/authUser').authUser

const userController = require('../controllers/userController')

router.get('/login', userController.login)
router.post('/login', userController.loginPost)
router.get('/register', userController.register)
router.post('/register', userController.registerPost)
router.get('/feed', authUser, userController.feed)
router.get('/posts', authUser, userController.posts)
router.get('/account', authUser, userController.account)

module.exports = router