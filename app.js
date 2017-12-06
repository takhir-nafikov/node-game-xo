const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/index');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', routes);

app.use((req, res, next) => {
    res.json({
        status: 'error',
        message: 'not found',
    });
  });

app.use((err, req, res, next) => {
    console.log(err);
    res.json({
        status: 'error',
        message: err,
    });
});

require('dotenv').config({path: 'variables.env'});

mongoose.connect(process.env.DATABASE, {useMongoClient: true});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
  console.error(err.message);
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Express running`);
});
