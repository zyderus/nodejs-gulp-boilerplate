require('dotenv').config();

const express   = require('express');
const mongoose  = require('mongoose');
const chalk     = require('chalk');

const app       = express();
const PORT      = process.env.PORT || 10500;
// const DBURL     = process.env.DATABASEURL || "mongodb://localhost/my-db";


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
// mongoose.connect(DBURL, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(function() { console.log(`Connected to database...`) })
//   .catch(function(err) { console.log(`Database NOT availabe!`, err) });


app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => { 
  console.log(`Server ${chalk.cyan('running on port')} ${chalk.red(PORT)}`);
});