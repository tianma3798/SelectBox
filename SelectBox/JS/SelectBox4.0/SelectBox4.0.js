/// <reference path="../jquery-1.11.1.min.js" />
/*
* SelectBox 4.0 
* 1.单选
* 2.多选
* 功能说明:
* 1.高度固定，仅支持向下展开
* 2.支持一级、二级、三级
* 3.添加清空 按钮和事件
* 4.修改多选样式，修改选择结果样式
* 5.添加绑定结果ID的输入框，或隐藏域
* 6.修复按钮自适应布局下的面板显示bug
*/
/*
* SelectBox 4.0 
* 1.单选
* 2.多选
* 功能说明:
* 1.高度固定，仅支持向下展开
* 2.支持一级、二级、三级
* 3.添加清空 按钮和事件
* 4.修改多选样式，修改选择结果样式
* 5.添加绑定结果ID的输入框，或隐藏域
* 6.修复按钮自适应布局下的面板显示bug
* 7.添加panelHeight 可指定面板的高度
* 8.修改 页面点击销毁面板bug
*/
(function () {
    //当前的数据格式 
    //{ id:'',text:'',child:[] }
    var SelectBox = function (elem, opts) {
        this.elem = elem;
        //默认参数设置
        var defaults = {
            width: 150,//控件的宽度
            panelWidth: 400,//显示结果的宽度
            panelHeight: 'auto',
            data: [],//控件的数据源
            selectedData: [],//选中结果的对象，列表
            placeHolder:'',
            valueTarget: '',//选中结果绑定的表单对象ID
            showClearBtn: true,// 是否显示清楚按钮
            clearBtnText: '清空',//清空按钮文本
            moreSelect: true,//判断是否是多选
            overShow: true,//是否鼠标经过就显示
            autoShow: false,//是否自动展开面板
            showAllName: true,//多级选择的时候是否显示全名称
            allLevelSelect: false,//是否分类可以选择
            levelTwoSelect: true,//当为两级选择的时候，点击分类选中或取消分类下的所有
            showResult: true,//是否显示选中结果
            resetStyle: true,//是否重置 样式
            //关闭事件------(放弃使用)
            onClose: function (data, idList) { },
            onShow: function () { },//显示下拉菜单事件
            onClear: function () { },//清空按钮 事件
            onSelect: function (data, idList) {

            },//选中事件
            maxSize: undefined,//指定选中个数的最大值
            level: 1//指定显示内容的级别 
        }
        //数组值 过滤
        if (typeof opts.data === "string") {
            opts.data = $.evalJSON(opts.data);
        }
        if (typeof opts.selectedData === "string") {
            opts.selectedData = $.evalJSON(opts.selectedData);
        } else if (opts.selectedData == undefined) {
            opts.selectedData = [];
        }
        opts.selectedData = initSelectedData(opts.data, opts.selectedData, opts.level);
        this.opts = $.extend({}, defaults, opts);
    }

    //显示结果提示
    function tip(str) {
        alert(str);
    }
    //从多级数组中获取指定ID的数组
    function initSelectedData(data, idList, level) {
        var resultArray = [];
        for (var i = 0; i < data.length; i++) {
            var itemOne = data[i];
            //1.获取子节点1
            if (existInArray(itemOne.id, idList))
                resultArray.push(itemOne);
            var array = itemOne.children;
            if (level == 1 || array == undefined || array.length <= 0)
                continue;

            for (var j = 0; j < array.length; j++) {
                var itemTwo = array[j];
                //2.获取子节点2
                if (existInArray(itemTwo.id, idList) && level == 2)
                    resultArray.push(itemTwo);
                var arrayTwo = itemTwo.children;
                if (level == 2 || arrayTwo == undefined || arrayTwo.length <= 0)
                    continue;
                //3.获取子节点3
                for (var k = 0; k < arrayTwo.length; k++) {
                    var item = arrayTwo[k];
                    if (existInArray(item.id, idList))
                        resultArray.push(item);
                }
            }
        }

        return resultArray;
    }
    //判断指定id在指定数组中是否存在
    function existInArray(id, idList) {
        for (var i = 0; i < idList.length; i++) {
            var item = idList[i];
            if (item == id)
                return true;
        }
        return false;
    }
    //判断指定data对象，是否在另一个data数组中存在
    function existInList(data, itemList) {
        for (var i = 0; i < itemList.length; i++) {
            var item = itemList[i];
            if (item.id == data.id)
                return true;
        }
        return false;
    }

    SelectBox.prototype = {
        //初始化样式
        init: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;
            //重写样式
            if (_opts.resetStyle) {
                initSelectBox();
            }
            //自动显示面板
            if (_opts.autoShow) {
                _this.showPanel();
            }

            $(window).resize(function () {
                //重设面板位置
                _this.setPanelSite();
            });

            //绑定事件
            _elem.click(function () {
                _this.showPanel();
                $(window.document).on('click', { obj: _this }, documentClick);
                return false;
            });
            //6.注册滚动条事件
            _elem.parents().each(function () {
                var thisItem = $(this);
                var overflow = thisItem.css('overflow');
                if (overflow == 'auto' || overflow == 'scroll') {
                    thisItem.scroll(function () {
                        _this.setPanelSite();
                    });
                    return false;
                }
            });
            //初始化 selectBoxsss
            function initSelectBox() {
                _elem.empty();
                var result = getDiv('selectResult');

                _elem.append(result);
                _elem.append(getDiv('selectIcon'));
                _elem.append(getClear());
                //设置样式
                _elem.css({
                    width: _opts.width
                });
                result.css({
                    width: _opts.width - 30
                });
                //初始化结果
                _this.showResult();
                _this.showPlaceHolder();
            }
        },
        //显示placeHolder
        showPlaceHolder: function () {
            var _this = this;
            var _opts = _this.opts;
            var result = _this.elem.find('.selectResult');
            //显示placeHolder
            if (_opts.selectedData.length <= 0 && _opts.placeHolder.length > 0) {
                result.addClass('placeHolder');
                result.text(_opts.placeHolder);
            }
        },
        //创建panel
        createContainer: function () {
            var _this = this;
            var _elem = this.elem;
            var _opts = this.opts;
            $('.selectBoxConter').remove();
            var container = getDiv('selectBoxConter');
            var panel = '';
            if (_opts.level == 1) {
                panel = _this.getPanelOne();
            }
            else if (_opts.level == 2) {
                panel = _this.getPanelTwo();
            } else {
                panel = _this.getPanelThree();
            }
            container.append(panel);
            container.appendTo($(document.body));
            //设置位置
            _this.setPanelSite();

            //注册显示事件
            _opts.onShow();
            container.fadeIn('fast');
            //判断是否显示清空按钮
            if (_opts.showClearBtn) {
                var clearBtn = getDiv('clearBtn');
                clearBtn.text(_opts.clearBtnText);
                clearBtn.click(function () {
                    _opts.onClear();
                    //1.清空数据
                    _this.clearData();
                    _this.showResult();
                    _this.destroyPanel();
                });
                container.append(clearBtn);
            }
            //判断是否多选
            if (_opts.moreSelect) {
                container.addClass('moreSelect');
                //添加确定按钮
                var yesBtn = getDiv('yesBtn');
                yesBtn.text('确定');
                yesBtn.click(function () {
                    _this.destroyPanel();
                });
                container.append(yesBtn);
            }

            return container;
        },
        //这是panel 的位置
        setPanelSite: function () {
            var _this = this;
            var _elem = this.elem;

            var _opts = this.opts;
            var container = $('.selectBoxConter');

            container.css({
                top: _elem.offset().top + _elem.outerHeight() + 2,
                left: _elem.offset().left,
                width: _opts.panelWidth
            }).click(function () {
                return false;
            });
            if (_opts.panelHeight != 'auto') {
                container.css({
                    height: _opts.panelHeight
                });
            }
        },
        //获取panel 一级选择
        getPanelOne: function () {
            var _this = this;
            var _opts = this.opts;
            var data = _opts.data;
            var panel = getDiv('selectBoxPanel panelSelectd');
            var inner = _this.getPanelByData(data);
            panel.append(inner);
            return panel;
        },
        //初始化 二级选择
        getPanelTwo: function () {
            var _this = this;
            var _opts = this.opts;
            var data = _opts.data;
            return _this.getPanelTwoByData(data).show();
        },
        //获取 二级选择
        getPanelTwoByData: function (data) {
            var _this = this;
            var panel = getDiv('selectBoxPanel');
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                //产生二级项
                var line = getDiv('secondLine');
                line.appendTo(panel);
                var top = getDiv('secondTop');
                var topItem = getDiv('selectTopItem');
                topItem.text(item.text);
                topItem.attr('data-id', item.id);
                //单选模式下，可以选择分类
                if (_this.opts.moreSelect == false)
                    if (_this.opts.allLevelSelect) {
                        var thisData = { id: topItem.attr('data-id'), text: topItem.text() };
                        topItem.addClass('enable');
                        //判断是否是选中项
                        if (_this.isExists(thisData)) {
                            topItem.addClass('selected');
                        }
                        //绑定选择事件
                        topItem.click(function () {
                            var thisItem = $(this);
                            //清空
                            _this.clearData();
                            //添加
                            _this.appendByItem(thisItem);
                            //隐藏
                            _this.destroyPanel();
                            //触发选择事件
                            _this.opts.onSelect({id:thisItem.attr('data-id'),text:thisItem.text()}, _this.getDataID());
                        });
                    }
                top.append(topItem);
                top.append('<div class="clear"></div>');
                top.appendTo(line);

                var content = getDiv('secondContent');
                content.append(_this.getPanelByData(item.children));
                content.appendTo(line);
                line.append(getDiv('clear'));
            }
            return panel;
        },
        //初始化 三级选择
        getPanelThree: function () {
            var _this = this;
            var _opts = this.opts;
            var data = _opts.data;
            var inner = getDiv('inner');
            //追加tabDiv
            var tabDiv = getDiv('tabDiv');
            tabDiv.appendTo(inner)
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var tabItem = getDiv('tabItem')
                tabItem.text(item.text);
                tabItem.appendTo(tabDiv);
            }
            tabDiv.children().first().addClass('tabSelectItem');
            tabDiv.append(getClear());
            //追加 pannel
            for (var i = 0; i < data.length; i++) {
                var childrenOne = data[i].children;
                _this.getPanelTwoByData(childrenOne).appendTo(inner);
            }
            inner.find('.selectBoxPanel').first().addClass('panelSelectd');

            //绑定事件
            var tabList = inner.find('.tabItem');
            var panelList = inner.find('.selectBoxPanel');
            tabList.mouseenter(function () {
                var thisItem = $(this);
                thisItem.addClass('tabSelectItem')
                    .siblings().removeClass('tabSelectItem');
                var index = tabList.index(thisItem);

                panelList.eq(index).show()
                    .siblings('.selectBoxPanel ').hide();
            });
            return inner;
        },
        //获取panel 根据data
        getPanelByData: function (data) {
            var _this = this;
            var _opts = this.opts;
            var panel = getDiv('innerList');
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                var divItem = getDiv('selectBoxItem')
                divItem.attr('data-id', item.id);
                divItem.append('<span>' + item.text + '</span>').append('<i></i>');
                //绑定事件
                divItem.click(function () {
                    var thisItem = $(this);
                    var thisData = { id: thisItem.attr('data-id'), text: thisItem.text() };
                    //判断单选还是多选
                    if (_opts.moreSelect == true) {
                        //判断是否被选中
                        if (thisItem.hasClass('selected')) {
                            //删除
                            _this.removeData(thisData);
                            thisItem.removeClass('selected');
                        } else {
                            //添加
                            _this.appendByItem(thisItem);
                        }
                    } else {
                        //清空
                        _this.clearData();
                        //添加
                        _this.appendByItem(thisItem);
                        //隐藏
                        _this.destroyPanel();
                    }
                    //触发选择事件
                    _opts.onSelect(thisData, _this.getDataID());
                });
                panel.append(divItem);
            }
            panel.append(getClear());
            return panel;
        },
        //添加结果，指定选中项Dom 对象
        appendByItem: function (item) {
            var _this = this;
            var _opts = this.opts;
            //判断选中结果数量上限
            if (_opts.maxSize) {
                if (_this.getDataCount() >= _opts.maxSize) {
                    tip('选中结果不可以超过' + _opts.maxSize + '个');
                    return;
                }
            }
            //1.获取选中项数据
            var thisData = { id: item.attr('data-id'), text: item.text() };
            //2.添加选中项样式
            item.addClass('selected');
            _this.appendData(thisData);
        },
        //添加结果，指定数据项
        appendData: function (itemData) {
            var _this = this;
            var _opts = this.opts;
            var data = _opts.selectedData;
            data.push(itemData);
            //显示到当前div
            _this.showResult();
        },
        //删除结果
        removeData: function (item) {
            var _this = this;
            var _opts = this.opts;
            var data = _opts.selectedData;
            for (var i = data.length - 1; i >= 0 ; i--) {
                //删除相同的ID
                var currentItem = data[i];
                if (currentItem.id == item.id) {
                    data.remove(i);
                }
            }
            //显示结果
            _this.showResult();
        },
        //清空结果
        clearData: function () {
            this.opts.selectedData = [];
        },
        //获取选中结果
        getData: function () {
            return this.opts.selectedData;
        },
        //获取选中结果数量
        getDataCount: function () {
            return this.getData().length;
        },
        //获取选中结果ID
        getDataID: function () {
            var idList = [];
            var data = this.getData();
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                idList.push(item.id);
            }
            return idList;
        },
        //两级最终选择，获取选中结果的上一级
        getLevel2ID: function (targetID) {
            var _this = this;
            var _opts = this.opts;
            for (var i = 0; i < _opts.data.length; i++) {
                var one = _opts.data[i];
                for (var j = 0; j < one.children.length; j++) {
                    var two = one.children[j];
                    if (two.id == targetID) {
                        return one;
                    }
                }
            }
            return null;
        },
        //获取两级最终选择的上一级列表
        getLevel2: function () {
            var _this = this;
            var selected = _this.getData();
            var parent = [];
            for (var i = 0; i < selected.length; i++) {
                var item = selected[i];
                var temp = _this.getLevel2ID(item.id);
                //判断当前父级是否已经找到
                if (existInList(temp, parent))
                    continue;
                if (temp != null)
                    parent.push(temp);
            }
            return parent;
        },
        //判断结果是否已经存在,指定数据对象
        isExists: function (item) {
            var data = this.opts.selectedData;
            for (var i = 0; i < data.length; i++) {
                var currentItem = data[i];
                if (item.id == currentItem.id)
                    return true;
            }
            return false;
        },
        //获取选中结果
        showResult: function () {
            var _this = this;
            var _opts = this.opts;
            var resultPanel = this.elem.find('.selectResult');
            resultPanel.removeClass('placeHolder');
            var data = _opts.selectedData;
            //显示到当前div
            resultPanel.text('');
            var strList = [];
            if (_opts.allLevelSelect == true || _opts.showAllName == false || _opts.level == 1 || _opts.level == 3) {
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var text = item.text;
                    if ($.type(text) === 'string')
                        text = text.replace('，', '');
                    strList.push(text);
                }
                resultPanel.html(strList.join('，'));
            }
            else {
                //判断当前选择的级别
                if (_opts.level == 2) {
                    var level2Data = _this.getLevel2();
                    var result = []
                    for (var i = 0; i < level2Data.length; i++) {
                        var one = level2Data[i];
                        var str = '<span class="parentName">' + one.text + '</span>：';
                        var twoVal = [];
                        //获取选中的子节点
                        for (var j = 0; j < one.children.length; j++) {
                            var two = one.children[j];
                            if (_this.isExists(two)) {
                                twoVal.push(two.text);
                            }
                        }
                        str += twoVal.join(" ");
                        result.push(str);
                    }
                    resultPanel.html(result.join('，'));
                }
            }
        },
        //显示panel
        showPanel: function () {
            var _this = this;
            var container = _this.createContainer();
            container.fadeIn('fast');
            _this.setPanelSite();
            //判断当前panel 的位置
            var conHeight = container.offset().top;
            var winHeight = $(window).height();
            if (conHeight > winHeight) {
                scrollHelper.scrollTop(conHeight - 40);
            }
            //标记显示结果
            container.find('.selectBoxItem').each(function () {
                var thisItem = $(this);
                var thisData = { id: thisItem.attr('data-id'), text: thisItem.text() };
                if (_this.isExists(thisData)) {
                    thisItem.addClass('selected');
                }
            });
            //标记选择按钮
            _this.elem.addClass('selectBoxFocus');
            //如果是两级可全选,绑定分类点击事件
            if (_this.opts.levelTwoSelect) {
                var selectTopItemList = container.find('.selectTopItem');
                selectTopItemList.addClass('topItemEnable').attr('title', '全选/反选');
                selectTopItemList.click(function () {
                    var thisItem = $(this);
                    var secondLine = thisItem.parents('.secondLine');
                    var itemList = secondLine.find('.selectBoxItem');
                    if (itemList.length == secondLine.find('.selected').length) {
                        //取消全选
                        itemList.addClass('selected');
                    } else {
                        //全选
                        itemList.removeClass('selected');
                    }
                    //触发选择事件
                    itemList.trigger('click');
                });
            }
        },
        //隐藏pannel
        destroyPanel: function () {
            var _this = this;
            var _opts = this.opts;
            var container = $('.selectBoxConter');
            container.fadeOut('fast', function () {
                var idList = _this.getDataID();
                //1.绑定结果到表单
                if (_opts.valueTarget.length > 0) {
                    $('#' + _opts.valueTarget).val(idList);
                }
                //触发关闭事件
                _opts.onClose(_this.getData(), idList);
                container.remove();
            });
            _this.elem.removeClass('selectBoxFocus');
            //显示placeHolder
            _this.showPlaceHolder();
            $(window.document).off('click', { obj: _this }, documentClick);
        }
    }
    //文档点击事件
    function documentClick(e) {
        e.data.obj.destroyPanel();
    }

    //获取clear
    function getClear() {
        return getDiv('clear')
    }
    //获取div
    function getDiv(cla) {
        var div = $('<div />');
        div.addClass(cla);
        return div;
    }

    //选择框控件
    $.fn.selectBox = function (opts) {
        var box = new SelectBox(this, opts);
        box.init();
        return box;
    }

})();
