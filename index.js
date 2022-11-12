const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '******',
    database: '*******',
    multipleStatements: true
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
        connect.query('SELECT *, SUM(total_time) FROM monkas.marlin_data GROUP BY username; SELECT * FROM monkas.marlin_data', (error, results, fields) => {
            if (error) console.error(error);

            res.render(path.join(__dirname + '/admin/admin_homepage.ejs'), {session_username:un, data_arr: JSON.stringify(results[0]), user_data: JSON.stringify(results[1])});
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

app.get('/get_info', (req, res) => {
    
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
    var taskname = req.body.taskname.replace(/(\r\n|\n|\r)/gm, ' ');
    var notes = req.body.notes.replace(/(\r\n|\n|\r)/gm, ' ');
    connect.query('INSERT INTO monkas.marlin_data (username, date, task_name, notes, start_time, end_time, total_time) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.session.username, req.body.date, taskname, notes, req.body.startTime, req.body.endTime, req.body.totalHours], (error, results, fields) => {
        if(error) console.error(error);
        console.log('Data Inserted');
        res.redirect('/home');
    }); 
});

app.post('/get_info', (req, res) => {
    if(!req.session.adminloggedin){
        res.redirect('/admin');
    } else {
        connect.query('SELECT * FROM monkas.marlin_data', (error, results, fields) => {
            res.json(results);
            console.log(results);
        });
    }
});

app.post('/del_entry', (req, res) => {
    if(!req.session.adminloggedin){
        res.redirect('/admin');
    } else {
        connect.query('DELETE FROM monkas.marlin_data WHERE username = ? AND date = ? AND task_name = ? AND notes = ? AND start_time = ? AND end_time = ? AND total_time = ?', [req.body.del_username, req.body.del_date, req.body.del_taskname, req.body.del_notes, req.body.del_starttime, req.body.del_endtime, req.body.del_totaltime], (error, results, fields) =>{
            if(error) console.error(error);
            res.redirect('/admin');
        });
    }
});

app.post('/edit_entry', (req, res) => {
    if(!req.session.adminloggedin){
        res.redirect('/admin');
    } else {
        console.log(req.body);
        connect.query('UPDATE monkas.marlin_data SET username = ?, date = ?, task_name = ?, notes = ?, start_time = ?, end_time = ?, total_time = ? WHERE username = ? AND date = ? AND start_time = ? AND end_time = ? AND total_time = ?', [req.body.edit_0, req.body.edit_1, req.body.edit_2.replace(/(\r\n|\n|\r)/gm, ' '), req.body.edit_3.replace(/(\r\n|\n|\r)/gm, ' '), req.body.edit_time_4, req.body.edit_time_5, req.body.total_time, req.body.old_0, req.body.old_1, req.body.old_4, req.body.old_5, req.body.old_6], (error, results, fields) => {
            if(error) console.error(error);
            res.redirect('/admin');
        });
    }
});

app.listen(3000, () =>{ 
    console.log('up and running on port 3000');
});
