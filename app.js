const path = require('path')
const http = require('http').createServer();
const express = require('express')
const socketio = require('socket.io')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')
const morgan = require('morgan')
const flash = require('connect-flash')
const { resolve } = require('path')
const { Cookie } = require('express-session')
const { Mongoose } = require('mongoose')
var _ = require('underscore');


//Load Config
dotenv.config({ path: './config/config.env'})

//Passport config
require('./config/passport')(passport)

connectDB()

const app = express()


//Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//flash configure

  
    app.use(flash());

//method override
app.use(
    methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))

//Logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

//handlebar helpers
const { formatDate, stripTags, truncate, editIcon,editIconfeed, select, checklength, validImage,validVideo,validProfileImage,validImageEnlarge,TimeStatus,featured,checkLikes,checkComments,checkstate, validUser,validLikedUser,validFollowedUser,validLikedUserTag,checkLikedLength,checkLikedState,checkLikedStateforsingle,checkRequeststate,sendRequest,getStatus,showMessageIcon } = require('./helpers/hbs')



//Handlebars
app.engine(
    '.hbs', 
    exphbs({
        helpers: {
            iter:function(context, options) {
                var fn = options.fn, inverse = options.inverse;
                var ret = "";
              
                if(context && context.length > 0) {
                  for(var i=0, j=context.length; i<j; i++) {
                    ret = ret + fn( _.extend({}, context[i], { i: i, iPlus1: i + 1 }));
                  }
                } else {
                  ret = inverse(this);
                }
                return ret;
              },
            formatDate,
            stripTags,
            truncate,
            editIcon,
            editIconfeed,
            select,
            checklength,
            validImage,
            validVideo,
            validProfileImage,
            validImageEnlarge,
            TimeStatus,
            featured,
            checkLikes,
            checkComments,
            checkstate,
            validUser,
            validLikedUser,
            validLikedUserTag,
            validFollowedUser,
            checkLikedLength,
            checkLikedState,
            checkLikedStateforsingle,
            checkRequeststate,
            sendRequest,
            getStatus,
            showMessageIcon
        },
        defaultLayout: 'main', 
        extname: '.hbs'
    })
);
app.set('view engine', '.hbs');



//Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
    }

))


//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

//set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

//Static folder
app.use(express.static(path.join(__dirname, 'public')))


//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/feed', require('./routes/feed'))
app.use('/search', require('./routes/search'))
app.use('/find_friends', require('./routes/find_friends'))
app.use('/videos', require('./routes/videos'))
app.use('/notifications', require('./routes/notifications'))



const PORT = process.env.PORT || 3000


app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} node on port ${PORT}`)
    )


// connecting socket.io

const io = socketio(http);

io.on("connection", function (socket) {
  console.log("Made Socket connection");
  socket.on("disconnect", function () {
    console.log("made socket disconnected")
  });

  socket.on("send-notificaition", function (data) {
    socket.broadcast.emit("new-notification", data);
  });
});