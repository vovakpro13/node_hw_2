const exphbs = require('express-handlebars');
const express = require('express');
const path = require('path');
const fs = require('fs');

const users = path.join(__dirname, 'users.json');

const app = express();

app.set('view engine', '.hbs');
app.engine('.hbs', exphbs({defaultLayout: false}));
app.set('views', path.join(__dirname, 'public'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/', ((req, res) => {
    res.render('home');
}));

app.get('/login', ((req, res) => {
    res.render('login', {title: 'Login Form'});
}));

app.post('/user', async (req, res) => {
    const {login, password} = req.body;

    const users = await getUsers();
    const user = users.find(user => (user.login === login) && (user.password = password));

    if (!user) {
        res.render('error', {
            error: 'User was not founded. Check your login and password',
            url: '/login',
            refText: 'Back'
        });
    }

    res.render('user', {user})
    return true;

});

app.get('/register', ((req, res) => {
    res.render('register', {title: 'Register form'});
}));

app.post('/register', async (req, res) => {
    const {name, city, login, password, passwordAgain} = req.body;

    if (!login && !password) {
        res.render('error', {
            error: 'Enter login and password',
            url: '/register',
            refText: 'Back to registration'
        });
        return false;
    }

    if (password !== passwordAgain) {
        res.render('error', {
            error: 'The password is not equal second password',
            url: '/register',
            refText: 'Back to registration'
        });
        return false;
    }

    const allUsers = await getUsers();

    if (allUsers.find((user => user.login === login))) {
        res.render('error', {
            error: 'User with this login already exist',
            url: '/register',
            refText: 'Back to registration'
        });
        return false;
    }

    allUsers.push({name, city, login, password});
    fs.writeFile(users, JSON.stringify(allUsers), err => console.log(err));

    res.redirect('/login');
});

app.get('/users', async (req, res) => {
    const users = await getUsers();
    res.render('users', {users});
});


app.listen(3000, () => {
    console.log('App start on 3000');
});


async function getUsers() {
    return new Promise(((resolve, reject) => {
        fs.readFile(users, (err, usersJSON) => {
            resolve(JSON.parse(usersJSON));
        });
    }));
}

