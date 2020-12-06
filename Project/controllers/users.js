const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// create a database connection
const db = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.MYSQL_DB
});

exports.login = async (req, res)=>{
    try {
        const { email, password } = req.body;

        if( !email || !password){
            return res.status(400).render('login', {
                message: "Please enter your email and password."
            });
        }
        db.query('SELECT * FROM users WHERE email = ?', [email], async(error, results)=>{
             console.log(results);
            if( !results || !(await bcrypt.compare(password, results[0].password))){
                res.status(401).render('login', {
                    message: "Email or Password is invalid!"
                })
            } else {
                const id = results[0].id;

                const token = jwt.sign({id}, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                // cookie for every user that is logged in
                console.log("The token is: "+ token);

                // Options in the cookie created
                const cookieOptions = {
                    expires: new Date(
                        // current date
                        Date.now() + process.env.JWT_COOKIE_EXPIRES *24 *60 *60 *1000
                    ),
                    httpOnly: true
                }
                res.cookie('jwt', token, cookieOptions)
                res.status(200).redirect("/");
            }
            

        })
        
    } catch (error) {
        console.log(error)
        
    }

}


exports.register = (req, res)=>{
    // to grab all the data that would be inputed by the users
    console.log(req.body);
    
    const { name, email, password, passwordConfirm } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results)=>{
        if(error){
            console.log(error);
        }
        if(results.length > 0) {
            return res.render('register', {
                message: "Ooops! that email has been taken.."
            })
            // Validate if the password and confirmPassword are thesame
        }else if( password !== passwordConfirm) {
            return res.render('register', {
                message: "Passwords do not match!"
            });
        }
          // To hash the password
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);
          
        //  Here, I'm receiving the following data to store them in the database
        db.query('INSERT INTO users SET?', {name: name, email: email, password: hashedPassword}, (error, results)=>{
            if(error){
                console.log(error)
            } else{
                console.log(results);
                return res.render('register', {
                    message: "Congratulations! you have been successfully registered."
                });
            }

        })
    });



}