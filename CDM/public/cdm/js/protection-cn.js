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
    $('#u874').on('click touchend', function () {
        Service.find('/cdm/getPlan').then((data) => {
            if (data.length > 0) {
                $('.filesystem-table,#u1386').css('display', 'none');
                $('.filesystem-empty,.hasplan').css('display', 'block');
                $('#u1316_input,#u1310_input').attr("checked", false);
            } else {
                $('.filesystem-table,#u1386').css('display', 'block');
                $('.filesystem-empty,.hasplan').css('display', 'none');
            }
        })
    })

    // 创建保护计划
    $('#u1602').on('click touchend', function () {
        PLAN.name = $('#u1556_input').val();
        PLAN.ploy = $('#u1569 span').text();
        PLAN.site = $('#u1565 p').eq(1).children('span').text();
        PLAN.dataType = $('#u1565 p').eq(0).children('span').text();
        PLAN.ployInfo = PLOY;

        Service.insert('/cdm/createPlan', PLAN).then(() => {
            findPlan();
        })
    })

    // 删除保护计划
    $('#u991').on('click touchend', function () {
        Service.delete('/cdm/deletePlan').then(() => {
            $('#u1879 span').text(`所有(0)`);
            $('#u1885 span').text(`本地(0)`);
            $('#u1887 span').text(`异地(0)`);
            $('#u1889 span').text(`云上(0)`);
            $('#u876_div').removeClass('select');
            findPlan();
        })

        clearInterval(localInterval);
        clearInterval(remoteInterval);
        clearInterval(cloudInterval);
    })

    // 设置保护策略
    $('#u1442').on('click touchend', function () {
        // cloud
        PLOY.cloud.site = $('#u1463_input').find('option:selected').text();
        PLOY.cloud.bucket = $('#u1466_input').find('option:selected').text();
        PLOY.cloud.cycleType = $('#u1484_input').find('option:selected').text();
        PLOY.cloud.cycleTime = $('#u1497_input').val();
        PLOY.cloud.copyNum = $('#u1500_input').val();

        // local
        PLOY.local.cycleType = $('#u1496_input').find('option:selected').text();
        PLOY.local.cycleTime = PLOY.local.cycleType == '秒钟' ? $('#u1476_input').find('option:selected').text() : $('#u1481_input').val();
        PLOY.local.copyNum = $('#u1487_input').val();

        // remote
        PLOY.remote.cycleType = $('#u1521_input').find('option:selected').text();
        PLOY.remote.cycleTime = $('#u1520_input').val();
        PLOY.remote.copyNum = $('#u1511_input').val();

        // show
        $('#u1581 p').eq(0).children('span').text(PLOY.cloud.site);
        $('#u1581 p').eq(1).children('span').text(PLOY.cloud.bucket);
        $('#u1581 p').eq(2).children('span').text(`每${PLOY.cloud.cycleTime}${PLOY.cloud.cycleType}执行`);
        $('#u1581 p').eq(3).children('span').text(`${PLOY.cloud.copyNum}份`);

        $('#u1573 p').eq(0).children('span').text(`每${PLOY.local.cycleTime}${PLOY.local.cycleType}执行`);
        $('#u1573 p').eq(1).children('span').text(`${PLOY.local.copyNum}份`);

        $('#u1597 p').eq(0).children('span').text(`每${PLOY.remote.cycleTime}${PLOY.remote.cycleType}执行`);
        $('#u1597 p').eq(1).children('span').text(`${PLOY.remote.copyNum}份`);
    })

    // 查看保护策略
    $('#u884').on('click touchend', function () {
        Service.find('/cdm/getPlan').then((data) => {
            let ploy_cloud = data[0].ployInfo.cloud;
            let ploy_local = data[0].ployInfo.local;
            let ploy_remote = data[0].ployInfo.remote;

            if (ploy_cloud.site == 'Huawei Cloud | CN East-Shanghai2') {
                ploy_cloud.site = '华为云 | 华东-上海二'
            }

            $('#u1023 p').eq(0).children('span').text(ploy_cloud.site);
            $('#u1023 p').eq(1).children('span').text(ploy_cloud.bucket);
            $('#u1023 p').eq(2).children('span').text(`每${ploy_cloud.cycleTime}${CYCLETYPE.cloud}执行`);
            $('#u1023 p').eq(3).children('span').text(`${ploy_cloud.copyNum}份`);

            $('#u1015 p').eq(0).children('span').text(`每${ploy_local.cycleTime}${CYCLETYPE.local}执行`);
            $('#u1015 p').eq(1).children('span').text(`${ploy_local.copyNum}份`);

            $('#u1031 p').eq(0).children('span').text(`每${ploy_remote.cycleTime}${CYCLETYPE.remote}执行`);
            $('#u1031 p').eq(1).children('span').text(`${ploy_remote.copyNum}份`);
        })
    })

    // 拓扑图、副本显示和隐藏
    $('#u876_div, #u901, #u879, #u883, #u885, #u887, #u889, #u891, #u893, #u899, #u928, #u932, #u930, #u897, #u895, #u881').mouseover(function () {
        $('#u876_div').addClass('mouseover');
    }).mouseout(function () {
        $('#u876_div').removeClass('mouseover')
    }).on('click touchend', function () {
        $('#u876_div').addClass('select');
        $('#u1894,.backbups-tab-title,#u1791').show();
        $('.topology-empty,.backup-empty').hide();
    })

    // 本地备份
    $('#u947').on('click touchend', function () {
        $('#u880 span').text('备份中');
        $('#u881_img').attr('src', '/cdm/image/icon/creating.svg');

        backup('local');
    })

    // 异地备份
    $('#u963').on('click touchend', function () {
        $('#u880 span').text('备份中');
        $('#u881_img').attr('src', '/cdm/image/icon/creating.svg');

        backup('remote');
    })

    // 云备份
    $('#u979').on('click touchend', function () {
        $('#u880 span').text('备份中');
        $('#u881_img').attr('src', '/cdm/image/icon/creating.svg');

        backup('cloud');
    })

    // 查看执行计划
    $('#u893').on('click touchend', function () {
        executeTable.ajax.reload(null, false);
    })
    $('#u899').on('click touchend', function () {
        executeTable.ajax.url(`/cdm/getBackup?pid=0`).load();
    })
}

// 查询保护计划
function findPlan() {
    Service.find('/cdm/getPlan').then((data) => {
        if (data.length > 0) {
            // 更新保存计划表格数据
            $('#planid').text(data[0]._id);
            $('#u902 span').text(data[0].name);
            $('#u880 span').text(data[0].status);
            $('#u900 span').text(data[0].fail);
            $('#u894 span').text(data[0].success);
            $('#u990 span').text(`您确定要删除保护计划(${data[0].name})吗？`)

            // 执行统计次数
            Service.find(`/cdm/getBackup?pid=${data[0]._id}`).then((data) => {
                data.data.length > 0 && $('#u894 span').text(data.data.length);
            })

            // 上次执行时间
            EXECUTETIME = data[0].executeTime == '--' ? data[0].executeTime : formartExecuteTime(data[0].executeTime);

            let ploy_cloud = data[0].ployInfo.cloud;
            let ploy_local = data[0].ployInfo.local;
            let ploy_remote = data[0].ployInfo.remote;

            // 中英文替换
            CYCLETYPE.cloud = (ploy_cloud.cycleType == 'Hour' && '小时') || (ploy_cloud.cycleType == 'Day' && '天') || (ploy_cloud.cycleType == 'Week' && '周') || (ploy_cloud.cycleType == 'Month' && '月') || ploy_cloud.cycleType;

            CYCLETYPE.local = (ploy_local.cycleType == 'Second' && '秒钟') || (ploy_local.cycleType == 'Minute' && '分钟') || (ploy_local.cycleType == 'Hour' && '小时') || (ploy_local.cycleType == 'Day' && '天') || (ploy_local.cycleType == 'Week' && '周') || (ploy_local.cycleType == 'Month' && '月') || ploy_local.cycleType;

            CYCLETYPE.remote = (ploy_remote.cycleType == 'Minute' && '分钟') || (ploy_remote.cycleType == 'Hour' && '小时') || (ploy_remote.cycleType == 'Day' && '天') || (ploy_remote.cycleType == 'Week' && '周') || (ploy_remote.cycleType == 'Month' && '月') || ploy_remote.cycleType;

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
            $('.plan-table-tbody,.backbups-tab-title,#u1791,#u1894').css('display', 'none');
        }
    })
}

function cloudCycleType() {
    let selectedVal = $('#u1484_input').find('option:selected').text();
    let showInfo = (selectedVal == '小时' && '小时执行') || (selectedVal == '天' && '天执行') || (selectedVal == '周' && '周执行') || (selectedVal == '月' && '月执行')

    $('#u1493 span').text(showInfo);
}
function localCycleType() {
    let selectedVal = $('#u1496_input').find('option:selected').text();
    let showInfo = (selectedVal == '分钟' && '分钟执行') || (selectedVal == '小时' && '小时执行') || (selectedVal == '天' && '天执行') || (selectedVal == '周' && '周执行') || (selectedVal == '月' && '月执行')

    $('#u1480 span').text(showInfo);
}
function remoteCycleType() {
    let selectedVal = $('#u1521_input').find('option:selected').text();
    let showInfo = (selectedVal == '分钟' && '分钟执行') || (selectedVal == '小时' && '小时执行') || (selectedVal == '天' && '天执行') || (selectedVal == '周' && '周执行') || (selectedVal == '月' && '月执行')

    $('#u1519 span').text(showInfo);
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
        // Service.insert('/cdm/uploadPlan', {
        //     id: pid,
        //     executeTime: data.executeTime
        // }).then((planData) => { })
        EXECUTETIME = formartExecuteTime(data.executeTime);
        let checkTime = parseFloat(EXECUTETIME) * 1000;

        Service.find(`/cdm/getBackup?pid=${pid}`).then((data) => {
            if (data.data.length > 0) {
                setTimeout(function () {
                    Service.action({ Action: 'BackupEnd' });

                    $('#u880 span').text('成功');
                    $('#u881_img').attr('src', '/cdm/image/icon/success.svg');
                    $('#u894 span').text(data.data.length);

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

            let localExecuteTime = (CYCLETYPE.local == '秒钟' && (ploy_localTime * s)) || (CYCLETYPE.local == '分钟' && (ploy_localTime * m)) || (CYCLETYPE.local == "小时" && (ploy_localTime * h)) || (CYCLETYPE.local == "天" && (ploy_localTime * d));
            let remoteExecuteTime = (CYCLETYPE.remote == '分钟' && (ploy_remoteTime * m)) || (CYCLETYPE.remote == "小时" && (ploy_remoteTime * h)) || (CYCLETYPE.remote == "天" && (ploy_remoteTime * d));
            let cloudExecuteTime = (CYCLETYPE.cloud == '小时' && (ploy_cloudTime * h)) || (CYCLETYPE.cloud == "天" && (ploy_cloudTime * d));

            localInterval = setInterval(function () {
                $('#u880 span').text('备份中');
                $('#u881_img').attr('src', '/cdm/image/icon/creating.svg');

                backup('local');
            }, localExecuteTime);

            remoteInterval = setInterval(function () {
                $('#u880 span').text('备份中');
                $('#u881_img').attr('src', '/cdm/image/icon/creating.svg');

                backup('remote');
            }, remoteExecuteTime);

            cloudInterval = setInterval(function () {
                $('#u880 span').text('备份中');
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
            $('#u1879 span').text(`所有(${backupData.length})`);

            let backup_data = '';
            backupData.forEach((backup) => {
                backup_data += `<li class="backups-item ${backup.type == 'cloud' && 'backups-cloud' || 'backups-local'}">
                                    <time>${timetrans(backup.createTime) + ' UTC+08:00'}</time>
                                    <span>${(backup.type == 'local' && '生产站点') || (backup.type == 'remote' && '灾备站点') || (backup.type == 'cloud' && '华为云 | 华东-上海二')}</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupAll').append(backup_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=local&num=${COPYNUM.local}`).then((data) => {
        let localData = data;
        if (localData.length) {
            $('#u1885 span').text(`本地(${localData.length})`);

            let local_data = '';
            localData.forEach((local) => {
                local_data += `<li class="backups-item ${local.type == 'local' && 'backups-local'}">
                                    <time>${timetrans(local.createTime) + ' UTC+08:00'}</time>
                                    <span>生产站点</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupLocal').append(local_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=remote&num=${COPYNUM.remote}`).then((data) => {
        let remoteData = data;
        if (remoteData.length) {
            $('#u1887 span').text(`异地(${remoteData.length})`);

            let remote_data = '';
            remoteData.forEach((remote) => {
                remote_data += `<li class="backups-item ${remote.type == 'remote' && 'backups-local'}">
                                    <time>${timetrans(remote.createTime) + ' UTC+08:00'}</time>
                                    <span>灾备站点</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupRemote').append(remote_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=cloud&num=${COPYNUM.cloud}`).then((data) => {
        let cloudData = data;
        if (cloudData.length) {
            $('#u1889 span').text(`云上(${cloudData.length})`);

            let cloud_data = '';
            cloudData.forEach((cloud, index) => {
                cloud_data += `<li class="backups-item ${cloud.type == 'cloud' && 'backups-cloud'}">
                                    <time>${timetrans(cloud.createTime) + ' UTC+08:00'}</time>
                                    <span>华为云 | 华东-上海二</span>
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
            $('#u1879 span').text(`所有(${backupData.length})`);

            let backup_data = '';
            backupData.forEach((backup) => {
                backup_data += `<li class="backups-item ${backup.type == 'cloud' && 'backups-cloud' || 'backups-local'}">
                                    <time>${timetrans(backup.createTime) + ' UTC+08:00'}</time>
                                    <span>${(backup.type == 'local' && '生产站点') || (backup.type == 'remote' && '灾备站点') || (backup.type == 'cloud' && '华为云 | 华东-上海二')}</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupAll').append(backup_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=local&num=${COPYNUM.local}`).then((data) => {
        let localData = data;
        if (localData.length) {
            $('#u1885 span').text(`本地(${localData.length})`);

            let local_data = '';
            localData.forEach((local) => {
                local_data += `<li class="backups-item ${local.type == 'local' && 'backups-local'}">
                                    <time>${timetrans(local.createTime) + ' UTC+08:00'}</time>
                                    <span>生产站点</span>
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
            $('#u1879 span').text(`所有(${backupData.length})`);

            let backup_data = '';
            backupData.forEach((backup) => {
                backup_data += `<li class="backups-item ${backup.type == 'cloud' && 'backups-cloud' || 'backups-local'}">
                                    <time>${timetrans(backup.createTime) + ' UTC+08:00'}</time>
                                    <span>${(backup.type == 'local' && '生产站点') || (backup.type == 'remote' && '灾备站点') || (backup.type == 'cloud' && '华为云 | 华东-上海二')}</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupAll').append(backup_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=remote&num=${COPYNUM.remote}`).then((data) => {
        let remoteData = data;
        if (remoteData.length) {
            $('#u1887 span').text(`异地(${remoteData.length})`);

            let remote_data = '';
            remoteData.forEach((remote) => {
                remote_data += `<li class="backups-item ${remote.type == 'remote' && 'backups-local'}">
                                    <time>${timetrans(remote.createTime) + ' UTC+08:00'}</time>
                                    <span>灾备站点</span>
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
            $('#u1879 span').text(`所有(${backupData.length})`);

            let backup_data = '';
            backupData.forEach((backup) => {
                backup_data += `<li class="backups-item ${backup.type == 'cloud' && 'backups-cloud' || 'backups-local'}">
                                    <time>${timetrans(backup.createTime) + ' UTC+08:00'}</time>
                                    <span>${(backup.type == 'local' && '生产站点') || (backup.type == 'remote' && '灾备站点') || (backup.type == 'cloud' && '华为云 | 华东-上海二')}</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupAll').append(backup_data);
        }
    })
    Service.find(`/cdm/sortBackup?pid=${pid}&type=local&num=${COPYNUM.local}`).then((data) => {
        let localData = data;
        if (localData.length) {
            $('#u1885 span').text(`本地(${localData.length})`);

            let local_data = '';
            localData.forEach((local) => {
                local_data += `<li class="backups-item ${local.type == 'local' && 'backups-local'}">
                                    <time>${timetrans(local.createTime) + ' UTC+08:00'}</time>
                                    <span>生产站点</span>
                                    <div class="backups-line"></div>
                                </li>`;
            })
            $('#backupLocal').append(local_data);
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
        language: {
            zeroRecords: '抱歉,没有检索到数据',
            paginate: { 'next': '下一页', 'previous': '上一页', 'first': '第一页', 'last': '最后一页' },
            infoEmpty: '没有数据',
        },
        ajax: {
            url: `/cdm/getBackup?pid=${pid}`,
            type: 'GET',
        },
        columns: [
            {
                'data': 'type',
                'render': function (type) {
                    return (type == 'local' && '本地备份') || (type == 'remote' && '异地备份') || (type == 'cloud' && '备份上云');
                }
            },
            {
                'data': function () {
                    return `<img class="icon-success" src="/cdm/image/icon/success.svg" />成功`;
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
        result = parseInt(execute_time / 60) + '分钟' + (execute_time % 60) + '秒';
    } else {
        result = Math.round(execute_time) + '秒';
    }

    return result;
}