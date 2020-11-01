const dotenv = require('dotenv');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const session = require('express-session');
const managerRoute = require('./routes/manager');

const app = express();
// load config
dotenv.config({ path: './app/config/config.env' });
const PORT = process.env.PORT || 3000;

// middleware to see body datas
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/manager', session({
  name: 'managerCookie',
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
}));

// set template engine
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/manager', managerRoute);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
