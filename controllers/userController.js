const User = require('../models/User')
const { v4: uuid } = require('uuid')
const bcrypt = require('bcryptjs')

module.exports = class userController {

    static login(req, res) {
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

        await User.create(userData)

        return res.redirect('/user/feed')
    }

    static feed(req, res) {
        return res.render('user/feed', { layout: 'user' })
    }

    static posts(req, res) {
        return res.render('user/posts', { layout: 'user' })
    }

    static account(req, res) {
        return res.render('user/account', { layout: 'user' })
    }

}