import React, { Component } from 'react';
import { InputNumber, Input, Select, DatePicker, message } from 'antd';
import moment from 'moment';
var symbol = ['#', '(', '+', '-', '*', '/', ')']
var symbolPriority = {
    '#': 0,
    '(': 1,
    '+': 2,
    '-': 2,
    '*': 3,
    '/': 3,
    ')': 4
}
// 如果遇到左括号则直接入栈
// 如果遇到右括号,则弹出站内只到出现左括号为止
// 如果站外操作符的优先级高于站内的优先级则入栈
// 如果栈外的操作符优先级低于或等于栈内的优先级，输出栈内的符号，并入栈栈外的符号
// 中缀表达式遍历完成，但是栈中还有符号存在，一一出栈输出
function operaSymbol(char, symArr, resArr) {
    var lastChar = symArr[symArr.length - 1]
    if (!lastChar) {
        symArr.push(char)
        return
    }
    if (char === '(') {
        symArr.push(char)
    } else if (char === ')') {
        var curChar = symArr.pop()
        while (symArr && curChar != '(') {
            resArr.push(curChar)
            curChar = symArr.pop()
        }
    } else if (symbolPriority[char] > symbolPriority[lastChar]) {
        symArr.push(char)
    } else if (symbolPriority[char] <= symbolPriority[lastChar]) {
        while (lastChar && (symbolPriority[char] <= symbolPriority[lastChar])) {
            var curChar = symArr.pop()
            resArr.push(curChar)
            lastChar = symArr[symArr.length - 1]
        }
        //      operaSymbol(char, symArr, resArr)
        symArr.push(char)
    } else {
        symArr.push(char)
    }
}
function toSuffixExpre(str) {
    var resArr = []
    var symArr = []
    // 用于记录数字
    var substr = ''
    for (var i = 0, len = str.length; i < len; i++) {
        // 判断是否是符号
        if (symbol.includes(str[i])) {
            resArr.push(substr)
            substr = ''
            operaSymbol(str[i], symArr, resArr)
        } else {
            substr += str[i]
            // resArr.push(str[i])
        }
    }
    resArr.push(substr)
    while (symArr.length > 0) {
        var curChar = symArr.pop()
        resArr.push(curChar)
    }
    return resArr
}
function calculate(RPolishArray) {
    var result = 0;
    var tempArray = new Array(100);
    var tempNum = -1;
    for (var i = 0; i < RPolishArray.length; i++) {
        if (RPolishArray[i].match(/\d/)) {
            tempNum++;
            tempArray[tempNum] = RPolishArray[i];
        } else {
            switch (RPolishArray[i]) {
                case '+':
                    result = (tempArray[tempNum - 1] * 1) + (tempArray[tempNum] * 1);
                    tempNum--;
                    tempArray[tempNum] = result;
                    break;
                case '-':
                    result = (tempArray[tempNum - 1] * 1) - (tempArray[tempNum] * 1);
                    tempNum--;
                    tempArray[tempNum] = result;
                    break;
                case '*':
                    result = (tempArray[tempNum - 1] * 1) * (tempArray[tempNum] * 1);
                    tempNum--;
                    tempArray[tempNum] = result;
                    break;
                case '/':
                    result = (tempArray[tempNum - 1] * 1) / (tempArray[tempNum] * 1);
                    tempNum--;
                    tempArray[tempNum] = result;
                    break;
            }
        }
    }
    result = tempArray[tempNum].toFixed(2);
    return result;
}
class CustomComp extends Component {
    state = {
        isSaveOkModalVisible: false,
        yard: '',
        yardById: [],
        yardData: {},
        date: moment().format('YYYY-MM-DD HH:mm')
    }
    heapGroup = {
        5001: [
            { heapName: '堆C', remark: '低硅', group: '5001C' },
            { heapName: '堆A', remark: '高硅', group: '5001A' },
            { heapName: '堆B', remark: '高硅', group: '5001B' },
        ],
        5002: [
            { heapName: '堆C', remark: '低硅', group: '5002C' },
            { heapName: '堆A', remark: '高硅', group: '5002A' },
            { heapName: '堆B', remark: '高硅', group: '5002B' },
        ],
        5003: [
            { heapName: '堆C', remark: '低硅', group: '5003C' },
            { heapName: '堆A', remark: '高硅', group: '5003A' },
            { heapName: '堆B', remark: '高硅', group: '5003B' },
            { heapName: '堆D', remark: '低硅', group: '5003D' },
            // { heapName: '堆D_a', remark: '低硅', group: '5003D_a' },
            // { heapName: '堆D_b', remark: '低硅', group: '5003D_b' },

        ]
    }

    componentDidMount() {
        //隐藏滚轮
        const css = `::-webkit-scrollbar { display: none; }`;
        this.head = document.head || document.getElementsByTagName('head')[0];
        this.style = document.createElement('style');

        this.head.appendChild(this.style);

        this.style.type = 'text/css';
        if (this.style.styleSheet) {
            this.style.styleSheet.cssText = css;
        } else {
            this.style.appendChild(document.createTextNode(css));
        }
        _.map(['touchstart'], (event) => {
            this.selector.addEventListener(event, (e) => {
                e.stopPropagation();
            });
        });
        scriptUtil.excuteScriptService({
            objName: "KCCL",
            serviceName: "GetWarehouseByCategory",
            params: { type: '砂岩' },
            cb: (res) => {
                this.setState({
                    yard: res.result[0].id,
                    yardById: _.map(res.result, item => item.id),
                    yardData: _.reduce(res.result, (obj, item) => { obj[item.id] = Object.assign({}, item); return obj }, {}),
                });
            }
        });

    }
    handleInputChange = (val, key) => {
        this.setState({ [key]: val })
    }
    render() {
        const { yardById, yard, yardData } = this.state;
        console.log(this.state);
        return (
            <div
                style={containerStyle}
                onTouchStart={this.handleTouchStart}
                onTouchMove={this.handleTouchMove}
                onScroll={this.handleScroll}
                ref={ref => this.scrollDiv = ref}
            >

                <div style={listWrapper}>
                    <div style={listItemStyle}>
                        <label style={listItemLabel}>日期</label>
                        <div style={listItemInput}>{moment().format('YYYY-MM-DD HH:mm')}</div>
                        {/* 
                        <DatePicker
                            defaultValue={moment()}
                            showTime={{ format: 'HH:mm' }}
                            format='YYYY-MM-DD HH:mm'
                            onChange={(d, str) => this.setState({ date: str })}
                            style={pickerStyle}
                        /> */}
                    </div>
                    <div style={Object.assign(listItemStyle, { marginBottom: '14px' })} ref={(el) => this.selector = el}>
                        <label style={listItemLabel}>堆场</label>
                        {/* <div style={listItemInput}>{this.state.code}</div> */}
                        <Select
                            style={pickerStyle}
                            onChange={(id) => this.setState({ yard: id })}
                            value={yard}
                            placeholder='请选择堆场'
                        >
                            {
                                yardById
                                    .map(id => yardData[id])
                                    .map(item => <Select.Option value={item.id}>{item.name}</Select.Option>)
                            }
                        </Select>
                    </div>
                    {
                        yard && this.heapGroup[yard].map(item => (
                            <table style={table} cellpadding='5px'>
                                <tr>
                                    <th style={th}>{item.heapName} ({item.remark})</th>
                                    <td style={td}></td>
                                </tr>
                                <tr>
                                    <th style={th}>
                                        <p style={{ fontSize: '14px', height: '14px' }}> 取余</p>
                                        <p style={{ fontSize: '14px', height: '14px' }}>(提前换堆使用)</p> </th>
                                    <td style={td}><InputNumber value={this.state[`head${item.group}`]} style={{ width: '60%' }} onChange={(val => { this.handleInputChange(val, `head${item.group}`) })} placeholder='请输入堆头' /> 吨</td>
                                </tr>
                                <tr>
                                    <th style={th}>长</th>
                                    <td style={td}><InputNumber value={this.state[`len${item.group}`]} style={{ width: '60%' }} onChange={(val => { this.handleInputChange(val, `len${item.group}`) })} placeholder='请输入长' /> 米</td>
                                </tr>
                                <tr>
                                    <th style={th}>宽</th>
                                    <td style={td}><InputNumber value={this.state[`width${item.group}`]} style={{ width: '60%' }} onChange={(val => { this.handleInputChange(val, `width${item.group}`) })} placeholder='请输入宽' /> 米</td>
                                </tr>
                                <tr>
                                    <th style={th}>公式</th>
                                    <td style={td}>{this.getExp}</td>
                                </tr>
                                <tr>
                                    <th style={th}>吨数</th>
                                    <td style={td}><strong style={thStrong}>{this.getExpValue(item.heapName)}</strong></td>
                                </tr>
                            </table>
                        ))
                    }

                    <div style={btnContainerStyle}>
                        <div style={saveBtnStyle} onTouchStart={this.handleSubmit}> 保 存 </div>
                    </div>
                </div>
            </div >
        );
    }
    get getExp() {
        const { yardById, yard, yardData } = this.state;
        if (yard && yardData && yardData[yard]) {
            const expression = JSON.parse(yardData[yard].expression);
            return expression.exp.replace(/head|high|width|len/g, ($) => expression.map[$])
        }
        return false;
    }
    getExpValue(heap) {
        const { yard, yardData } = this.state;
        if (yard && yardData && yardData[yard]) {
            const expression = JSON.parse(yardData[yard].expression);
            const exp = expression.exp
                .replace(/head|high|width|len/g, ($) => {
                    if (expression.expMap[$]) {
                        return expression.expMap[$];
                    }
                    return $;
                })
                .replace(/head|high|width|len/g, $ => {
                    return this.state[`${$}${yard}${heap.slice(-1)}`] || '0';
                });
            return calculate(toSuffixExpre(exp))
        }
        return false;
    }
    handleTouchStart = e => {
        this.startPosition = e.changedTouches[0].clientY;
    };

    handleTouchMove = e => {
        if (this.state.isAnalysisResultModalVisible) return;
        const currentPosition = e.changedTouches[0].clientY;
        const scrollTop = this.scrollDiv.scrollTop;
        this.scrollDiv.scrollTop = scrollTop + this.startPosition - currentPosition;
        this.startPosition = currentPosition;
    };

    handleScroll = e => {
        e.preventDefault();
    };



    handleSubmit = () => {
        const { yard, yardData, date } = this.state;
        // if (!widthA || !lenA || !widthB || !lenB || !date || !yard) {
        //     message.warn('请检查是否填写完整');
        //     return false;
        // }
        // new Promise((resolve, reject) => {
        //     return scriptUtil.excuteScriptService({
        //         objName: "KCCL",
        //         serviceName: "GetMineStrockDetail",
        //         params: {
        //             date: date.split(' ')[0],
        //             code: yard
        //         },
        //         cb: (res) => {
        //             if (res.result.total) {
        //                 message.warn('数据已存在')
        //                 reject(false)
        //             } else {
        //                 resolve(true)
        //             }
        //         }
        //     });
        // }).then(() => {
        Promise.all(
            this.heapGroup[yard].map(item => {
                return new Promise(resolve => {
                    scriptUtil.excuteScriptService({
                        objName: "MineStockRecord",
                        serviceName: "AddDataTableEntry",
                        params: {
                            params: JSON.stringify({
                                whCode: yard,
                                whName: yardData[yard].name,
                                recordTime: `${date}:00`,
                                heapName: item.heapName,
                                width: this.state[`width${item.group}`] || 0,
                                len: this.state[`len${item.group}`] || 0,
                                name: item.heapName,
                                remark: item.remark,
                                head: this.state[`head${item.group}`] || 0,
                                category: '砂岩'
                            })
                        },
                        cb: (res) => {
                            resolve()
                        }
                    });
                })
            })).then(() => {
                message.success('保存成功');
                setTimeout(() => {
                    scriptUtil.openPage('#/runtime-fullscreen/runtime-fullscreen/Page_bad12f3a4e9f4ac9829d89a6e6a6d505', '_self');
                }, 800)
            })
        // })
    }
}


export default CustomComp;

const containerStyle = {
    height: '100%',
    width: '100%',
    paddingBottom: 45,
    overflowY: 'scroll',
};
const pickerStyle = {
    width: '60%'
}

const listWrapper = {

}

const listItemStyle = {
    lineHeight: '50px',
    borderBottom: '1px solid #E0E0E0',
    padding: '4px 12px'
}
const listItemLabel = {
    fontWeight: 'bold',
    width: '80px',
    fontSize: '16px',
    color: '#222222',
    display: 'inline-block'
}

const listItemInput = {
    border: 'none',
    outLine: 'none',
    width: 'calc(100% - 80px)',
    color: '#666666',
    fontSize: '16px',
    display: 'inline-block',
    padding: '0 10px'
}
const btnContainerStyle = {
    display: 'flex',
    width: '100%',
    position: 'fixed',
    bottom: 0,
    left: 0,
}
const commonBtn = {
    width: '100%',
    fontSize: '18px',
    padding: '8px',
    textAlign: 'center'
}

const saveBtnStyle = {
    width: '100%',
    fontSize: '18px',
    padding: '8px',
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#2d7df6'
}
const table = {
    width: '100%',
    textAlign: 'left',
    marginTop: '10px',
    borderTop: ' 1px solid #E0E0E0',
}
const th = {
    fontSize: '16px',
    lineHeight: '40px',
    textIndent: '14px'
}
const td = {
    fontSize: '16px',
    lineHeight: '40px',

}
const thStrong = {
    whiteSpace: 'nowrap',
    width: '50px',
    display: 'inline-block'
}