const Service = {};

/*-----------------服务层-----------------*/
function initService() {
    // 新增
    Service.insert = function (url, options) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(options)
            }).then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    reject({ status: res.status })
                }
            }).then(data => resolve(data))
                .catch(error => {
                    console.log('Error:', error.message);
                    reject(error);
                })
        });
    };

    // 查询
    Service.find = function (url) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
            }).then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    reject({ status: res.status })
                }
            }).then(data => resolve(data))
                .catch(error => {
                    console.log('Error:', error.message);
                    reject(error);
                })
        });
    };

    // 执行操作
    Service.action = function (options) {
        return new Promise((resolve, reject) => {
            fetch('/cdm/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(options)
            }).then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    reject({ status: res.status })
                }
            }).then(data => resolve(data))
                .catch(error => {
                    console.log('Error:', error.message);
                    reject(error);
                })
        });
    };
}

init();

function init() {
    Service.find('/cdm/getPlan').then((data) => {
        if (data.length > 0) {
            let ploy_cloud = data[0].ployInfo.cloud;
            let ploy_local = data[0].ployInfo.local;
            let ploy_remote = data[0].ployInfo.remote;

            // 中英文替换
            CYCLETYPE.cloud = (ploy_cloud.cycleType == 'Hour' && '小时') || (ploy_cloud.cycleType == 'Day' && '天') || (ploy_cloud.cycleType == 'Week' && '周') || (ploy_cloud.cycleType == 'Month' && '月') || ploy_cloud.cycleType;

            CYCLETYPE.local = (ploy_local.cycleType == 'Second' && '秒钟') || (ploy_local.cycleType == 'Minute' && '分钟') || (ploy_local.cycleType == 'Hour' && '小时') || (ploy_local.cycleType == 'Day' && '天') || (ploy_local.cycleType == 'Week' && '周') || (ploy_local.cycleType == 'Month' && '月') || ploy_local.cycleType;

            CYCLETYPE.remote = (ploy_remote.cycleType == 'Minute' && '分钟') || (ploy_remote.cycleType == 'Hour' && '小时') || (ploy_remote.cycleType == 'Day' && '天') || (ploy_remote.cycleType == 'Week' && '周') || (ploy_remote.cycleType == 'Month' && '月') || ploy_remote.cycleType;

            autoExecute();
        } else {
            clearInterval(localInterval);
            clearInterval(remoteInterval);
            clearInterval(cloudInterval);
        }
    })
}

// 备份
function backup(type, pid) {
    Service.action({ Action: 'BackupBegin' });

    let random = (5 + Math.floor(Math.random() * 10 + 1)) * 1000;
    let cloudRandom = (30 + Math.floor(Math.random() * 10 + 1)) * 1000;
    let currentTime = new Date().getTime();
    let end_time;

    if (type == 'cloud') {
        end_time = currentTime + cloudRandom;
    } else {
        end_time = currentTime + random;
    }

    BACKUP = {
        pid: pid,
        createTime: currentTime,
        endTime: end_time,
        type: type,
    }

    Service.insert('/cdm/createBackup', BACKUP);
}

// 自动备份
let localInterval, remoteInterval, cloudInterval;
function autoExecute() {
    Service.find('/cdm/getPlan').then((data) => {
        if (data.length > 0) {
            let pid = data[0]._id;
            let ploy_cloudTime = data[0].ployInfo.cloud.cycleTime;
            let ploy_localTime = data[0].ployInfo.local.cycleTime;
            let ploy_remoteTime = data[0].ployInfo.remote.cycleTime;

            let s = 1000, m = 60 * 1000, h = 60 * 60 * 1000, d = 60 * 60 * 24 * 1000;

            let localExecuteTime = (CYCLETYPE.local == '秒钟' && (ploy_localTime * s)) || (CYCLETYPE.local == '分钟' && (ploy_localTime * m)) || (CYCLETYPE.local == "小时" && (ploy_localTime * h)) || (CYCLETYPE.local == "天" && (ploy_localTime * d));
            let remoteExecuteTime = (CYCLETYPE.remote == '分钟' && (ploy_remoteTime * m)) || (CYCLETYPE.remote == "小时" && (ploy_remoteTime * h)) || (CYCLETYPE.remote == "天" && (ploy_remoteTime * d));
            let cloudExecuteTime = (CYCLETYPE.cloud == '小时' && (ploy_cloudTime * h)) || (CYCLETYPE.cloud == "天" && (ploy_cloudTime * d));

            localInterval = setInterval(function () {
                backup('local', pid);
            }, localExecuteTime);

            remoteInterval = setInterval(function () {
                backup('remote', pid);
            }, remoteExecuteTime);

            cloudInterval = setInterval(function () {
                backup('cloud', pid);
            }, cloudExecuteTime);
        }
    })
}