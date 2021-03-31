const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const bf = require('bruteforce');
const { performance } = require('perf_hooks');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('assets'));
app.set('view engine', 'ejs');

let crackedPassword = '';
let userPassword = '';
let counter = 0;

app.get('/', (req, res) => {
    res.render('index');
})

app.post('/check', async (req, res) => {
    userPassword = req.body.password
    let starting = performance.now()
    let checkCommonPasswordsRes = await checkCommon(userPassword)
    if (checkCommonPasswordsRes[0] === false) {
        await force(userPassword, checkCommonPasswordsRes[1]);
    } else {
        crackedPassword = checkCommonPasswordsRes;
    }
    let ending = performance.now()
    const timeOfEx = (ending - starting) / 1000 + " seconds.";
    res.render('result', {
        timeOfEx,
        tries: counter,
        password: crackedPassword,
    });
})

app.listen(process.env.PORT || 3000, () => {
    console.log('listening on port 3000');

});

async function checkCommon(userPassword) {
    let commonFile = '';
    commonFile = await readFile();
    let promise = new Promise((resolve, reject) => {
        try {
            commonFile.toString().split('\n').forEach(line => {
                if (userPassword.trim() === line.trim()) {
                    resolve([line, counter])
                }
                counter++;
            });
            resolve([false, counter])

        } catch (e) {
            reject(e);
        }
    });
    return promise;
}

async function force(password) {


    let promise = new Promise((resolve, reject) => {
        try {
            let AllChars = [];
            for (let i = 32; i < 127; i++) {
                AllChars.push(String.fromCharCode(i));
            }
            bf({
                len: password.length,
                chars: AllChars,
                step: checkPassword
            });

            resolve(crackedPassword)
        } catch (e) {
            reject(e);
        }
    });
    return promise;
}

async function readFile() {
    return fs.readFileSync('10_million_password_list_top_1M.txt');
}

function checkPassword(guess) {
    if (guess === userPassword) {
        crackedPassword = guess
    } else {
        counter++
    }
}