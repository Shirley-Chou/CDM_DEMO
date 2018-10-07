let RESTORE = {
    name: '',
    status: '恢复中',
    use: '数据恢复',
    site: '生产站点',
    dataType: '本地文件系统',
    plan: '',
    createTime: 0,
    backupType: '',
    backupCreateTime: 0,
}
let COPYNUM = {
    cloud: '',
    local: '',
    remote: ''
}
let BUCKET = '';
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

    // 状态
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

    // 读取
    Service.read = function (options) {
        return new Promise((resolve, reject) => {
            fetch('/cdm/readDir', {
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

let restoreTable, backupTable;

init();

function init() {
    initService();
    initRestoreTable();
    $('#base').show();

    Service.find('/cdm/getPlan').then((data) => {
        if (data.length > 0) {
            $('#u4290_input').append(`<option value="${data[0].name}">${data[0].name}</option>`);

            let pid = data[0]._id;
            let ploy_cloud = data[0].ployInfo.cloud;
            let ploy_local = data[0].ployInfo.local;
            let ploy_remote = data[0].ployInfo.remote;

            BUCKET = ploy_cloud.bucket;

            COPYNUM.cloud = parseInt(ploy_cloud.copyNum);
            COPYNUM.local = parseInt(ploy_local.copyNum);
            COPYNUM.remote = parseInt(ploy_remote.copyNum);

            initbackupTable(pid);
        } else {
            initbackupTable('0');
        }
    })

    $('#restoreTable tbody').on('click touchend', 'tr', function () {
        restoreTable.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');

        let data = restoreTable.rows(['.selected']).data()[0];
        if (data) {
            let type = data.backupType;
            let status = data.status;

            if (type == 'local') {
                $('.remote-overview-box,.cloud-overview-box').hide();
                $('.local-overview-box').show();
                $('#u4190_state0').css({ 'visibility': 'inherit', 'display': 'block' });
                $('#u4190_state1,#u4190_state2').css({ 'visibility': 'hidden', 'display': 'none' });
                $('#u4200 span').text(timetrans(data.backupCreateTime) + ' UTC+08:00');

                if (status == '成功') {
                    $('#u4215_img').attr('src', './cdm/image/local_recovery_success_en.png');
                }
            } else if (type == 'remote') {
                $('.local-overview-box,.cloud-overview-box').hide();
                $('.remote-overview-box').show();
                $('#u4190_state1').css({ 'visibility': 'inherit', 'display': 'block' });
                $('#u4190_state0,#u4190_state2').css({ 'visibility': 'hidden', 'display': 'none' });
                $('#u4226 span').text(timetrans(data.backupCreateTime) + ' UTC+08:00');

                if (status == '成功') {
                    $('#u4241_img').attr('src', './cdm/image/local_recovery_success_en.png');
                }
            } else {
                $('.remote-overview-box,.local-overview-box').hide();
                $('.cloud-overview-box').show();
                $('#u4190_state2').css({ 'visibility': 'inherit', 'display': 'block' });
                $('#u4190_state0,#u4190_state1').css({ 'visibility': 'hidden', 'display': 'none' });
                $('#u4252 span').text(timetrans(data.backupCreateTime) + ' UTC+08:00');

                if (status == '成功') {
                    $('#u4267_img').attr('src', './cdm/image/cloud_recovery_success_en.png');
                }
            }
        }
    })

    $('.backupdatable tbody').on('click touchend', 'tr', function () {
        backupTable.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');

        let type = backupTable.rows(['.selected']).data()[0].type;
        if (type == 'cloud') {
            $('#u4325_input').attr('disabled', true);
            $('#u4327_input').attr('checked', true);
            $('#u4325').css('color', '#999');
            $('#u4329_state0').css({ 'visibility': 'hidden', 'display': 'none' });
            $('#u4329_state1').css({ 'visibility': 'inherit', 'display': 'block' });
        } else {
            $('#u4325_input').attr('disabled', false);
            $('#u4325').css('color', '#333');
        }
    });

    $('#u4325').on('click touchend', function () {
        if (!$('#u4325_input').attr('disabled')) {
            $('#u4329_state1').css({ 'visibility': 'hidden', 'display': 'none' });
            $('#u4329_state0').css({ 'visibility': 'inherit', 'display': 'block' });
        }
    })

    $('#u4273').on('click touchend', function () {
        backupTable.ajax.reload(null, false);
    })

    // 数据恢复
    $('#u4346').on('click touchend', function () {
        Service.action({ Action: 'RestoreBegin' });

        let backupData = backupTable.rows(['.selected']).data()[0];

        if (backupData) {
            let backupType = backupData.type;

            if ($('#u4325_input').attr('checked')) {
                RESTORE.type = 'local';
                RESTORE.name = $('#u4332_input').val();
            } else {
                RESTORE.type = 'cloud';
                RESTORE.name = $('#u4343_input').val();
            }

            // RESTORE.site = (backupType == 'local' && 'Production Site') || (backupType == 'remote' && 'Disaster Recovery Site') || (backupType == 'cloud' && 'Huawei Cloud | CN East-Shanghai2');
            RESTORE.plan = $('#u4290_input').find('option:selected').text();
            RESTORE.createTime = new Date().getTime();
            RESTORE.backupType = backupType;
            RESTORE.backupCreateTime = backupData.createTime;
            RESTORE.imgs = backupData.imgs;

            if (backupType == 'local') {
                $('#u4215_img').attr('src', './cdm/image/local_recovery_processing_en.gif');
            } else if (backupType == 'remote') {
                $('#u4241_img').attr('src', './cdm/image/local_recovery_processing_en.gif');
            } else {
                $('#u4267_img').attr('src', './cdm/image/cloud_recovery_processing_en.gif');
            }

            Service.insert('/cdm/createRestore', RESTORE).then((data) => {
                restoreTable.ajax.reload(null, false);

                let id = data._id;
                let time;
                if (backupType == 'cloud') {
                    time = 30000;
                } else {
                    time = 8000;
                }
                let readInterval = setInterval(function () {
                    Service.read({ type: RESTORE.type }).then((dirData) => {
                        let imgs = RESTORE.imgs;
                        if (dirData.img.length == imgs.length) {
                            Service.insert('/cdm/uploadRestore', { id: id, status: '成功' }).then(() => {
                                restoreTable.ajax.reload(null, false);

                                if (backupType == 'local') {
                                    $('#u4215_img').attr('src', './cdm/image/local_recovery_success_en.png');
                                } else if (backupType == 'remote') {
                                    $('#u4241_img').attr('src', './cdm/image/local_recovery_success_en.png');
                                } else {
                                    $('#u4267_img').attr('src', './cdm/image/cloud_recovery_success_en.png');
                                }

                                Service.action({ Action: 'RestoreEnd' });
                            });
                            clearInterval(readInterval);
                        }
                    })
                }, time)
            })
        } else {
            alert("Please select a copy")
        }
    })

    // 删除恢复数据
    $('#u4514').on('click touchend', function () {
        Service.delete('/cdm/deleteRestore', { id: deleteId }).then(() => {
            restoreTable.ajax.reload(null, false);
            $('.lightbox').css({ 'visibility': 'hidden', 'display': 'none' });
            Service.find('/cdm/getRestore').then((data) => {
                if (data.data.length == 0) {
                    $('.local-overview-box,.remote-overview-box,.cloud-overview-box').hide();
                    $('#u4190_state0,#u4190_state1,#u4190_state2').css({ 'visibility': 'hidden', 'display': 'none' });
                }
            })
        })
    })

    $('#u4476,#u4478,.lightbox').on('click touchend', function () {
        $('.lightbox').css({ 'visibility': 'hidden', 'display': 'none' });
    })
    $('.lightbox,#u4370').on('click touchend', function () {
        $('.lightbox,#u4279,#u4279_state1').css({ 'visibility': 'hidden', 'display': 'none' });
    })
}

function initRestoreTable() {
    restoreTable = $('#restoreTable').DataTable({
        info: false,
        ordering: false,
        order: [[1, 'asc']],
        lengthChange: false,
        searching: false,
        bFilter: false,
        retrieve: true,
        aLengthMenu: [7],
        bAutoWidth: false,
        ajax: {
            url: '/cdm/getRestore',
            type: 'GET',
        },
        columns: [
            {
                'data': '_id',
                'visible': false
            },
            {
                'data': 'createTime',
                'visible': false
            },
            { 'data': 'name' },
            {
                'data': 'status',
                'render': function (status) {
                    if (status == '成功') {
                        return `<img class="icon-success" src="./cdm/image/icon/success.svg" /><a class='restoreStatus'>Successed</a>`
                    } else {
                        return `<img class="icon-success" src="./cdm/image/icon/creating.svg" /><a class='restoreStatus'>Recovery</a>`
                    }
                }
            },
            {
                'data': 'use', 'render': function (use) {
                    if (use == '数据恢复') {
                        return 'Data Recovery'
                    }
                }
            },
            {
                'data': 'site',
                'render': function (site) {
                    if (site == '生产站点') {
                        return 'Production Site'
                    }
                }
            },
            {
                'data': 'dataType', 'render': function (dataType) {
                    if (dataType == '本地文件系统') {
                        return 'Local File System'
                    }
                }
            },
            { 'data': 'plan' },
            {
                'data': function () {
                    return `<a class="show-object" onclick="showObject(this)">1</a>`
                }
            },
            {
                'data': '_id',
                'render': function (id) {
                    return `<a data-id="${id}" class="restory-delete-btn" onclick="deleteFun(this)">Delete</a>`
                }
            },
        ]
    })
}

function initbackupTable(pid) {
    backupTable = $('#backupTable').DataTable({
        info: false,
        order: [[0, 'desc']],
        lengthChange: false,
        searching: false,
        bFilter: false,
        retrieve: true,
        aLengthMenu: [6],
        bAutoWidth: false,
        ajax: {
            url: `/cdm/filterBackup?pid=${pid}&cloud=${COPYNUM.cloud}&local=${COPYNUM.local}&remote=${COPYNUM.remote}`,
            type: 'GET',
        },
        columns: [
            {
                'data': 'endTime',
                'render': function (time) {
                    return timetrans(time);
                }
            },
            {
                'data': 'type',
                'render': function (type) {
                    return (type == 'local' && 'Production Site') || (type == 'remote' && 'Disaster Recovery Site') || (type == 'cloud' && 'Huawei Cloud | CN East-Shanghai2');
                }
            },
            {
                'data': 'type',
                'render': function (type) {
                    return (type == 'local' && '10.175.38.41') || (type == 'remote' && '10.175.38.41') || (type == 'cloud' && `${BUCKET}`);
                }
            },
        ],
    })
}

function showObject() {
    $('.lightbox,#u4279,#u4279_state1').css({ 'visibility': 'inherit', 'display': 'block' });
}

// 显示删除pop框
let deleteId;
function deleteFun(el) {
    deleteId = $(el).data('id');
    $('#u4465,.lightbox').css({ 'visibility': 'inherit', 'display': 'block' });
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