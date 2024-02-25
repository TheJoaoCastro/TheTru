const User = require('../models/User')
//const Friend = require('../models/Friend')
const Post = require('../models/Post')
const { v4: uuid } = require('uuid')
const bcrypt = require('bcryptjs')

const { Op } = require('sequelize')
const Friend = require('../models/Friend')

module.exports = class userController {

    static login(req, res) {

        if (req.session.userid) {
            return res.redirect('/user/feed')
        }

        return res.render('user/login', { layout: false })
    }

    static async loginPost(req, res) {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email: email }, raw: true })

        //verifica se o email/usuario existe
        if (!user) {
            req.flash('alert', `Email don't registred!`)
            return res.render('user/login', { layout: false })
        }

        // compara a senha enviada com a senha cryptografada no banco
        const passwordMatch = bcrypt.compareSync(password, user.password)

        if (!passwordMatch) {
            req.flash('alert', `Password don't match!`)
            return res.render('user/login', { layout: false })
        }

        req.session.userid = user.uuid

        req.session.save(() => {
            res.redirect('/user/feed')
        })

    }

    static register(req, res) {
        return res.render('user/register', { layout: false })
    }

    static async registerPost(req, res) {
        const { name, email, password, confirmPassword } = req.body

        const checkIfUserExists = await User.findOne({ where: { email: email }, raw: true })

        if (checkIfUserExists) {
            req.flash('alert', 'Email already exists!')
            return res.redirect('/user/login')
        }

        if (password != confirmPassword) {
            req.flash('alert', `Passwords don't match!`)
            return res.redirect('/user/login')
        }

        // hash password
        const hashedPassword = bcrypt.hashSync(password)

        const userData = {
            uuid: uuid(),
            name,
            email,
            password: hashedPassword
        }

        const user = await User.create(userData)

        req.flash('message', 'Welcome!')

        req.session.userid = user.uuid

        req.session.save(() => {
            return res.redirect('/user/feed')
        })
    }

    static async feed(req, res) {

        const data = await Post.findAll({ include: User, order: [['createdAt', 'DESC']] })

        const posts = data.map((posts) => posts.get({ plain: true }))

        const user = await User.findOne({ where: { uuid: req.session.userid }, raw: true })

        const users = await User.findAll({ order: [['createdAt', 'DESC']], raw: true })

        return res.render('user/feed', { posts, user, users, layout: 'user' })
    }

    static async posts(req, res) {

        const data = await Post.findAll({ where: { UserUuid: req.session.userid }, order: [['createdAt', 'DESC']] })

        const posts = data.map((posts) => posts.get({ plain: true }))

        const dataUser = await User.findOne({ where: { uuid: req.session.userid }, raw: true })

        return res.render('user/posts', { posts, dataUser, layout: 'user' })
    }

    static async postsCreate(req, res) {
        
        const title = req.body.post

        const image = req.body.image

        const useruuid = req.session.userid

        const user = await User.findOne({ where: { uuid: useruuid }, raw: true })

        const post = {
            title,
            image: image,
            UserUuid: useruuid,
            UserId: user.id
        }

        await Post.create(post)

        return res.redirect('/user/feed')
    }

    static async postsDelete(req, res) {
        const postId = req.params.id

        const userLogged = req.session.userid

        const data = await Post.findOne({ where: { id: postId }, raw: true })

        if (data.UserUuid != userLogged) {
            return res.redirect('/user/account')
        }

        await Post.destroy({ where: { id: postId } })

        return res.redirect('/user/posts')
    }

    static async account(req, res) {

        const idUser = req.session.userid

        const userData = await User.findOne({ where: { uuid: idUser }, raw: true })

        return res.render('user/account', { userData, layout: 'user' })
    }

    static async accountUpdate(req, res) {

        const { name, picture } = req.body

        const userData = {
            name: name,
            picture: picture
        }

        const user = await User.update(userData, { where: { uuid: req.session.userid } })

        return res.redirect('/user/account')

    }

    static async accountUser(req, res) {

        const useruuid = req.session.userid
        const idUser = req.params.id

        if (useruuid == idUser) {
            return res.redirect('/user/posts')
        }

        const userData = await User.findOne({ where: { uuid: idUser }, raw: true })

        const data = await Post.findAll({ where: { UserUuid: idUser }, order: [['createdAt', 'DESC']] })
        const posts = data.map((posts) => posts.get({ plain: true }))

        // TODO friendly e areFriends
        let friends = await Friend.findOne({where: {friendOneUuid: useruuid, friendTwoUuid: idUser}, raw: true})

        if (friends != null) {
            const areFriendOne = true
            const areFriends = friends.friendOneAccept == true && friends.friendTwoAccept == true ? true : false
            return res.render('user/accountUser', { friends, areFriends, areFriendOne, userData, posts, layout: 'user' })
        }

        friends = await Friend.findOne({where: {friendOneUuid: idUser, friendTwoUuid: useruuid}, raw: true})

        if (friends != null) {
            const areFriendOne = false
            const areFriends = friends.friendOneAccept == true && friends.friendTwoAccept == true ? true : false
            return res.render('user/accountUser', { friends, areFriends, areFriendOne, userData, posts, layout: 'user' })
        }

        const areFriendOne = false
        const areFriends = false
        return res.render('user/accountUser', { areFriends, areFriendOne, userData, posts, layout: 'user' })
    }

    static async friendRequest(req, res) {
        const friendSession = req.session.userid
        const friendRequest = req.params.id

        let friends = await Friend.findOne({where: {friendOneUuid: friendSession, friendTwoUuid: friendRequest}})

        // verifica se tem alguma amizade igual
        if (friends != null) {

            const friendly = {
                friendOneUuid: friendSession,
                friendTwoUuid: friendRequest,
                friendOneAccept: true,
                friendTwoAccept: false
            }

            await Friend.update(friendly, {friendly, where: {friendOneUuid: friendSession, friendTwoUuid: friendRequest}})
            res.redirect(`/user/account/${friendRequest}`)
        }

        friends = await Friend.findOne({where: {friendOneUuid: friendRequest, friendTwoUuid: friendSession}})    

        // caso tenha encontrado a amizade
        if (friends != null) {
            
            const friendly = {
                friendOneUuid: friendRequest,
                friendTwoUuid: friendSession,
                friendOneAccept: false,
                friendTwoAccept: true
            }

            await Friend.update(friendly, {where: {friendOneUuid: friendRequest, friendTwoUuid: friendSession}})
            res.redirect(`/user/account/${friendRequest}`)
        }

        // caso não tenha localizado, cria a amizade
        const friendly = {
            friendOneUuid: friendSession,
            friendTwoUuid: friendRequest,
            friendOneAccept: true,
            friendTwoAccept: false
        }

        await Friend.create(friendly)

        res.redirect(`/user/account/${friendRequest}`)

    }

    static async acceptFriendRequest(req, res) {
        const friendSession = req.session.userid
        const friendRequest = req.params.id
        
        let friends = await Friend.findOne({where: {friendOneUuid: friendSession, friendTwoUuid: friendRequest}})

        if (friends != null) {

            const friendly = {
                friendOneUuid: friendSession,
                friendTwoUuid: friendRequest,
                friendOneAccept: true,
                friendTwoAccept: true
            }

            await Friend.update(friendly, {where: {friendOneUuid: friendSession, friendTwoUuid: friendRequest}})
            res.redirect(`/user/account/${friendRequest}`)
        }

        const friendly = {
            friendOneUuid: friendRequest,
            friendTwoUuid: friendSession,
            friendOneAccept: true,
            friendTwoAccept: true
        }

        await Friend.update(friendly, {where: {friendOneUuid: friendRequest, friendTwoUuid: friendSession}})
        res.redirect(`/user/account/${friendRequest}`)
    }

    static async cancelFriendRequest(req, res) {
        const friendSession = req.session.userid
        const friendRequest = req.params.id
        
        let friends = await Friend.findOne({where: {friendOneUuid: friendSession, friendTwoUuid: friendRequest}})
 
        if (friends != null) {
            await Friend.destroy({where: {friendOneUuid: friendSession, friendTwoUuid: friendRequest}})
            return res.redirect(`/user/account/${friendRequest}`)
        }

        await Friend.destroy({where: {friendOneUuid: friendRequest, friendTwoUuid: friendSession}})
        res.redirect(`/user/account/${friendRequest}`)
    }

    static logout(req, res) {
        req.session.destroy()
        res.redirect('/')
    }

}