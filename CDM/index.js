const express = require('express');
const bodyParser = require('body-parser');
const dataStore = require('nedb-promise');
const fs = require('fs');
const fse = require('fs-extra');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const net = require('net');

// database
const db_plan = new dataStore({ filename: 'db/plan', autoload: true }); // 保护计划
const db_backup = new dataStore({ filename: 'db/backup', autoload: true }); // 备份
const db_restore = new dataStore({ filename: 'db/restore', autoload: true }); // 恢复

// bypass proxy
delete process.env['http_proxy'];
delete process.env['HTTP_PROXY'];
delete process.env['https_proxy'];
delete process.env['HTTPS_PROXY'];

const app = express();
app.use(express.static('public'));
app.use(express.static('images_back'));
app.use(bodyParser.json());

let CONFIG = JSON.parse(fs.readFileSync("./config.json", "utf8"));

// 上传图片
const imgPath = path.resolve(__dirname, 'images');
const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imgPath); // 保存的路径，备注：需要自己创建
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // 将保存文件名设置为字段名
    }
})
const uploadMulter = multer({ storage: uploadStorage }); // 通过 storage 选项来对上传行为进行定制化

app.post('/cdm/uploadImg', uploadMulter.single('avatar'), (req, res) => {
    res.send({
        code: '0000',
        type: 'single',
        originalname: req.file.originalname
    });
})

// 复制到本机及ECS全量文件夹
app.post('/cdm/backupImg', async (req, res, next) => {
    let image = req.body.filename;
    let imgPath = path.resolve(__dirname, `./images/${image}`);
    let imgBackPath = path.resolve(__dirname, `./images_back/${image}`);

    if (image && imgPath) {
        await fse.copy(imgPath, imgBackPath);
        await axios.post(`${CONFIG.ECSHOST}/sendImage`, { images: [image] });
        res.send({ msg: 'success' })
    } else {
        res.send({ msg: '找不到该图片' })
        console.log('找不到该图片')
    }
})
// Error Handler
app.use(function (err, req, res, next) {
    console.error('Error:', err);
    res.status(500).send('Service Error');
});

// 保护计划
app.post('/cdm/createPlan', async (req, res) => {
    let docs = {
        name: req.body.name,
        status: req.body.status,
        ploy: req.body.ploy,
        ployInfo: req.body.ployInfo,
        site: req.body.site,
        dataType: req.body.dataType,
        protectObject: req.body.protectObject,
        rpo: req.body.rpo,
        success: req.body.success,
        fail: req.body.fail,
        executeTime: req.body.executeTime
    }
    let planData = await db_plan.insert(docs);
    res.send(planData);
})
app.delete('/cdm/deletePlan', async (req, res) => {
    // 删除保护计划，同时删除备份、恢复、执行记录数据
    await Promise.all([
        db_plan.remove({}, { multi: true }),
        db_backup.remove({}, { multi: true }),
        db_restore.remove({}, { multi: true })
    ])
    res.send({});
})
app.get('/cdm/getPlan', async (req, res) => {
    let planData = await db_plan.find({});
    res.send(planData);
})
app.post('/cdm/uploadPlan', async (req, res) => {
    await db_plan.update({ _id: req.body.id }, { $set: { executeTime: req.body.executeTime } }, { multi: true });
    let planData = await db_plan.find({});
    res.send(planData);
})

// 备份副本
app.post('/cdm/createBackup', async (req, res) => {
    let imgs = req.body.imgs ? req.body.imgs : fs.readdirSync('images').map(file => file);

    let docs = {
        pid: req.body.pid,
        type: req.body.type,
        createTime: req.body.createTime,
        endTime: req.body.endTime,
        executeTime: req.body.endTime - req.body.createTime,
        imgs: imgs
    }

    let backupData = await db_backup.insert(docs);

    res.send(backupData);
})
app.delete('/cdm/deleteBackup', async (req, res) => {
    await db_backup.remove(req.body.type ? { type: req.body.type } : {}, { multi: true });
    res.send({});
})
app.get('/cdm/getBackup', async (req, res) => {
    let pid = req.query.pid;
    let type = req.query.type;
    let data = await db_backup.find(type ? { pid: pid, type: type, } : { pid: pid });
    let backupData = await data.sort((a, b) => b.createTime - a.createTime);

    res.send({ data: backupData });
})
app.get('/cdm/sortBackup', async (req, res) => {
    let backupData = await db_backup.find({ type: req.query.type })
    let num = parseInt(req.query.num);
    let sortBackupData = await backupData.sort((a, b) => b.createTime - a.createTime).slice(0, num);

    res.send(sortBackupData);
})
app.get('/cdm/filterBackup', async (req, res) => {
    let pid = req.query.pid;
    let localDB = await db_backup.find({ pid: pid, type: 'local' }),
        localData = await localDB.sort((a, b) => b.createTime - a.createTime);
    let remoteDB = await db_backup.find({ pid: pid, type: 'remote' }),
        remoteData = await remoteDB.sort((a, b) => b.createTime - a.createTime);
    let cloudDB = await db_backup.find({ pid: pid, type: 'cloud' }),
        cloudData = await cloudDB.sort((a, b) => b.createTime - a.createTime);

    let allData = [];

    let local = await localData.filter((data, index) => {
        if (index < req.query.local) {
            return data;
        }
    })
    let remote = await remoteData.filter((data, index) => {
        if (index < req.query.remote) {
            return data;
        }
    })
    let cloud = await cloudData.filter((data, index) => {
        if (index < req.query.cloud) {
            return data;
        }
    })

    await Promise.all([
        local.forEach((data) => {
            allData.push(data)
        }),
        remote.forEach((data) => {
            allData.push(data)
        }),
        cloud.forEach((data) => {
            allData.push(data)
        })
    ])

    let listData = await allData.sort((a, b) => b.createTime - a.createTime);
    res.send({ data: listData });
})

// 执行恢复
app.post('/cdm/createRestore', async (req, res) => {
    let images = req.body.imgs;
    let docs = {
        name: req.body.name,
        status: req.body.status,
        use: req.body.use,
        site: req.body.site,
        dataType: req.body.dataType,
        createTime: req.body.createTime,
        plan: req.body.plan,
        backupType: req.body.backupType,
        backupCreateTime: req.body.backupCreateTime
    }

    let restoreData = await db_restore.insert(docs);

    if (req.body.type == 'cloud') {
        await axios.post(`${CONFIG.ECSHOST}/restoreImage`, { images: images })
    } else {
        await fse.emptyDir(path.resolve(__dirname, './images'));
        images.forEach((image) => {
            fse.copy(path.resolve(__dirname, `./images_back/${image}`), path.resolve(__dirname, `./images/${image}`));
        });
    }

    res.send(restoreData);
})
app.delete('/cdm/deleteRestore', async (req, res) => {
    await db_restore.remove(req.body.id ? { _id: req.body.id } : {}, { multi: true });
    res.send({});
})
app.get('/cdm/getRestore', async (req, res) => {
    let data = await db_restore.find(req.body.id ? { id: req.body.id } : {});
    let restoreData = await data.sort((a, b) => b.createTime - a.createTime);
    res.send({ data: restoreData });
});
app.post('/cdm/uploadRestore', async (req, res) => {
    await db_restore.update({ _id: req.body.id }, { $set: { status: req.body.status } }, { multi: true });
    let data = await db_restore.find({});
    let restoreData = await data.sort((a, b) => b.createTime - a.createTime);
    res.send(restoreData);
})

// 读取文件夹
app.post('/cdm/readDir', async (req, res) => {
    if (req.body.type == 'cloud') {
        let data = await axios.post(`${CONFIG.ECSHOST}/readDir`);
        let imgData = data.data.img;
        if (imgData) {
            res.send({ img: imgData });
        } else {
            res.send({});
        }
    } else {
        let imgData = await fs.readdirSync('images').map(file => file);
        if (imgData) {
            res.send({ img: imgData });
        } else {
            res.send({});
        }
    }
})

// socket
const socketClient = new net.Socket();
//创建socket客户端
socketClient.setEncoding('binary');

//连接到服务端
socketClient.connect(CONFIG.socketPort, CONFIG.socketHost, function () {
    //向端口写入数据到达服务端
    // socketClient.write('hello server'); 
});
// socketClient.on('data', function (data) {
//     console.log('from server:' + data);
//     //得到服务端返回来的数据
// });
// socketClient.on('error', function (error) {
//     //错误出现之后关闭连接
//     console.log('error:' + error);
//     socketClient.destory();
// });
// socketClient.on('close', function () {
//     //正常关闭连接
//     console.log('Connection closed');
// });

app.post('/cdm/action', (req, res) => {
    socketClient.write("PhotoHandle:Action=" + req.body.Action + "|");
    res.send({});
})

app.listen(CONFIG.port, function () {
    console.log(`App listening on port ${this.address().port}!`);
});