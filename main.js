// THIS CODE IS MY OWN WORK, IT WAS WRITTEN WITHOUT CONSULTING CODE WRITTEN BY OTHER STUDENTS OR COPIED FROM ONLINE RESOURCES.
// Zia Dawood
const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static(__dirname));

// serve index.html
app.get('/', (req, res) => {
    console.log("root: " + req.url);
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

app.use(express.json()); // NECESSARY!!!!!!!

const fs = require('fs');

// create a new csv file when the fetch request is sent
app.post('/newcsv', (req, res) => {
    fs.writeFileSync("./data/" + req.body.testid + ".csv", "test number,original,remake,time,errors,tool\r\n", { flag: 'a+' }, err => {} );
});

// write the trial to a csv line
app.post('/trial', (req, res) => {
    fs.writeFile("./data/" + req.body.testid + ".csv", "" + req.body.testcount + ","+ req.body.orig + "," + req.body.re + ", " + req.body.time + ","+ req.body.err + "," + req.body.to + "\r\n", { flag: 'a+' }, err => {console.log(err)} );
});