import '../../assets/Easyui';
import '../../assets/Common';
import './index.scss';
import './index.html';
import myData from '../../assets/libs/data.json';

function Invoice() {
    this._init();
}

Invoice.prototype = {
    _init: function () {
        let that = this;
        that._cacheParam();//缓存变量
        that._initData();//初始化需要的数据
        that._grid();
        that._enableGridFilter();
        that._bindEven();//绑定事件
    },
    _cacheParam: function () {
        let that = this;
        that.$logout = $('#logout');
        that.$invoiceQRCode = $('#invoiceQRCode');

        that.$dg = $('#dg');
        that.$dt = $('#dt');
        that.$btnDelete = $('#btnDelete');
        that.$btnAdd = $('#btnAdd');
        that.$btnExport = $('#btnExport');

        that.$dlg = $('#dlg');
        that.$form = $('#form');
        that.$btnClose = $('#btnClose');
    },
    _initData: function () {
        let that = this;
        that.ListYesOrNo = [{text: '作废', value: '1'}, {text: '正常', value: '0'}];
        $('#billTime').val(Utils.dateFormat());
    },
    _bindEven: function () {
        let that = this;
        that.$invoiceQRCode.on('input', function () {
            that._invoiceQRCodeInput();
        });
        that.$logout.on('click', function () {
            window.token = '';
            Utils.setSessionStorage('token', '');
            window.location.href = document.location.origin;
        });
        that.$btnAdd.on('click', function () {
            that.$dg.datagrid('uncheckAll');
            that.$dlg.dialog('center').dialog('open');
        });
        that.$btnDelete.on('click', function () {
            that._delete();
        });
        that.$btnClose.on('click', function () {
            that.$dlg.dialog('close');
        });
        that.$btnExport.on('click', function () {
            that.$dg.datagrid('ExportExcel', {
                type: 'excel',
                ignoreField: [],
                excelName: '发票信息列表-' + Utils.dateFormat(new Date(), 'yyyy年MM月dd日HH时mm分ss秒')
            });
        });
    },
    _grid: function () {
        let that = this;
        that.$dg.datagrid({
            fit: true,
            striped: true,
            singleSelect: true,
            nowrap: false,
            pagination: true,
            rownumbers: true,
            toolbar: '#tb',
            idField: 'id',
            filterDelay: 600,
            remoteFilter: !TEST,
            onBeforeLoad: function (param) {
                let rules = param.filterRules ? JSON.parse(param.filterRules) : [];
                for (let i in rules) {
                    let rule = rules[i];
                    param[rule.field] = $.trim(rule.value);
                    if (rule.op === 'equal') {
                        param[rule.field + 'Op'] = '=';
                    }
                    if (rule.op === 'less') {
                        param[rule.field + 'Op'] = '<=';
                    }
                    if (rule.op === 'greater') {
                        param[rule.field + 'Op'] = '>=';
                    }
                }
                return param;
            },
            onLoadSuccess: function (data) {
            },
            loader: function (param, success) {
                if (TEST) {
                    success(myData);
                } else {
                    Http.config({
                        url: '/v1/invoice/view/page',
                        data: param,
                        isShowLoader: false,
                        success: function (data) {
                            success(data);
                        }
                    }).post();
                }
            },
            columns: [[
                // {field: 'ck', checkbox: true},
                {field: 'id', hidden: true},
                // {field:'invoiceTypeCode',title:'发票类型',width:100},
                {field: 'invoiceTypeName', title: '发票名称', width: 100},
                {field: 'invoiceCode', title: '发票代码', width: 100},
                {field: 'invoiceNumber', title: '发票号码', width: 100},
                {
                    field: 'billTime', title: '开票时间', width: 100, sortable: true, formatter: function (value) {
                        return value ? Utils.dateFormat(new Date(value), 'yyyy年MM月dd日') : null;
                    }
                },
                {field: 'checkCode', title: '校验码', width: 150},
                {field: 'invoiceAmount', title: '开具金额(元)', width: 100, sortable: true},
                {field: 'totalTaxNum', title: '税额(元)', width: 100, sortable: true},
                {field: 'totalTaxSum', title: '价税合计(元)', width: 100, sortable: true},
                {
                    field: 'voidMark', title: '状态(正常/作废)', width: 100, formatter: function (value) {
                        return value ? (value === '1' ? '作废' : '正常') : null;
                    }
                },
                {field: 'purchaserName', title: '购买方', width: 140},
                {field: 'taxpayerNumber', title: '购买方税号', width: 140},
                // {field:'taxpayerAddressOrId',title:'购买方地址',width:160},
                // {field:'taxpayerBankAccount',title:'购买方银行信息',width:160},
                {field: 'salesName', title: '销售方名称', width: 140},
                {field: 'salesTaxpayerNum', title: '销售方税号', width: 140},
                {field: 'salesTaxpayerAddress', title: '销售方地址', width: 190},
                {field: 'salesTaxpayerBankAccount', title: '销售方银行信息', width: 190},
                {field: 'invoiceRemarks', title: '备注', width: 140},
                // {field: 'taxDiskCode', title: '机器编号', width: 160},
                // {field:'isBillMark',title:'是否为清单票  Y：是，N：否可以根据该字段展示清单票和正常票',width:160},
                // {field:'tollSign',title:'收费标志字段（06：可抵扣通行费 07：不可抵扣通行费，08：成品油）',width:160},
                // {field:'tollSignName',title:'收费标志名称',width:160}，
                {field: 'createTime', title: '记录创建时间', width: 140, sortable: true}
            ]]
        });
    },
    _enableGridFilter: function () {
        let that = this;
        that.$dg.datagrid('enableFilter', [{
            field: 'billTime',
            type: 'dateRange',
            options: {
                onChange: function (value) {
                    Helper.doFilter(that.$dg, $(this).attr('name'), value);
                }
            }
        }, {
            field: 'voidMark',
            type: 'combobox',
            options: {
                data: that.ListYesOrNo,
                panelHeight: 'auto',
                onChange: function (value) {
                    Helper.doFilter(that.$dg, $(this).attr('name'), value);
                }
            }
        }, {
            field: 'createTime',
            type: 'dateRange',
            options: {
                onChange: function (value) {
                    Helper.doFilter(that.$dg, $(this).attr('name'), value);
                }
            }
        }, {
            field: 'invoiceAmount',
            type: 'text',
            op: ['equal', 'less', 'greater'],
            options: {}
        }, {
            field: 'totalTaxNum',
            type: 'text',
            op: ['equal', 'less', 'greater'],
            options: {}
        }, {
            field: 'totalTaxSum',
            type: 'text',
            op: ['equal', 'less', 'greater'],
            options: {}
        }]);
    },
    _delete: function () {
        let that = this, rows = that.$dg.datagrid('getSelections');
        if (rows.length > 0) {
            swal({
                title: '确定删除吗？',
                text: '删除后不可恢复',
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55'
            }).then(function (result) {
                if (result.value) {
                    let rows = that.$dg.datagrid('getSelections'), ids = [];
                    if (TEST) {
                        const rs = myData.rows;
                        for (let row of rows) {
                            rs.splice(rs.indexOf(row), 1);
                        }
                        that.$dg.datagrid('unselectAll').datagrid('loadData', rs);
                        Helper.showToast('删除成功！');
                    } else {
                        for (let i in rows) {
                            let row = rows[i];
                            ids.push(row.id);
                        }
                        Http.config({
                            url: '/v1/invoice/op/delete',
                            data: {id: ids[0]},
                            success: function () {
                                Helper.showToast('删除成功！');
                                that.$dg.datagrid('unselectAll').datagrid('reload');
                                that.$invoiceQRCode.focus();
                            }
                        }).postFormData();
                    }

                }
            });
        } else {
            swal('请选择要删除的数据！', '', 'info');
        }
    },
    _invoiceQRCodeInput: function () {
        let that = this;
        clearTimeout(that.timer);
        let ms = 500; // 延迟500毫秒执行后续操作
        that.timer = setTimeout(function () {
            let val = that.$invoiceQRCode.val();
            if (val.length < 60 || val.length > 80) {
                return;
            }
            that._createInvoice(val);
            that.$invoiceQRCode.val('');
            that.$invoiceQRCode.focus();
        }, ms);
    },
    _createInvoice: function (qrCode) {
        let that = this;
        Http.config({
            url: '/v1/invoice/op/createByQrCode',
            data: {qrCode: qrCode},
            success: function () {
                Helper.showToast('新增成功！');
                that.$dg.datagrid('unselectAll').datagrid('reload');
            },
            beforeSend: function () {
                that.$invoiceQRCode.attr('disabled', true);
            },
            complete: function () {
                that.$invoiceQRCode.attr('disabled', false);
                that.$invoiceQRCode.focus();
            }
        }).postFormData();
    },
    create: function (form) {
        if (TEST) {
            swal('测试模式，不能新增！', '', 'warning');
            return false;
        }
        let that = this;
        let formData = Utils.formSerialize(form);
        if (formData.checkCode.length !== 6) {
            swal('校验码必须为6位！', '', 'info');
            return false;
        }
        formData.billTime = Utils.toDate(formData.billTime).getTime();
        Http.config({
            url: '/v1/invoice/op/create',
            data: formData,
            success: function () {
                Helper.showToast('新增成功！');
                that.$dg.datagrid('unselectAll').datagrid('reload');
                that.$dlg.dialog('close');
            },
            beforeSend: function () {
                that.$invoiceQRCode.attr('disabled', true);
            },
            complete: function () {
                that.$invoiceQRCode.attr('disabled', false);
                that.$invoiceQRCode.focus();
            }
        }).post();
        return false;
    }
};

window.Invoice = new Invoice();
