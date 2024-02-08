module.exports = class userController {

    static login(req, res) {
        res.render('user/login', {layout: false})
    }

    static register(req, res) {
        res.render('user/register', {layout: false})
    }

    static feed(req, res) {
        res.render('user/feed', {layout: 'user'})
    }

    static posts(req, res) {
        res.render('user/posts', {layout: 'user'})
    }

    static account(req, res) {
        res.render('user/account', {layout: 'user'})
    }

}