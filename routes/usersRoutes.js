const router = require('express').Router()
const authUser = require('../helpers/authUser').authUser

const userController = require('../controllers/userController')

router.get('/login', userController.login)
router.post('/login', userController.loginPost)
router.get('/register', userController.register)
router.post('/register', userController.registerPost)
router.get('/feed', authUser, userController.feed)
//router.get('/friendRequest/:id', authUser, userController.friendRequest)
//router.get('/acceptFriendRequest/:id', authUser, userController.acceptFriendRequest)
router.get('/posts', authUser, userController.posts)
router.post('/posts/create', authUser, userController.postsCreate)
router.get('/posts/delete/:id', authUser, userController.postsDelete)
router.get('/account', authUser, userController.account) //TODO ver se é o mesmo usuario, e dps redirecionar para essa rota
router.post('/account/update', authUser, userController.accountUpdate)
router.get('/account/:id', authUser, userController.accountUser)
router.get('/logout', authUser, userController.logout)

module.exports = router