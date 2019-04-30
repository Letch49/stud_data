const mysql = require('mysql');
const fs = require('fs');
var MySql = require('sync-mysql');

const con = new MySql({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stud'
});

const insertOrGet = (connect,table,key,value) => {
  const query = connect.query(`SELECT * FROM ${table} WHERE ${key} = '${value}'`);
  if (query.length < 1) {
    connect.query(`INSERT INTO ${table} (${key}) VALUES ('${value}')`);
    return;
  } else {
    return query;
  }
};
const get = (connect,table,key,value) => {
  const query = connect.query(`SELECT * FROM ${table} WHERE ${key} = '${value}'`);
  return query;
}
const insertOtGetStudent = (connect, object) => {
  const edu_type = get(con,'edu_type', 'name', `${object['Тип обучения']}`)[0]['id'];
  const edu_direction = get(con,'edu_direction', 'name', `${object['Направление подготовки']}`)[0]['id'];
  
  const stud_name = object['ФИО'];
  const stud_course = object['Курс'];
  const hasStudent = connect.query(`SELECT * FROM student WHERE name = '${stud_name}'`);
  console.log(hasStudent);
  if (hasStudent.length < 1) {
    connect.query(`INSERT INTO student (name, course, id_edu_type, id_edu_direction) VALUES ('${stud_name}', ${stud_course}, ${edu_type}, ${edu_direction})`);
    return ;
  } else {
    return hasStudent;
  }
};

const insertResult = (connect, object) => {
  const stud_id = get(connect, 'student','name', `${object['ФИО']}`)[0]['id'];
  const subject_id = get(connect, 'edu_subject','name', `${object['Предмет']}`)[0]['id'];
  const chemestry = object['Семестр'];
  const score = object['Баллы'];
  const result = object['Итоговый результат'];
  console.log(stud_id, subject_id, chemestry, score, result);
  connect.query(`INSERT INTO result (id_student, id_edu_subject, chemestry, score, result) VALUES (${stud_id}, ${subject_id}, ${chemestry}, ${score}, '${result}')`);
};


fs.readFile('data.json', "utf8", (err,el) => {
  const data = JSON.parse(el)['table']; // Текущие данные из JSON массива
  data.forEach(el => {
    insertOrGet(con,'edu_type', 'name', `${el['Тип обучения']}`); // Наполняет таблицу тип обучения
    insertOrGet(con, 'edu_direction', 'name',`${el['Направление подготовки']}`); // наполняем таблицу направлений подготовки
    insertOrGet(con, 'edu_subject', 'name',`${el['Предмет']}`); // наполняем таблицу предметов
    insertOtGetStudent(con, el); // наполняем таблицу студентов
    insertResult(con, el); // наполняем таблицу результатов
  });
});

