module.exports.authUser = function (req, res, next) {

    if (!req.session.userid) {
        return res.redirect('/user/login')
    }

    next()
}