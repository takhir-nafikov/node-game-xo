const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

require('dotenv').config({ path: 'variables.env' });

app.listen(3000, () => {
    console.log(`Express running`);
});
