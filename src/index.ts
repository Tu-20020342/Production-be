import express, { Application } from 'express';
import { authRouter } from './routers/authRouter';
import { userRouter } from './routers/userRouter';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { activateMailProcess, forgotPassMailProcess } from './processes/mailProcess';
import hbs, { NodemailerExpressHandlebarsOptions } from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';
import path from 'path';
import passport from 'passport';
import { Strategy } from 'passport-facebook';
import session from 'express-session';
import { Account } from './models/accountModel';
import { divisionRouter } from './routers/divisionRouter';
import { categoryRouter } from './routers/categoryRouter';
import { bathRouter } from './routers/batchRouter';
import { productRouter } from './routers/productRouter';
import { uploadRouter } from './routers/uploadRouter';

const app: Application = express();
const port = 3000;

app.use(cookieParser());
dotenv.config({ path: './.env' });
app.use('/product-image', express.static(path.resolve('./files/product-image')));
app.use('/post-image', express.static(path.resolve('./files/post-image')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
  }),
);
app.use(passport.authenticate('session'));
passport.serializeUser(function (user: any, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function (user: any, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});
passport.use(
  new Strategy(
    {
      clientID: String(process.env['FACEBOOK_CLIENT_ID']),
      clientSecret: String(process.env['FACEBOOK_CLIENT_SECRET']),
      callbackURL: 'http://localhost:3000/auth/facebook/sign-in/call-back',
    },
    async function verify(accessToken, refreshToken, profile, cb) {
      const existAccount = await Account.findOne({ facebook_id: profile.id });
      if (existAccount) {
        return cb(null, existAccount);
      } else {
        const createAccount = await Account.create({
          facebook_id: profile.id,
          birth: profile?.birthday,
          name: profile?.displayName,
          isActivate: true,
        });
        return cb(null, createAccount);
      }
    },
  ),
);
const transporter = nodemailer.createTransport({
  host: String(process.env.MAIL_HOST),
  auth: {
    user: String(process.env.MAIL_USER),
    pass: String(process.env.MAIL_PASS),
  },
});
const handleBarOptions: NodemailerExpressHandlebarsOptions = {
  viewEngine: {
    extname: '.handlebars',
    partialsDir: path.resolve('./views'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./views'),
  extName: '.handlebars',
};
transporter.use('compile', hbs(handleBarOptions));

mongoose
  .connect(String(process.env.MONGO_URL))
  .then(() => {
    console.log('Connnect mongo successfully');
  })
  .catch(() => {
    console.log('Connect mongo failed');
  });

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/division', divisionRouter);
app.use('/category', categoryRouter);
app.use('/batch', bathRouter);
app.use('/product', productRouter);
app.use('/upload', uploadRouter);

activateMailProcess(transporter);
forgotPassMailProcess(transporter);

app.listen(port, (): void => {
  console.log(`Connected successfully on port ${port}`);
});
