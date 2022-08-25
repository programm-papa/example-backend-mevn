require('module-alias/register');
const express = require('express'),
cors = require('cors'),
cookieParser = require('cookie-parser');
mongoose = require('mongoose'),
consign = require('consign'),
router = require('./app/router/index'),
bodyParser = require('body-parser'),
morgan = require('morgan'),
passport = require('passport'),
passportConfig = require('./config/pasport')(passport),
config = require('./config/index'),
database = require('./config/database')(mongoose, config);


const PORT = process.env.PORT || 3001;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors());
app.use(passport.initialize());
app.use('/api', router);

app.set('secretKey', config.secret);
app.set('specialSecretKey', config.secretSpecial);

app.use(cors({
    credentials: true,
    origin: '*'
}))

// consign({ cwd: process.cwd() })
//       .include('./app/setup/index.js')
//       .then('./app/controllers')
//       .into(app);

const start = async () => {
    try {
        app.listen(PORT, ()=>{console.log(`Server started on PORT = ${PORT}`);})
    } catch (e) {
        console.log(e);
    }
}

start();
