const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'monkas123',
    database: 'monkas'
});


const app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.set({'Content-Type': 'text/html'});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname)));
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname);

app.get('/', (req, res) => {
    res.render(path.join(__dirname + '/login.ejs'));
});

//Homepage
app.get('/home', (req, res) => {
    var session_username = req.session.username;
    var user_data_arr;
    connect.query('SELECT * FROM monkas.marlin_data WHERE username = ?', [session_username], (error, results, fields) => {
        if (error) console.log(error);
        user_data_arr = results; 
        if(!req.session.loggedin){
            res.redirect('/');
        } else{ 
            res.render(path.join(__dirname + '/home/homepage.ejs'), {session_username:session_username, user_data_arr: JSON.stringify(user_data_arr)});
        }
        res.end();
    });

});

//Adding page
app.get('/home_add', (req, res) => {
    var session_username = req.session.username;
    if(!req.session.loggedin){
        res.redirect('/');
    } else{ 
        res.render(path.join(__dirname + '/home_add/add_entries.ejs'), {session_username:session_username});
    }
});

//Admin page
app.get('/admin', (req, res) => {
    var un = req.session.adminusername;
    if(!req.session.adminloggedin){
        res.render(path.join(__dirname + '/admin/admin_login.ejs'));
    } else {
        connect.query('SELECT *, SUM(total_time) FROM monkas.marlin_data GROUP BY username', (error, results, fields) => {
            if (error) console.error(error);
            var all_data = results;
            res.render(path.join(__dirname + '/admin/admin_homepage.ejs'), {session_username:un, data_arr: JSON.stringify(all_data)});
        });
    }
});

app.get('/admin_tools', (req, res) => {
    if(!req.session.adminloggedin){
        res.redirect('/admin');
    } else {
        res.render(path.join(__dirname + '/admin_tools/users_admin.ejs'));
    }
});

//User Auth
app.post('/auth', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if(username && password){
        connect.query('SELECT * FROM monkas.marlin_login WHERE username = ?  AND password = ?', [username, password], (error, results, fields) => {
            if (error){
                throw error;
            }

            if(results.length != 0){
                req.session.loggedin = true;
                req.session.adminloggedin = false;
                req.session.username = username;
                res.redirect('/home');
            }
            else{
                res.send("Invalid username or password. Try again.");
            }
            res.end();
        });
    }
    else{
        res.send("Please enter a username AND password");
        res.end();
    }
});

//Admin Auth
app.post('/admin_auth', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if(username && password) {
        connect.query('SELECT * FROM monkas.marlin_login WHERE username = ? AND password = ? AND is_admin = 1', [username, password], (error, results, fields) => {
            if(error) console.error(error);

            if(results.length != 0){
                req.session.adminloggedin = true;
                req.session.adminusername = username;
                res.redirect('/admin');
            }
            else{ 
                res.send("Invalid username or password. Or user is not admin.");
            }
        });
    } else {
        res.send("Please enter a username AND password");
    }
});

app.post('/add_data', (req, res) => {
    res.redirect('/home_add');
});

app.post('/admin', (req, res) => {
    res.redirect('/admin');
});

app.post('/admin_tools', (req, res) => {
    res.redirect('/admin_tools');
});

app.post('/logout', (req, res) => {
    res.redirect('/')
    req.session.destroy();
});

app.post('/user_create', (req, res) =>{
    var new_admin = 0;
    if(req.body.is_admin){
        new_admin = 1;
    }
    connect.query('INSERT INTO monkas.marlin_login (username, password, is_admin) VALUES (?, ?, ?)', [req.body.new_username, req.body.new_password, new_admin], (error, results, fields) => {
        if(error) console.error(error);
        console.log(`New user, ${req.body.new_username} created.`);
        res.redirect('/admin_tools');
    });
    
});

app.post('/add', (req, res) => {
    connect.query('INSERT INTO monkas.marlin_data (username, date, task_name, notes, start_time, end_time, total_time) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.session.username, req.body.date, req.body.taskname, req.body.notes, req.body.startTime, req.body.endTime, req.body.totalHours], (error, results, fields) => {
        if(error) console.error(error);
        console.log('Data Inserted');
        res.redirect('/home');
    }); 
});

app.listen(3000, () =>{ 
    console.log('up and running on port 3000');
});