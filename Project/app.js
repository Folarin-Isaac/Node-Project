
const express = require('express');
const app = express();
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config({ path: './.env'})

// create a database connection
 const db = mysql.createConnection({
     host:process.env.DB_HOST,
     user:process.env.DB_USER,
     password:process.env.DB_PASS,
     database:process.env.MYSQL_DB
 });

 db.connect((error)=>{
     if(error){
         console.log(error)
     }
     else{
         console.log("My Database is Connected!")
     }
 });

 const directory = path.join(__dirname, './general');

 // parse URL encoded bodies(as sent through the HTML forms)
app.use( express.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API Clients)
app.use(express.json());

// set up the cookie
app.use(cookieParser());

 // Express to grab all the CSS,HTML or JavaScript files
 app.use(express.static(directory));
 console.log(__dirname);

 // set up hbs for templating
 app.set('view engine', 'hbs');



// Define Routes
app.use('/', require('./routes/pages')); 
app.use('/user', require('./routes/user'));



app.listen(3000, ()=>{
    console.log("My Server is running on PORT");
});

