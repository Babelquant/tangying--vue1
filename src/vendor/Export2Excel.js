/* eslint-disable */
import { saveAs } from 'file-saver'
import XLSX from 'xlsx'
import * as ExcelJS from 'exceljs'
import * as fetch from 'node-fetch'
const { createCanvas } = require('canvas')

function generateArray(table) {
  var out = [];
  var rows = table.querySelectorAll('tr');
  var ranges = [];
  for (var R = 0; R < rows.length; ++R) {
    var outRow = [];
    var row = rows[R];
    var columns = row.querySelectorAll('td');
    for (var C = 0; C < columns.length; ++C) {
      var cell = columns[C];
      var colspan = cell.getAttribute('colspan');
      var rowspan = cell.getAttribute('rowspan');
      var cellValue = cell.innerText;
      if (cellValue !== "" && cellValue == +cellValue) cellValue = +cellValue;

      //Skip ranges
      ranges.forEach(function (range) {
        if (R >= range.s.r && R <= range.e.r && outRow.length >= range.s.c && outRow.length <= range.e.c) {
          for (var i = 0; i <= range.e.c - range.s.c; ++i) outRow.push(null);
        }
      });

      //Handle Row Span
      if (rowspan || colspan) {
        rowspan = rowspan || 1;
        colspan = colspan || 1;
        ranges.push({
          s: {
            r: R,
            c: outRow.length
          },
          e: {
            r: R + rowspan - 1,
            c: outRow.length + colspan - 1
          }
        });
      };

      //Handle Value
      outRow.push(cellValue !== "" ? cellValue : null);

      //Handle Colspan
      if (colspan)
        for (var k = 0; k < colspan - 1; ++k) outRow.push(null);
    }
    out.push(outRow);
  }
  return [out, ranges];
};

function datenum(v, date1904) {
  if (date1904) v += 1462;
  var epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
  var ws = {};
  var range = {
    s: {
      c: 10000000,
      r: 10000000
    },
    e: {
      c: 0,
      r: 0
    }
  };
  for (var R = 0; R != data.length; ++R) {
    for (var C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      var cell = {
        v: data[R][C]
      };
      if (cell.v == null) continue;
      var cell_ref = XLSX.utils.encode_cell({
        c: C,
        r: R
      });

      if (typeof cell.v === 'number') cell.t = 'n';
      else if (typeof cell.v === 'boolean') cell.t = 'b';
      else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      } else cell.t = 's';

      ws[cell_ref] = cell;
    }
  }
  if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
  return ws;
}

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

export function export_table_to_excel(id) {
  var theTable = document.getElementById(id);
  var oo = generateArray(theTable);
  var ranges = oo[1];

  /* original data */
  var data = oo[0];
  var ws_name = "SheetJS";

  var wb = new Workbook(),
    ws = sheet_from_array_of_arrays(data);

  /* add ranges to worksheet */
  // ws['!cols'] = ['apple', 'banan'];
  ws['!merges'] = ranges;

  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;

  var wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary'
  });

  saveAs(new Blob([s2ab(wbout)], {
    type: "application/octet-stream"
  }), "test.xlsx")
}

export function export_json_to_excel({
  multiHeader = [],
  header,
  data,
  filename,
  merges = [],
  autoWidth = true,
  bookType = 'xlsx'
} = {}) {
  /* original data */
  filename = filename || 'excel-list'
  data = [...data]
  data.unshift(header);

  for (let i = multiHeader.length - 1; i > -1; i--) {
    data.unshift(multiHeader[i])
  }

  var ws_name = "ASIN分组表";
  var wb = new Workbook(),
    ws = sheet_from_array_of_arrays(data);

  if (merges.length > 0) {
    if (!ws['!merges']) ws['!merges'] = [];
    merges.forEach(item => {
      ws['!merges'].push(XLSX.utils.decode_range(item))
    })
  }

  if (autoWidth) {
    /*设置worksheet每列的最大宽度*/
    const colWidth = data.map(row => row.map(val => {
      /*先判断是否为null/undefined*/
      if (val == null) {
        return {
          'wch': 10
        };
      }
      /*再判断是否为中文*/
      else if (val.toString().charCodeAt(0) > 255) {
        return {
          'wch': val.toString().length * 2
        };
      } else {
        return {
          'wch': val.toString().length
        };
      }
    }))
    /*以第一行为初始值*/
    let result = colWidth[0];
    for (let i = 1; i < colWidth.length; i++) {
      for (let j = 0; j < colWidth[i].length; j++) {
        if (result[j]['wch'] < colWidth[i][j]['wch']) {
          result[j]['wch'] = colWidth[i][j]['wch'];
        }
      }
    }
    ws['!cols'] = result;
  }

  /* add worksheet to workbook */
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;

  var wbout = XLSX.write(wb, {
    bookType: bookType,
    bookSST: false,
    type: 'binary'
  });
  saveAs(new Blob([s2ab(wbout)], {
    type: "application/octet-stream"
  }), `${filename}.${bookType}`);
}

const right_ali_col = [10,11,12,13,14,15,16,18,19.20,21,22,23]

export function export_data_to_excel({
    headers,
    datas,
    filename,
    bookType = 'xlsx'
  } = {}) {
  const workbook = new ExcelJS.Workbook();
  const worksheet0 = workbook.addWorksheet('ASIN分组表');
  const worksheet1 = workbook.addWorksheet('趋势组分析表-粗');
  const worksheet2 = workbook.addWorksheet('趋势组分析表-细');
  const promises = [];

  worksheet0.addRow(headers[0]);
  // 设置表头单元格样式
  const headerRow = worksheet0.getRow(1);
  headerRow.height = 50;
  headerRow.eachCell((cell, colNumber) => {
    if (colNumber < 17) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'CCCCCC' } };
    } else if (colNumber < 30) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4169E1' } };
    } else if (colNumber < 33) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3D9140' } };
    } else if (colNumber < 38) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '808A87' } };
    } else {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE6C9' } };
    }
    cell.alignment = {
      horizontal: 'left',
      vertical: 'top',
      wrapText: true
    };
    // cell.font = { bold: true, color: { argb: 'FFFFFF' } };
  })
  // 写入每行数据
  datas[0].forEach(row => {
    worksheet0.addRow(row);
  });
  // 设置单元格样式
  worksheet0.columns[1].width = 20;
  worksheet0.eachRow((row, rowNumber) => {
    if (rowNumber >= 2) {
      // 设置行高
      row.height = 118;
      row.eachCell((cell, colNumber) => {
        cell.font = {
          name: '等线',
          size: 14
        };
        if (right_ali_col.includes(colNumber)) {
          cell.alignment = {
            horizontal: 'right',
            vertical: 'middle',
            wrapText: true
          };
        } else {
          cell.alignment = {
            horizontal: 'left',
            vertical: 'middle',
            wrapText: true
          };
        }
        if (colNumber === 2) {
          // 获取图片并居中
          if (cell.value.length !== 0) {
            const promise = fetch(cell.value)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
              const base64Data =  Buffer.from(arrayBuffer).toString('base64')//将ArrayBuffer对象转换为Base64编码字符串
              const img = workbook.addImage({
                base64: base64Data,
                extension: 'png',
              });
              cell.value = ''
              worksheet0.addImage(img, {
                tl: { col: 1.2, row: rowNumber-0.4 },
                ext: { width: 135, height: 135 }
              });
            })
            promises.push(promise);
          }
        }
        if (colNumber === 3) {
          cell.font = { underline: "single", color: { argb: '0000FF' } };
          let url = cell.value
          cell.value = {text: "L", hyperlink: url};
        }
        if ([15,16,19,20,21,28].includes(colNumber)) {
          cell.numFmt = '$###0.0;-$###0.0'
        }
        if ([22,23,40].includes(colNumber)) {
          cell.numFmt = '0%'
        }
      })
    }
  })
  worksheet0.columns[16].width = 45;
  for (let i = 28; i < 39; i++) {
    worksheet0.columns[i].width = 25;
  }
  // 设为筛选状态
  worksheet0.autoFilter = {
    from: 'A1',
    to: 'AN1',
  }

  // function imagelocation(colNumber,rowNumber,i) {
  //   return  [
  //     {tl: { col: colNumber+0.05, row: rowNumber+0.05 }, br: {col: colNumber+0.45, row: rowNumber+0.45 }, editAs: 'undefined'},
  //     {tl: { col: colNumber+0.55, row: rowNumber+0.05 }, br: {col: colNumber+0.95, row: rowNumber+0.45 }, editAs: 'undefined'},
  //     {tl: { col: colNumber+0.05, row: rowNumber+0.55 }, br: {col: colNumber+0.45, row: rowNumber+0.95 }, editAs: 'undefined'},
  //     {tl: { col: colNumber+0.55, row: rowNumber+0.55 }, br: {col: colNumber+0.95, row: rowNumber+0.95 }, editAs: 'undefined'}
  //   ][i]              
  // }
  function imagelocation(colNumber,rowNumber,i) {
    return  [
      {tl: { col: colNumber, row: rowNumber }, ext: { width: 100, height: 100 }, editAs: 'absolute'},
      {tl: { col: colNumber+1.5, row: rowNumber }, ext: { width: 100, height: 100 }, editAs: 'absolute'},
      {tl: { col: colNumber, row: rowNumber+0.5 }, ext: { width: 100, height: 100 }, editAs: 'absolute'},
      {tl: { col: colNumber+1.5, row: rowNumber+0.5 }, ext: { width: 100, height: 100 }, editAs: 'absolute'},
    ][i]              
  }
  
  worksheet1.addRow(headers[1]);
  // 设置表头单元格样式
  const headerRow1 = worksheet1.getRow(1);
  headerRow1.height = 50;
  headerRow1.eachCell((cell, colNumber) => {
    if (colNumber < 6) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' } };
    } else if (colNumber < 11) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F4A460' } };
    } else if (colNumber < 24) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCDCDC' } };
    } else if (colNumber < 30) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0E68C' } };
    } else if (colNumber < 34) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B0C4DE' } };
    } else if (colNumber < 37) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
    } else {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDA0DD' } };
    }
    cell.alignment = {
      horizontal: 'left',
      vertical: 'top',
      wrapText: true
    };
  })
  // 写入每行数据
  datas[1].forEach(row => {
    worksheet1.addRow(row);
  });
  // 设置单元格样式
  worksheet1.columns[3].width = 30;
  worksheet1.columns[4].width = 30;
  worksheet1.eachRow((row, rowNumber) => {
    if (rowNumber >= 2) {
      // 设置行高
      row.height = 180;
      row.eachCell((cell, colNumber) => {
        cell.font = {
          name: '华文细黑',
          size: 11
        };
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle',
          wrapText: true
        };  
        if (colNumber === 4 || colNumber === 5) {
          //拼接图片
            const canvas = createCanvas(205, 205);
            const ctx = canvas.getContext('2d');
            // 加载并绘制四张图片
            const l = cell.value.length
            cell.value.forEach((url, i) => { 
              const promise = new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  ctx.drawImage(img, (i % 2) * 105, Math.floor(i / 2) * 105, 100, 100);
                  if (i === l-1) {
                  // 将 canvas 转换成图片，并将其添加到单元格中
                    const mergedImage = canvas.toDataURL();
                    const imgid = workbook.addImage({
                      base64: mergedImage,
                      extension: 'png',
                    });
                    worksheet1.addImage(imgid, {
                      tl: { col: colNumber-0.7, row: rowNumber-0.2 }, 
                      ext: { width: 205, height: 205 }
                    });
                  }
                  resolve();
                };
                img.onerror = (err) => {
                  console.log("load image error:",err)
                  reject(err);
                };
              });
              // promises.push(promise);
            })
            cell.value = '';
            // cell.value.forEach((url,i) => {
            //   const img = new Image();
            //   img.src = url;
            //   const promise = img.onload = () => {
            //     ctx.drawImage(img, (i % 2) * 100, Math.floor(i / 2) * 100);
            //   }
            //   if (i === cell.value.length - 1) {
            //     const base64Data = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
            //     const imageId = workbook.addImage({
            //       base64: base64Data,
            //       extension: 'png',
            //     });
            //     worksheet1.addImage(imageId, {
            //       tl: { col: cell.col, row: cell.row },
            //       // br: { col: cell.col + 1, row: cell.row + 1 }
            //       ext: { width: 200, height: 200 }
            //     });
            //   }
            //   promises.push(promise);
            // })
        }
      })
    }
  })
  for (let i = 10; i < 19; i++) {
    worksheet1.columns[i].width = 22;
  }
  for (let i = 19; i < 21; i++) {
    worksheet1.columns[i].width = 30;
  }
  worksheet1.columns[21].width = 50;
  worksheet1.columns[22].width = 30;

  worksheet2.addRow(headers[2]);
  // 设置表头单元格样式
  const headerRow2 = worksheet2.getRow(1);
  headerRow2.height = 50;
  headerRow2.eachCell((cell, colNumber) => {
    if (colNumber < 6) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' } };
    } else if (colNumber < 11) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F4A460' } };
    } else if (colNumber < 24) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCDCDC' } };
    } else if (colNumber < 30) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0E68C' } };
    } else if (colNumber < 34) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B0C4DE' } };
    } else if (colNumber < 37) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
    } else {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDA0DD' } };
    }
    cell.alignment = {
      horizontal: 'left',
      vertical: 'top',
      wrapText: true
    };
  })
  // 写入每行数据
  datas[2].forEach(row => {
    worksheet2.addRow(row);
  });
  // 设置单元格样式
  worksheet2.columns[3].width = 30;
  worksheet2.columns[4].width = 30;
  worksheet2.eachRow((row, rowNumber) => {
    if (rowNumber >= 2) {
      // 设置行高
      row.height = 180;
      row.eachCell((cell, colNumber) => {
        cell.font = {
          name: '华文细黑',
          size: 11
        };
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle',
          wrapText: true
        };
        if (colNumber === 4 || colNumber === 5) {
          const canvas = createCanvas(205, 205);
          const ctx = canvas.getContext('2d');
          const l = cell.value.length
          cell.value.forEach((url, i) => { 
            const promise = new Promise((resolve, reject) => {
              const img = new Image();
              img.src = url;
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                ctx.drawImage(img, (i % 2) * 105, Math.floor(i / 2) * 105, 100, 100);
                if (i === l-1) {
                // 将 canvas 转换成图片，并将其添加到单元格中
                  const mergedImage = canvas.toDataURL();
                  const imgid = workbook.addImage({
                    base64: mergedImage,
                    extension: 'png',
                  });
                  worksheet2.addImage(imgid, {
                    tl: { col: colNumber-0.7, row: rowNumber-0.2 }, 
                    ext: { width: 205, height: 205 }
                  });
                }
                resolve();
              };
              img.onerror = (err) => {
                reject(err);
              };
            });
            // promises.push(promise);
          })
          cell.value = '';
        }
      })
    }
  })
  for (let i = 10; i < 19; i++) {
    worksheet2.columns[i].width = 22;
  }
  for (let i = 19; i < 21; i++) {
    worksheet2.columns[i].width = 30;
  }
  worksheet2.columns[21].width = 50;
  worksheet2.columns[22].width = 30;

  // 导出Excel文件
  Promise.all(promises).then(() => {
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${filename}.${bookType}`);
    });
  }).catch(error => {
    console.log('Error adding images to worksheet:', error);
  });
}