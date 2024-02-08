const express = require('express')
const exphbs = require('express-handlebars')

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

// routes
app.use('/user', usersRoutes)

app.get('/', (req, res) => {
    res.redirect('/user/login')
})

app.use((req, res) => {
    res.render('page/notfound', {layout: false})
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