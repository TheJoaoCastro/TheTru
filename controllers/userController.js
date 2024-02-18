const User = require('../models/User')
//const Friend = require('../models/Friend')
const Post = require('../models/Post')
const { v4: uuid } = require('uuid')
const bcrypt = require('bcryptjs')

const { Op } = require('sequelize')

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

        const users = await User.findAll({ order: [['createdAt', 'DESC']], raw: true })

        return res.render('user/feed', { posts, users, layout: 'user' })
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

        const userData = await User.findOne({ where: { uuid: idUser }, raw: true })

        const data = await Post.findAll({ where: { UserUuid: idUser }, order: [['createdAt', 'DESC']] })
        const posts = data.map((posts) => posts.get({ plain: true }))

        /*
        let stillFriends = await Friend.findOne({where: {friendOneUuid: useruuid, friendTwoUuid: idUser}, raw: true})

        if (stillFriends) {    
            let friendOne = stillFriends.friendOneAccept
            let friendTwo = stillFriends.friendTwoAccept

            if (friendOne != friendTwo) {
                let areFriends = false
                const theRequestFriend = friendOne
                return res.render('user/accountUser', { userData, areFriends, friendOne, friendTwo, theRequestFriend, posts, layout: 'user' })
            } else {
                let areFriends = true
                const theRequestFriend = friendOne
                return res.render('user/accountUser', { userData, areFriends, friendOne, friendTwo, theRequestFriend, posts, layout: 'user' })
            }
            
        }

        if (stillFriends == null) {

            stillFriends = await Friend.findOne({where: {friendTwoUuid: idUser, friendOneUuid: useruuid}, raw: true})
            
            if (stillFriends == null) {
                const friendOne = false
                const friendTwo = false
                const areFriends = false
                const theRequestFriend = friendOne

                return res.render('user/accountUser', { userData, areFriends, friendOne, friendTwo, theRequestFriend, posts, layout: 'user' })
            }
            
            let friendOne = stillFriends.friendOneAccept
            let friendTwo = stillFriends.friendTwoAccept

            if (friendOne != friendTwo) {
                let areFriends = false
            } else {
                let areFriends = true
            }

            const theRequestFriend = friendOne
            */
        return res.render('user/accountUser', { userData, posts, layout: 'user' }) // areFriends, friendOne, friendTwo, theRequestFriend
    }
/*
    static async friendRequest(req, res) {
        let userid = req.session.userid
        let requestFriendId = req.params.id

        let stillFriends = await Friend.findOne({where: {friendOneUuid: userid, friendTwoUuid: requestFriendId}, raw: true})

        if (stillFriends == null) {
            stillFriends = await Friend.findOne({where: {friendOneUuid: requestFriendId, friendTwoUuid: userid}, raw: true})
            
            if (stillFriends != null) {

                const friendship = {
                    friendOneAccept: false,
                    friendTwoAccept: true
                }
        
                await Friend.update(friendship, {where: {friendOneUuid: requestFriendId}})
                return res.redirect(`/user/account/${requestFriendId}`)

            } else {

                const friendship = {
                    friendOneUuid: userid,
                    friendTwoUuid: requestFriendId,
                    friendOneAccept: true,
                    friendTwoAccept: false
                }

                await Friend.create(friendship)
                return res.redirect(`/user/account/${requestFriendId}`)
            }
        }

        const friendship = {
            friendOneAccept: true,
            friendTwoAccept: false
        }

        await Friend.update(friendship, {where: {friendOneUuid: userid}})
        return res.redirect(`/user/account/${requestFriendId}`)
    }

    static async acceptFriendRequest(req, res) {
        let userid = req.session.userid
        let requestFriendId = req.params.id

        let data = await Friend.findOne({where: {friendOneUuid: userid, friendTwoUuid: requestFriendId}, raw: true})

        if (data == null) {

            let data = await Friend.findOne({where: {friendOneUuid: requestFriendId, friendTwoUuid: userid}, raw: true})

            if (!data.friendTwoAccept) {
                const updateStatus = {
                    friendTwoAccept: true
                }
                await Friend.update(updateStatus, {where: {friendOneUuid: userid, friendTwoUuid: requestFriendId}})
                return res.redirect(`/user/account/${requestFriendId}`)

            } else {

                const updateStatus = {
                    friendTwoAccept: false
                }
                await Friend.update(updateStatus, {where: {friendOneUuid: userid, friendTwoUuid: requestFriendId}})
                return res.redirect(`/user/account/${requestFriendId}`)
            }

        } else {

            if (!data.friendOneAccept) {
                const updateStatus = {
                    friendOneAccept: true
                }
                await Friend.update(updateStatus, {where: {friendOneUuid: userid, friendTwoUuid: requestFriendId}})
                return res.redirect(`/user/account/${requestFriendId}`)

        } else {

                const updateStatus = {
                    friendOneAccept: false
                }
                await Friend.update(updateStatus, {where: {friendOneUuid: userid, friendTwoUuid: requestFriendId}})
                return res.redirect(`/user/account/${requestFriendId}`)
            }
        }
    }
    */

    static logout(req, res) {
        req.session.destroy()
        res.redirect('/')
    }

}