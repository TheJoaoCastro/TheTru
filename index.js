const express = require('express')
const exphbs = require('express-handlebars')
const flash = require('express-flash')
const session = require('express-session')
const FileStore = require('session-file-store')(session)

// db connection
const conn = require('./db/conn')

// routes import
const usersRoutes = require('./routes/usersRoutes')

// main application
const app = express()

// set template engine
app.set('view engine', 'handlebars')
app.engine('handlebars', exphbs.engine())

// body parser
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())

// set folder of the css and images
app.use(express.static('public')) 

// flash messages
app.use(flash())

// create session
app.use(
    session({
        name: 'session',
        secret: 'a_very_strong_secret',
        resave: false,
        saveUninitialized: false,
        store: new FileStore({
            logFn: function () { },
            path: require('path').join(require('os').tmpdir(), 'sessions')
        }),
        cookie: {
            secure: false,
            maxAge: 360000,
            expires: new Date(Date.now() + 360000),
            httpOnly: true
        }
    })
)

app.use((req, res, next) => {

    if (req.session.userid) {
        res.locals.session = req.session
    }

    next()
})

// routes
app.use('/user', usersRoutes)

app.get('/', (req, res) => {
    res.redirect('/user/login')
})

app.use((req, res) => {
    res.render('page/notfound', { layout: false })
})

// sync with db and connect
conn
    .sync()
    .then(
        app.listen(3000),
        console.log('DB connected!')
    ).catch(
        (error) => console.log(error)
    )