const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

const fs = require('fs');
const path = require('path');
const path_tasks = path.join(__dirname, 'data/tasks.json');
const path_completeTasks = path.join(__dirname, 'data/completeTask.json');

const log = require('./routes/middleware/log');
const auth = require('./routes/middleware/auth');

const loginRouter = require('./routes/api/login');
const logoutRouter = require('./routes/api/logout');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(log);

app.use('/api', loginRouter);
app.use('/api', logoutRouter);

app.use(auth);

app.post('/addtask', (req, res) => {
    let newTask = req.body.newtask;
    let tasks = getTasks(req.user.id);

    tasks.push(newTask);
    rewriteJsonTasks(req.user.id, tasks);

    res.redirect("/");
});

app.post("/completetask", function (req, res) {
    let completeTask = req.body.check;
    let tasks = getTasks(req.user.id);
    let completedTasks = getCompletedTasks(req.user.id);
    if (typeof completeTask === "string") {
        completedTasks.push(completeTask);
        rewriteJsonCompletedTasks(req.user.id, completedTasks);

        tasks.splice(tasks.indexOf(completeTask), 1);
        rewriteJsonTasks(req.user.id, tasks);
    } else if (typeof completeTask === "object") {
        for (let i = 0; i < completeTask.length; i++) {
            completedTasks.push(completeTask[i]);
            rewriteJsonCompletedTasks(req.user.id, completedTasks);

            tasks.splice(tasks.indexOf(completeTask[i]), 1);
            rewriteJsonTasks(req.user.id, tasks);
        }
    }
    res.redirect("/");
});

app.get('/delete/:id', function (req, res) {
    let deleteTaskId = req.params.id;
    let tasks = getTasks(req.user.id);

    if (deleteTaskId != '') {
        tasks.splice(req.params.id, 1);
        rewriteJsonTasks(req.user.id, tasks);
    }
    res.redirect('/');
})

app.post('/uncheck', function (req, res) {
    let uncheckTask = req.body.uncheck;

    let tasks = getTasks(req.user.id);
    let completedTasks = getCompletedTasks(req.user.id);

    if (typeof uncheckTask === 'string') {
        tasks.push(uncheckTask);
        rewriteJsonTasks(req.user.id, tasks);

        completedTasks.splice(completedTasks.indexOf(uncheckTask), 1);
        rewriteJsonCompletedTasks(req.user.id, completedTasks);
    } else if (typeof uncheckTask === 'object') {
        for (let i = 0; i < uncheckTask.length; i++) {
            tasks.push(uncheckTask[i]);
            rewriteJsonTasks(req.user.id, tasks);

            completedTasks.splice(completedTasks.indexOf(uncheckTask[i]), 1);
            rewriteJsonCompletedTasks(req.user.id, completedTasks);
        }
    }
    res.redirect('/');
})

app.get('/', (req, res) => {
    if (req.user) { console.log(getTasks(req.user.id)) }
    res.render('index', {
        user: req.user,
        tasks: req.user ? getTasks(req.user.id) : [],
        completedTasks: req.user ? getCompletedTasks(req.user.id) : []
    });
});

app.listen(8000, function () {
    console.log("server is running on port 8000");
});

const getCompletedTasks = (id) => {
    let completedTasks = [];
    if (fs.existsSync(path_completeTasks)) {
        const requestInfoFile = fs.readFileSync(path_completeTasks, 'utf8');
        if (requestInfoFile.length) {
            completedTasks = JSON.parse(requestInfoFile).find(t => t.id === id).completedTasks;
            if (!completedTasks) {
                return [];
            }
            return completedTasks;
        }
    }
}

const getTasks = (id) => {
    let tasks = [];
    if (fs.existsSync(path_tasks)) {
        const requestInfoFile = fs.readFileSync(path_tasks, 'utf8');
        if (requestInfoFile.length) {
            tasks = JSON.parse(requestInfoFile).find(t => t.id === id).tasks;
            if (!tasks) {
                return [];
            }
            return tasks;
        }
    }
}

const rewriteJsonTasks = (id, tasks) => {
    let json = {};
    if (fs.existsSync(path_tasks)) {
        const requestInfoFile = fs.readFileSync(path_tasks, 'utf8');
        if (requestInfoFile.length) {
            json = JSON.parse(requestInfoFile);
        }
    }

    json[json.findIndex(t => t.id === id)].tasks = tasks;
    json = JSON.stringify(json, null, 4);
    fs.writeFileSync(path_tasks, json, 'utf8');
}

const rewriteJsonCompletedTasks = (id, completedTasks) => {
    let json = {};
    if (fs.existsSync(path_completeTasks)) {
        const requestInfoFile = fs.readFileSync(path_completeTasks, 'utf8');
        if (requestInfoFile.length) {
            json = JSON.parse(requestInfoFile);
        }
    }

    json[json.findIndex(t => t.id === id)].completedTasks = completedTasks;
    json = JSON.stringify(json, null, 4);
    fs.writeFileSync(path_completeTasks, json, 'utf8');
}