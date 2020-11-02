const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const managerRoute = require('./routes/manager');
const employeeRoute = require('./routes/employee');

const app = express();
// load config
dotenv.config({ path: './app/config/config.env' });
const PORT = process.env.PORT || 3000;
const db = require('./app/config/mongoConnection');

db.connect();

// middleware to see body datas
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// flash
app.use(flash());

// global middlewares
app.use((req, res, next) => {
  res.locals.manager = 'Sarath Raj C K';
  next();
});

app.use('/manager', session({
  name: 'managerCookie',
  secret: process.env.COOKIE_SECRET,
  store: new MongoStore({ url: 'mongodb://localhost:27017/Library' }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));

app.use('/employee', session({
  name: 'employeeCookie',
  secret: process.env.COOKIE_SECRET,
  store: new MongoStore({ url: 'mongodb://localhost:27017/Library' }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));

// set template engine
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/manager', managerRoute);
app.use('/employee', employeeRoute);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
