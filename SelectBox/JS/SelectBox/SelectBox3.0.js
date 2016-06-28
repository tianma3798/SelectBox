/// <reference path="../jquery-1.11.1.min.js" />
/*
* SelectBox 1.0 
* 1.单选
* 2.多选
* 功能说明:
* 1.高度固定，仅支持向下展开
* 2.支持一级、二级、三级
* 3.添加清空 按钮和事件
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
            data: [],//控件
            selectedData: [],//选中结果的ID，列表
            showClearBtn: true,// 是否显示清楚按钮
            clearBtnText: '清空',
            moreSelect: true,//判断是否是多选
            overShow: true,//是否鼠标经过就显示
            showResult: true,//是否显示选中结果
            resetStyle: true,//是否重置 样式
            onClose: function (data, idList) { },//关闭事件
            onShow: function () { },//显示下拉菜单事件
            onClear:function(){},//清空按钮 事件
            //onYes: function () { },//确定事件
            onSelect: function (data) {

            },//选中事件
            maxSize: undefined,//指定选中个数的最大值
            level: 1,//指定显示内容的级别 
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

        opts.selectedData = initSelectedData(opts.data,opts.selectedData,opts.level);
        this.opts = $.extend({}, defaults, opts);
    }

    //从多级数组中获取指定ID的数组
    function initSelectedData(data, idList,level) {
        var resultArray = [];
        for (var i = 0; i < data.length; i++) {
            var itemOne = data[i];
            //1.获取子节点1
            if (existInArray(itemOne.id, idList) && level == 1)
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
    function existInArray(id,idList){
        for (var i = 0; i < idList.length; i++) {
            var item=idList[i];
            if(item==id)
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
            $(window).click(function () {
                _this.destroyPanel();
            });
            //绑定事件
            _elem.click(function () {
                _this.showPanel();
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


            //初始化 selectBox
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
                top.append('   <div class="selectTopItem">' + item.text + '</div><div class="clear"></div>');
                top.appendTo(line);

                var content = getDiv('secondContent');
                content.append(_this.getPanelByData(item.children));
                content.appendTo(line);
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
                divItem.text(item.text);
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
                            _this.appendData(thisData);
                            thisItem.addClass('selected');
                        }
                    } else {
                        //清空
                        _this.clearData();
                        //添加
                        _this.appendData(thisData);
                        thisItem.addClass('selected');
                        //隐藏
                        _this.destroyPanel();
                    }

                    //触发选择事件
                    _opts.onSelect(thisData);
                });
                panel.append(divItem);
            }
            panel.append(getClear());
            return panel;
        },
        //添加结果
        appendData: function (item) {
            var _this = this;
            var _opts = this.opts;
            var data = _opts.selectedData;
            data.push(item);

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
        //判断结果是否已经存在
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
            var _opts = this.opts;
            var resultPanel = this.elem.find('.selectResult');
            var data = _opts.selectedData;
            //显示到当前div
            resultPanel.text('');
            var str = '';
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                str += item.text + '&nbsp;&nbsp;';
            }
            resultPanel.html(str);
        },
        //显示panel
        showPanel: function () {
            var _this = this;
            var container = _this.createContainer();
            container.fadeIn('fast');
            //标记显示结果
            container.find('.selectBoxItem').each(function () {
                var thisItem = $(this);
                var thisData = { id: thisItem.attr('data-id'), text: thisItem.text() };
                if (_this.isExists(thisData)) {
                    thisItem.addClass('selected');
                }
            });
        },
        //隐藏pannel
        destroyPanel: function () {
            var _this = this;
            var _opts = this.opts;
            var container = $('.selectBoxConter');
            container.fadeOut('fast', function () {
                _opts.onClose(_this.getData(), _this.getDataID());
                container.remove();
            });
        }
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
