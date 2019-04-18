const request = require('request');
const cheerio = require('cheerio');
var iconv = require('iconv-lite');
const fs = require('fs');

const prepeareUrl = (url, num) => `${url}${num}`;
let uri = 'http://students.vvsu.ru/results/stud/';
let startValue = 126802;

const iter = (uri, page) => {
  request(prepeareUrl(uri, page), { encoding: null }, (err, response, body) => {
    if (err) {
      console.log(err);
    }
    let $ = cheerio.load(iconv.decode(body, 'windows-1251'), { decodeEntities: false });
    let h1 = $("h1").html();
    let about = $('.info .span-110').eq(-1).html();
    let lastFindChemestry = 0;
    let resultsArray = [];
    if (h1 != null && about != null) {
      $('table').first().find('tbody').find('tr').each((idx, el) => {
        if ($(el).find('td[colspan=6]').find('b').length) {
          const splitter = $(el).find('td[colspan=6]').html().split(' ');
          if (splitter[0].slice(3) === 'Семестр') {
            lastFindChemestry = splitter[1].slice(0, 1);
          }
        }
        if ($(el).find('td').length === 6) {
          let res = mappingResults($(el).html().split(`\n`).slice(2, 7))
          resultsArray.push(getResults(lastFindChemestry, res));
          let dat = obj(h1, parseCourse(about), lastFindChemestry, res);
          save('data.json', dat);
        }
      })
    }
    startValue = startValue + 1;
    resultsArray = [];
    jsonArray.table = [];
    return iter(uri, startValue);
  });
};

iter(uri, startValue);

const parseCourse = (string) => {
  return string.split('b').slice(1, 4).map((el, idx) => {
    if (idx === 0) {
      return el.slice(1, el.length - 4);
    }
    if (idx === 1) {
      el = el.slice(8, el.length - 3);
      el = el.indexOf('.') === -1 ? el : el.split('.')[0]
      return el;
    }
    if (idx === 2) {
      return el.slice(1, 2);
    }
  });
};

const mappingResults = (arr) => {
  return arr.map((el, idx) => {
    if (idx === 0) {
      return el.slice(4, el.length - 5);
    }
    if (idx === 1 || idx === 2) { }
    if (idx === 3) {
      return el.slice(31, el.length - 5).split(' ')[0];
    }
    if (idx === 4) {
      return new String(el.slice(4, el.length - 5)).trim();
    }
  }).filter(el => el != undefined);
}

const obj = (fio, about, chemestry, predmet) => {
  const parserResult = (res) => {
    if (res === 'За') {
      return 'Зачтено'
    }
    if (res === 'От') {
      return 'Отлично'
    }
    if (res === 'Х') {
      return 'Хорошо'
    }
    if (res === '') {
      return 'Не атеестован';
    }
    return res;
  }
  return {
    'ФИО': fio,
    'Тип обучения': about[0],
    'Направление подготовки': about[1],
    'Курс': about[2],
    'Семестр': chemestry,
    'Предмет': predmet[0],
    'Баллы': predmet[1],
    'Итоговый результат': parserResult(predmet[2])
  }
};

const getResults = (chemestry, predmet) => {
  return {
    'Семестр': chemestry,
    'Результаты семестра': predmet
  }
}


const jsonArray = {
  table: []
}

const reader = (path, mydata) => {
  const data = fs.readFileSync(path, 'utf-8');
  let saveData = JSON.parse(data);
  saveData.table.push(mydata);
  let json = JSON.stringify(saveData);
  fs.writeFileSync(path, json, 'utf8');
}

const save = (path, mdata) => {
  fs.access('data.json', (err) => {
    if (err) {
      jsonArray.table.push(mdata);
      fs.writeFile(path, JSON.stringify(jsonArray), 'utf8', (err) => { });
    } else {
      reader(path, mdata);
    }
  })
}


const sleep = (n) => {
  for (let i = 0; i < n; i++) {

  }
}