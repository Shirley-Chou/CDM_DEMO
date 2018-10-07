let PLAN = {
    name: '',
    status: '正常',
    ploy: '',
    ployInfo: {},
    site: '',
    dataType: '',
    protectObject: 1,
    rpo: '100%',
    success: 0,
    fail: 0,
    executeTime: '--'
}
let PLOY = {
    cloud: {
        site: '',
        bucket: '',
        cycleType: '',
        cycleTime: '',
        copyNum: 0,
    },
    local: {
        cycleType: '',
        cycleTime: '',
        copyNum: 0,
    },
    remote: {
        cycleType: '',
        cycleTime: '',
        copyNum: 0,
    }
}
let BACKUP = {
    pid: 'pid',
    type: '',
    createTime: 0,
    endTime: 0,
    executeTime: '--',
}
let CYCLETYPE = {
    cloud: '',
    local: '',
    remote: ''
}
let COPYNUM = {
    cloud: '',
    local: '',
    remote: ''
}
let EXECUTETIME = '--';
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

    // 删除
    Service.delete = function (url, options) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'DELETE',
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
    initService();
    findPlan();

    $('#base').show();

    // 创建保护计划按钮
    $('#u3180').on('click touchend', function () {
        Service.find('/cdm/getPlan').then((data) => {
            if (data.length > 0) {
                $('.filesystem-table,#u3803').css('display', 'none');
                $('.filesystem-empty,.hasplan').css('display', 'block');
                $('#u3727_input,#u3733_input').attr("checked", false);
            } else {
                $('.filesystem-table,#u3803').css('display', 'block');
                $('.filesystem-empty,.hasplan').css('display', 'none');
            }
        })
    })

    // 创建保护计划
    $('#u4013').on('click touchend', function () {
        PLAN.name = $('#u3967_input').val();
        PLAN.ploy = $('#u3980 span').text();
        PLAN.site = $('#u3976 p').eq(1).children('span').text();
        PLAN.dataType = $('#u3976 p').eq(0).children('span').text();
        PLAN.ployInfo = PLOY;

        Service.insert('/cdm/createPlan', PLAN).then(() => {
            findPlan();
        })
    })

    // 删除保护计划
    $('#u3252').on('click touchend', function () {
        Service.delete('/cdm/deletePlan').then(() => {
            $('#u3354 span').text(`All (0)`);
            $('#u3360 span').text(`Local (0)`);
            $('#u3362 span').text(`Remote (0)`);
            $('#u3364 span').text(`Cloud (0)`);
            $('#u3383_div').removeClass('select');
            findPlan();
        })

        clearInterval(localInterval);
        clearInterval(remoteInterval);
        clearInterval(cloudInterval);
    })

    // 设置保护策略
    $('#u3845').on('click touchend', function () {
        // cloud
        PLOY.cloud.site = $('#u3888_input').find('option:selected').text();
        PLOY.cloud.bucket = $('#u3891_input').find('option:selected').text();
        PLOY.cloud.cycleType = $('#u3892_input').find('option:selected').text();
        PLOY.cloud.cycleTime = $('#u3899_input').val();
        PLOY.cloud.copyNum = $('#u3902_input').val();

        // local
        PLOY.local.cycleType = $('#u3903_input').find('option:selected').text();
        PLOY.local.cycleTime = PLOY.local.cycleType == 'Second' ? $('#u3909_input').find('option:selected').text() : $('#u3914_input').val();
        PLOY.local.copyNum = $('#u3919_input').val();

        // remote
        PLOY.remote.cycleType = $('#u3925_input').find('option:selected').text();
        PLOY.remote.cycleTime = $('#u3930_input').val();
        PLOY.remote.copyNum = $('#u3924_input').val();

        // show
        $('#u3992 p').eq(0).children('span').text(PLOY.cloud.site);
        $('#u3992 p').eq(1).children('span').text(PLOY.cloud.bucket);
        $('#u3992 p').eq(2).children('span').text(`Every ${PLOY.cloud.cycleTime} ${PLOY.cloud.cycleType}`);
        $('#u3992 p').eq(3).children('span').text(`${PLOY.cloud.copyNum}`);

        $('#u3984 p').eq(0).children('span').text(`Every ${PLOY.local.cycleTime} ${PLOY.local.cycleType}`);
        $('#u3984 p').eq(1).children('span').text(`${PLOY.local.copyNum}`);

        $('#u4008 p').eq(0).children('span').text(`Every ${PLOY.remote.cycleTime} ${PLOY.remote.cycleType}`);
        $('#u4008 p').eq(1).children('span').text(`${PLOY.remote.copyNum}`);
    })

    // 查看保护策略
    $('#u3410').on('click touchend', function () {
        Service.find('/cdm/getPlan').then((data) => {
            let ploy_cloud = data[0].ployInfo.cloud;
            let ploy_local = data[0].ployInfo.local;
            let ploy_remote = data[0].ployInfo.remote;

            if (ploy_cloud.site == '华为云 | 华东-上海二') {
                ploy_cloud.site = 'Huawei Cloud | CN East-Shanghai2'
            }

            $('#u3444 p').eq(0).children('span').text(ploy_cloud.site);
            $('#u3444 p').eq(1).children('span').text(ploy_cloud.bucket);
            $('#u3444 p').eq(2).children('span').text(`Every ${ploy_cloud.cycleTime} ${CYCLETYPE.cloud}`);
            $('#u3444 p').eq(3).children('span').text(`${ploy_cloud.copyNum}`);

            $('#u3436 p').eq(0).children('span').text(`Every ${ploy_local.cycleTime} ${CYCLETYPE.local}`);
            $('#u3436 p').eq(1).children('span').text(`${ploy_local.copyNum}`);

            $('#u3448 p').eq(0).children('span').text(`Every ${ploy_remote.cycleTime} ${CYCLETYPE.remote}`);
            $('#u3448 p').eq(1).children('span').text(`${ploy_remote.copyNum}`);
        })
    })

    // tabel数据选中状态，显示拓扑图
    $('#u3383_div, #u3397, #u3388, #u3387, #u3411, #u3391, #u3393, #u3409, #u3395, #u3404, #u3401, #u3402, #u3407, #u3413, #u3414, #u3417').mouseover(function () {
        $('#u3383_div').addClass('mouseover');
    }).mouseout(function () {
        $('#u3383_div').removeClass('mouseover')
    }).on('click touchend', function () {
        $('#u3383_div').addClass('select');
        $('#u4154,.backbups-tab-title,#u3266').show();
        $('.topology-empty,.backup-empty').hide();
    })

    // 本地备份
    $('#u3208').on('click touchend', function () {
        $('#u3387 span').text('In backup');
        $('#u3388_img').attr('src', '/cdm/image/icon/creating.svg');

        backup('local');
    })

    // 异地备份
    $('#u3226').on('click touchend', function () {
        $('#u3387 span').text('In backup');
        $('#u3388_img').attr('src', '/cdm/image/icon/creating.svg');

        backup('remote');
    })

    // 云备份
    $('#u3242').on('click touchend', function () {
        $('#u3387 span').text('In backup');
        $('#u3388_img').attr('src', '/cdm/image/icon/creating.svg');

        backup('cloud');
    })

    // 查看执行计划
    $('#u3400').on('click touchend', function () {
        executeTable.ajax.reload(null, false);
    })
    $('#u3406').on('click touchend', function () {
        executeTable.ajax.url(`/cdm/getBackup?pid=0`).load();
    })
}

// 查询保护计划
function findPlan() {
    Service.find('/cdm/getPlan').then((data) => {
        if (data.length > 0) {
            // 更新保存计划表格数据
            if (data[0].status == '正常') {
                data[0].status = 'Normal';
            }

            $('#planid').text(data[0]._id);
            $('#u3397 span').text(data[0].name);
            $('#u3387 span').text(data[0].status);
            $('#u3407 span').text(data[0].fail);
            $('#u3401 span').text(data[0].success);

            // 执行统计次数
            Service.find(`/cdm/getBackup?pid=${data[0]._id}`).then((data) => {
                data.data.length > 0 && $('#u3401 span').text(data.data.length);
            })

            // 上次执行时间
            EXECUTETIME = data[0].executeTime == '--' ? data[0].executeTime : formartExecuteTime(data[0].executeTime);

            let ploy_cloud = data[0].ployInfo.cloud;
            let ploy_local = data[0].ployInfo.local;
            let ploy_remote = data[0].ployInfo.remote;

            // 中英文替换
            CYCLETYPE.cloud = (ploy_cloud.cycleType == '小时' && 'Hour') || (ploy_cloud.cycleType == '天' && 'Day') || (ploy_cloud.cycleType == '周' && 'Week') || (ploy_cloud.cycleType == '月' && 'Month') || ploy_cloud.cycleType;

            CYCLETYPE.local = (ploy_local.cycleType == '秒钟' && 'Second') || (ploy_local.cycleType == '分钟' && 'Minute') || (ploy_local.cycleType == '小时' && 'Hour') || (ploy_local.cycleType == '天' && 'Day') || (ploy_local.cycleType == '周' && 'Week') || (ploy_local.cycleType == '月' && 'Month') || ploy_local.cycleType;

            CYCLETYPE.remote = (ploy_remote.cycleType == '分钟' && 'Minute') || (ploy_remote.cycleType == '小时' && 'Hour') || (ploy_remote.cycleType == '天' && 'Day') || (ploy_remote.cycleType == '周' && 'Week') || (ploy_remote.cycleType == '月' && 'Month') || ploy_remote.cycleType;

            COPYNUM.cloud = parseInt(ploy_cloud.copyNum);
            COPYNUM.local = parseInt(ploy_local.copyNum);
            COPYNUM.remote = parseInt(ploy_remote.copyNum);

            $('.plan-table-empty').css('display', 'none');
            $('.plan-table-tbody').css('display', 'block');

            initDataTable(data[0]._id);
            createCopyList(data[0]._id);
            autoExecute();
        } else {
            $('.plan-table-empty,.topology-empty,.backup-empty').css('display', 'block');
            $('.plan-table-tbody,.backbups-tab-title,#u3266,#u4154').css('display', 'none');
        }
    })
}

function cloudCycleType() {
    let selectedVal = $('#u3892_input').find('option:selected').text();
    let showInfo = (selectedVal == 'Hour' && 'Hour Execute') || (selectedVal == 'Day' && 'Day Execute') || (selectedVal == 'Week' && 'Week Execute') || (selectedVal == 'Month' && 'Month Execute')

    $('#u3896 span').text(showInfo);
}
function localCycleType() {
    let selectedVal = $('#u3903_input').find('option:selected').text();
    let showInfo = (selectedVal == 'Second' && 'Second Execute') || (selectedVal == 'Minute' && 'Minute Execute') || (selectedVal == 'Hour' && 'Hour Execute') || (selectedVal == 'Day' && 'Day Execute') || (selectedVal == 'Week' && 'Week Execute') || (selectedVal == 'Month' && 'Month Execute')

    $('#u3913 span').text(showInfo);
}
function remoteCycleType() {
    let selectedVal = $('#u3925_input').find('option:selected').text();
    let showInfo = (selectedVal == 'Minute' && 'Minute Execute') || (selectedVal == 'Hour' && 'Hour Execute') || (selectedVal == 'Day' && 'Day Execute') || (selectedVal == 'Week' && 'Week Execute') || (selectedVal == 'Month' && 'Month Execute')

    $('#u3929 span').text(showInfo);
}

// 备份
function backup(type) {
    Service.action({ Action: 'BackupBegin' });

    let pid = $('#planid').text();
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

    Service.insert('/cdm/createBackup', BACKUP).then((data) => {
        EXECUTETIME = formartExecuteTime(data.executeTime);
        let checkTime = parseFloat(EXECUTETIME) * 1000;

        Service.find(`/cdm/getBackup?pid=${pid}`).then((data) => {
            if (data.data.length > 0) {
                setTimeout(function () {
                    Service.action({ Action: 'BackupEnd' });

                    $('#u3387 span').text('Succeeded');
                    $('#u3388_img').attr('src', '/cdm/image/icon/success.svg');
                    $('#u3401 span').text(data.data.length);

                    if (type == 'local') {
                        createLocalList(pid);
                    } else if (type == 'remote') {
                        createRemoteList(pid);
                    } else if (type == 'cloud') {
                        createCloudList(pid);
                    }
                }, checkTime);
            }
        })
    })
}

// 自动备份
let localInterval, remoteInterval, cloudInterval;
function autoExecute() {
    Service.find('/cdm/getPlan').then((data) => {
        if (data.length > 0) {
            let ploy_cloudTime = data[0].ployInfo.cloud.cycleTime;
            let ploy_localTime = data[0].ployInfo.local.cycleTime;
            let ploy_remoteTime = data[0].ployInfo.remote.cycleTime;

            let s = 1000, m = 60 * 1000, h = 60 * 60 * 1000, d = 60 * 60 * 24 * 1000;

            let localExecuteTime = (CYCLETYPE.local == 'Second' && (ploy_localTime * s)) || (CYCLETYPE.local == 'Minute' && (ploy_localTime * m)) || (CYCLETYPE.local == "Hour" && (ploy_localTime * h)) || (CYCLETYPE.local == "Day" && (ploy_localTime * d));
            let remoteExecuteTime = (CYCLETYPE.remote == 'Minute' && (ploy_remoteTime * m)) || (CYCLETYPE.remote == "Hour" && (ploy_remoteTime * h)) || (CYCLETYPE.remote == "Day" && (ploy_remoteTime * d));
            let cloudExecuteTime = (CYCLETYPE.cloud == 'Hour' && (ploy_cloudTime * h)) || (CYCLETYPE.cloud == "Day" && (ploy_cloudTime * d));

            localInterval = setInterval(function () {
                $('#u880 span').text('In backup');
                $('#u881_img').attr('src', '/cdm/image/icon/creating.svg');

                backup('local');
            }, localExecuteTime);

            remoteInterval = setInterval(function () {
                $('#u880 span').text('In backup');
                $('#u881_img').attr('src', '/cdm/image/icon/creating.svg');

                backup('remote');
            }, remoteExecuteTime);

            cloudInterval = setInterval(function () {
                $('#u880 span').text('In backup');
                $('#u881_img').attr('src', '/cdm/image/icon/creating.svg');

                backup('cloud');
            }, cloudExecuteTime);
        }
    })
}


// 生成副本list
function createCopyList(id) {
    $('#backupAll,#backupLocal,#backupRemote,#backupCloud').empty();

    let pid = $('#planid').text() ? $('#planid').text() : id;

    Service.find(`/cdm/filterBackup?pid=${pid}&cloud=${COPYNUM.cloud}&local=${COPYNUM.local}&remote=${COPYNUM.remote}`).then((data) => {
        let backupData = data.data;

        if (backupData.length) {
            $('#u3354 span').text(`All(${backupData.length})`);

            let backup_data = '';
            backupData.forEach((backup) => {
                backup_data += `<li class="backups-item ${backup.type == 'cloud' && 'backups-cloud' || 'backups-local'}">
                                    <time>${timetrans(backup.createTime) + ' UTC+08:00'}</time>
                                    <span>${(backup.type == 'local' && 'Production Site') || (backup.type == 'remote' && 'Disaster Recovery Site') || (backup.type == 'cloud' && 'Huawei Cloud | CN East Shanghai-2')}</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupAll').append(backup_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=local&num=${COPYNUM.local}`).then((data) => {
        let localData = data;
        if (localData.length) {
            $('#u3360 span').text(`Local(${localData.length})`);

            let local_data = '';
            localData.forEach((local) => {
                local_data += `<li class="backups-item ${local.type == 'local' && 'backups-local'}">
                                    <time>${timetrans(local.createTime) + ' UTC+08:00'}</time>
                                    <span>Production Site</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupLocal').append(local_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=remote&num=${COPYNUM.remote}`).then((data) => {
        let remoteData = data;
        if (remoteData.length) {
            $('#u3362 span').text(`Remote(${remoteData.length})`);

            let remote_data = '';
            remoteData.forEach((remote) => {
                remote_data += `<li class="backups-item ${remote.type == 'remote' && 'backups-local'}">
                                    <time>${timetrans(remote.createTime) + ' UTC+08:00'}</time>
                                    <span>Disaster Recovery Site</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupRemote').append(remote_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=cloud&num=${COPYNUM.cloud}`).then((data) => {
        let cloudData = data;
        if (cloudData.length) {
            $('#u3364 span').text(`Cloud(${cloudData.length})`);

            let cloud_data = '';
            cloudData.forEach((cloud) => {
                cloud_data += `<li class="backups-item ${cloud.type == 'cloud' && 'backups-cloud'}">
                                    <time>${timetrans(cloud.createTime) + ' UTC+08:00'}</time>
                                    <span>Huawei Cloud | CN East Shanghai-2</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupCloud').append(cloud_data);
        }
    })
}
function createLocalList(id) {
    $('#backupAll,#backupLocal').empty();

    let pid = $('#planid').text() ? $('#planid').text() : id;

    Service.find(`/cdm/filterBackup?pid=${pid}&cloud=${COPYNUM.cloud}&local=${COPYNUM.local}&remote=${COPYNUM.remote}`).then((data) => {
        let backupData = data.data;

        if (backupData.length) {
            $('#u3354 span').text(`All(${backupData.length})`);

            let backup_data = '';
            backupData.forEach((backup) => {
                backup_data += `<li class="backups-item ${backup.type == 'cloud' && 'backups-cloud' || 'backups-local'}">
                                    <time>${timetrans(backup.createTime) + ' UTC+08:00'}</time>
                                    <span>${(backup.type == 'local' && 'Production Site') || (backup.type == 'remote' && 'Disaster Recovery Site') || (backup.type == 'cloud' && 'Huawei Cloud | CN East Shanghai-2')}</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupAll').append(backup_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=local&num=${COPYNUM.local}`).then((data) => {
        let localData = data;
        if (localData.length) {
            $('#u3360 span').text(`Local(${localData.length})`);

            let local_data = '';
            localData.forEach((local) => {
                local_data += `<li class="backups-item ${local.type == 'local' && 'backups-local'}">
                                    <time>${timetrans(local.createTime) + ' UTC+08:00'}</time>
                                    <span>Production Site</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupLocal').append(local_data);
        }
    })
}
function createRemoteList(id) {
    $('#backupAll,#backupRemote').empty();

    let pid = $('#planid').text() ? $('#planid').text() : id;

    Service.find(`/cdm/filterBackup?pid=${pid}&cloud=${COPYNUM.cloud}&local=${COPYNUM.local}&remote=${COPYNUM.remote}`).then((data) => {
        let backupData = data.data;

        if (backupData.length) {
            $('#u3354 span').text(`All(${backupData.length})`);

            let backup_data = '';
            backupData.forEach((backup) => {
                backup_data += `<li class="backups-item ${backup.type == 'cloud' && 'backups-cloud' || 'backups-local'}">
                                    <time>${timetrans(backup.createTime) + ' UTC+08:00'}</time>
                                    <span>${(backup.type == 'local' && 'Production Site') || (backup.type == 'remote' && 'Disaster Recovery Site') || (backup.type == 'cloud' && 'Huawei Cloud | CN East Shanghai-2')}</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupAll').append(backup_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=remote&num=${COPYNUM.remote}`).then((data) => {
        let remoteData = data;
        if (remoteData.length) {
            $('#u3362 span').text(`Remote(${remoteData.length})`);

            let remote_data = '';
            remoteData.forEach((remote) => {
                remote_data += `<li class="backups-item ${remote.type == 'remote' && 'backups-local'}">
                                    <time>${timetrans(remote.createTime) + ' UTC+08:00'}</time>
                                    <span>Disaster Recovery Site</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupRemote').append(remote_data);
        }
    })
}
function createCloudList(id) {
    $('#backupAll,#backupCloud').empty();

    let pid = $('#planid').text() ? $('#planid').text() : id;

    Service.find(`/cdm/filterBackup?pid=${pid}&cloud=${COPYNUM.cloud}&local=${COPYNUM.local}&remote=${COPYNUM.remote}`).then((data) => {
        let backupData = data.data;

        if (backupData.length) {
            $('#u3354 span').text(`All(${backupData.length})`);

            let backup_data = '';
            backupData.forEach((backup) => {
                backup_data += `<li class="backups-item ${backup.type == 'cloud' && 'backups-cloud' || 'backups-local'}">
                                    <time>${timetrans(backup.createTime) + ' UTC+08:00'}</time>
                                    <span>${(backup.type == 'local' && 'Production Site') || (backup.type == 'remote' && 'Disaster Recovery Site') || (backup.type == 'cloud' && 'Huawei Cloud | CN East Shanghai-2')}</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupAll').append(backup_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=cloud&num=${COPYNUM.cloud}`).then((data) => {
        let cloudData = data;
        if (cloudData.length) {
            $('#u3364 span').text(`Cloud(${cloudData.length})`);

            let cloud_data = '';
            cloudData.forEach((cloud) => {
                cloud_data += `<li class="backups-item ${cloud.type == 'cloud' && 'backups-cloud'}">
                                    <time>${timetrans(cloud.createTime) + ' UTC+08:00'}</time>
                                    <span>Huawei Cloud | CN East Shanghai-2</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupCloud').append(cloud_data);
        }
    })
}

// 执行记录表格
let executeTable;
function initDataTable(pid) {
    executeTable = $('#executeTable').DataTable({
        info: false,
        order: [[2, 'desc']],
        lengthChange: false,
        searching: false,
        bFilter: false,
        retrieve: true,
        aLengthMenu: [19],
        bAutoWidth: false,
        processing: true,
        ajax: {
            url: `/cdm/getBackup?pid=${pid}`,
            type: 'GET',
        },
        columns: [
            {
                'data': 'type',
                'render': function (type) {
                    return (type == 'local' && 'Local Backup') || (type == 'remote' && 'Remote Backup') || (type == 'cloud' && 'Backup to Cloud');
                }
            },
            {
                'data': function () {
                    return `<img class="icon-success" src="/cdm/image/icon/success.svg" />Succeeded`;
                }
            },
            {
                'data': 'createTime',
                render: function (time) {
                    return timetrans(time) + ' UTC+08:00';
                }
            },
            {
                'data': 'endTime',
                render: function (time) {
                    return timetrans(time) + ' UTC+08:00';
                }
            },
            {
                'data': 'executeTime',
                render: function (time) {
                    return formartExecuteTime(time);
                }
            },
        ],
    })
}

function timetrans(date) {
    var date = new Date(date);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());

    return Y + M + D + h + m + s;
}

function formartExecuteTime(time) {
    let execute_time = time / 1000;
    let result = '';
    if (execute_time > 60) {
        result = parseInt(execute_time / 60) + ' Minutes' + (execute_time % 60) + ' Seconds';
    } else {
        result = Math.round(execute_time) + ' Seconds';
    }

    return result;
}