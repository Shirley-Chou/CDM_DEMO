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
            $('#u2038_input').append(`<option value="${data[0].name}">${data[0].name}</option>`);

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
                $('#u1900_state0').css({ 'visibility': 'inherit', 'display': 'block' });
                $('#u1900_state1,#u1900_state2').css({ 'visibility': 'hidden', 'display': 'none' });
                $('#u1910 span').text(timetrans(data.backupCreateTime) + ' UTC+08:00');

                if (status == '成功') {
                    $('#u1925_img').attr('src', './cdm/image/local_recovery_success_cn.png');
                }
            } else if (type == 'remote') {
                $('.local-overview-box,.cloud-overview-box').hide();
                $('.remote-overview-box').show();
                $('#u1900_state1').css({ 'visibility': 'inherit', 'display': 'block' });
                $('#u1900_state0,#u1900_state2').css({ 'visibility': 'hidden', 'display': 'none' });
                $('#u1936 span').text(timetrans(data.backupCreateTime) + ' UTC+08:00');

                if (status == '成功') {
                    $('#u1951_img').attr('src', './cdm/image/local_recovery_success_cn.png');
                }
            } else {
                $('.remote-overview-box,.local-overview-box').hide();
                $('.cloud-overview-box').show();
                $('#u1900_state2').css({ 'visibility': 'inherit', 'display': 'block' });
                $('#u1900_state0,#u1900_state1').css({ 'visibility': 'hidden', 'display': 'none' });
                $('#u1962 span').text(timetrans(data.backupCreateTime) + ' UTC+08:00');

                if (status == '成功') {
                    $('#u1977_img').attr('src', './cdm/image/cloud_recovery_success_cn.png');
                }
            }
        }
    })

    $('.backupdatable tbody').on('click touchend', 'tr', function () {
        backupTable.$('tr.selected').removeClass('selected');
        $(this).addClass('selected');

        let type = backupTable.rows(['.selected']).data()[0].type;
        if (type == 'cloud') {
            $('#u2043_input').attr('disabled', true);
            $('#u2045_input').attr('checked', true);
            $('#u2044').css('color', '#999');
            $('#u2047_state0').css({ 'visibility': 'hidden', 'display': 'none' });
            $('#u2047_state1').css({ 'visibility': 'inherit', 'display': 'block' });
        } else {
            $('#u2043_input').attr('disabled', false);
            $('#u2044').css('color', '#333');
        }
    });

    // 是否显示恢复到新主机内容选项
    $('#u2043').on('click touchend', function () {
        if (!$('#u2043_input').attr('disabled')) {
            $('#u2047_state1').css({ 'visibility': 'hidden', 'display': 'none' });
            $('#u2047_state0').css({ 'visibility': 'inherit', 'display': 'block' });
        }
    })

    $('#u2015').on('click touchend', function () {
        backupTable.ajax.reload(null, false);
    })

    // 数据恢复
    $('#u2080').on('click touchend', function () {
        Service.action({ Action: 'RestoreBegin' });

        let backupData = backupTable.rows(['.selected']).data()[0];

        if (backupData) {
            let backupType = backupData.type;

            if ($('#u2043_input').attr('checked')) {
                RESTORE.type = 'local';
                RESTORE.name = $('#u2050_input').val();
            } else {
                RESTORE.type = 'cloud';
                RESTORE.name = $('#u2061_input').val();
            }

            // RESTORE.site = (backupType == 'local' && '生产站点') || (backupType == 'remote' && '灾备站点') || (backupType == 'cloud' && '华为云 | 华东-上海二');
            RESTORE.plan = $('#u2038_input').find('option:selected').text();
            RESTORE.createTime = new Date().getTime();
            RESTORE.backupType = backupType;
            RESTORE.backupCreateTime = backupData.createTime;
            RESTORE.imgs = backupData.imgs;

            if (backupType == 'local') {
                $('#u1925_img').attr('src', './cdm/image/local_recovery_processing_cn.gif');
            } else if (backupType == 'remote') {
                $('#u1951_img').attr('src', './cdm/image/local_recovery_processing_cn.gif');
            } else {
                $('#u1977_img').attr('src', './cdm/image/cloud_recovery_processing_cn.gif');
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
                                    $('#u1925_img').attr('src', './cdm/image/local_recovery_success_cn.png');
                                } else if (backupType == 'remote') {
                                    $('#u1951_img').attr('src', './cdm/image/local_recovery_success_cn.png');
                                } else {
                                    $('#u1977_img').attr('src', './cdm/image/cloud_recovery_success_cn.png');
                                }

                                Service.action({ Action: 'RestoreEnd' });
                            });
                            clearInterval(readInterval);
                        }
                    })
                }, time)
            })
        } else {
            alert("请选择副本")
        }
    })

    // 删除恢复数据
    $('#u2216').on('click touchend', function () {
        Service.delete('/cdm/deleteRestore', { id: deleteId }).then(() => {
            restoreTable.ajax.reload(null, false);
            $('.lightbox').css({ 'visibility': 'hidden', 'display': 'none' });
            Service.find('/cdm/getRestore').then((data) => {
                if (data.data.length == 0) {
                    $('.local-overview-box,.remote-overview-box,.cloud-overview-box').hide();
                    $('#u1900_state0,#u1900_state1,#u1900_state2').css({ 'visibility': 'hidden', 'display': 'none' });
                }
            })
        })
    })

    $('#u2218,#u2220,.lightbox').on('click touchend', function () {
        $('.lightbox').css({ 'visibility': 'hidden', 'display': 'none' });
    })
    $('.lightbox,#u2112').on('click touchend', function () {
        $('.lightbox,#u2021,#u2021_state1').css({ 'visibility': 'hidden', 'display': 'none' });
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
        language: {
            zeroRecords: '抱歉,没有检索到数据',
            paginate: { 'next': '下一页', 'previous': '上一页', 'first': '第一页', 'last': '最后一页' },
            infoEmpty: '没有数据',
        },
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
                        return `<img class="icon-success" src="./cdm/image/icon/success.svg" /><a class='restoreStatus'>${status}</a>`
                    } else {
                        return `<img class="icon-success" src="./cdm/image/icon/creating.svg" /><a class='restoreStatus'>${status}</a>`
                    }
                }
            },
            { 'data': 'use' },
            { 'data': 'site' },
            { 'data': 'dataType' },
            { 'data': 'plan' },
            {
                'data': function () {
                    return `<a class="show-object" onclick="showObject(this)">1</a>`
                }
            },
            {
                'data': '_id',
                'render': function (id) {
                    return `<a data-id="${id}" class="restory-delete-btn" onclick="deleteFun(this)">删除</a>`
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
        language: {
            zeroRecords: '抱歉,没有检索到数据',
            paginate: { 'next': '下一页', 'previous': '上一页', 'first': '第一页', 'last': '最后一页' },
            infoEmpty: '没有数据',
        },
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
                    return (type == 'local' && '生产站点') || (type == 'remote' && '灾备站点') || (type == 'cloud' && '华为云 | 华东-上海二');
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
    $('.lightbox,#u2021,#u2021_state1').css({ 'visibility': 'inherit', 'display': 'block' });
}


// 显示删除POP框
let deleteId;
function deleteFun(el) {
    deleteId = $(el).data('id');
    $('#u2207,.lightbox').css({ 'visibility': 'inherit', 'display': 'block' });
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