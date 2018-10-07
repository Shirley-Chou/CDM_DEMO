const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const fse = require('fs-extra');
const Path = require('path');

const app = express();
app.use(bodyParser.json());

delete process.env['http_proxy'];
delete process.env['HTTP_PROXY'];
delete process.env['https_proxy'];
delete process.env['HTTPS_PROXY'];

let CONFIG = JSON.parse(fs.readFileSync("./config.json", "utf8"));

app.post('/sendImage', (req, res) => {
    let images = req.body.images;

    Promise.all(
        images.map((image) => {
            axios.get(`${CONFIG.host}/${image}`, {
                responseType: 'stream'
            }).then((response) => {
                // const path = Path.resolve(__dirname, 'images', image);
                const backPath = Path.resolve(__dirname, 'images_back', image);
                // response.data.pipe(fs.createWriteStream(path));
                response.data.pipe(fs.createWriteStream(backPath));
            })
        })
    ).then(() => {
        res.send('sendImage success');
        console.log('sendImage success')
    })
});

app.post('/restoreImage', async (req, res) => {
    let images = req.body.images;

    await fse.emptyDir(Path.resolve(__dirname, './images'));
    await images.forEach((image) => {
        fse.copy(Path.resolve(__dirname, `./images_back/${image}`), Path.resolve(__dirname, `./images/${image}`))
    })

    res.send('restoreImage success');
    console.log('restoreImage success');
});

app.post('/readDir', async (req, res) => {
    let imgData = await fs.readdirSync('images').map(file => file);
    if (imgData) {
        res.send({ img: imgData });
    } else {
        res.send({})
    }
});

app.listen(CONFIG.port, function () {
    console.log(`App listening on port ${this.address().port}!`);
});