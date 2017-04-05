'use strict';

/*
*	Report generation on request
*
*	usage example
*
*	const reporterSingleRun = require('conditionalPathTo/index-single-run.js');
*	reporterSingleRun.generateReport((plainTextReport, htmlReport, reportFilePath) => {
*		console.log(plainTextReport);
*		console.log(htmlReport);
*		console.log(reportFilePath);
*	});
*/


let path = process.cwd();
const fs = require('fs'),
	Entrant = require('../models/entrants'),
	json2csv = require('json2csv');

function aggregateData(callback) {
	console.log('aggregating data');
	let reportData = [];
	Entrant.find({}, (err, docs) => {
		if (err) throw err;
		let reportUnit = {};
		for (let doc of docs) {
			reportUnit = {};
			reportUnit.counter = reportData.length;
			reportUnit.fullName = doc.firstName+' '+doc.lastName || null;
			reportUnit.phone = doc.phone || null;
			reportUnit.email = doc.email || null;
			reportUnit.participates = doc.participates || null;
			reportUnit.created = doc.created || null;
			reportUnit.controlAmount = doc.control.amount || null;
			reportUnit.controlVendorId = doc.control.vendorId || null;
			reportUnit.controlMessage = doc.control.message || null;
			reportUnit.controlImage = doc.control.image || null;
			reportData.push(reportUnit);
		}
		callback(reportData);
	});
}

function generateReadableTimestamp(unixtimeOrStatus, dateOnly) {
	let parsedDate = new Date(unixtimeOrStatus);
	let date = parsedDate.getDate().toString(),
		month = parsedDate.getMonth().toString(),
		hours = parsedDate.getHours().toString(),
		minutes = parsedDate.getMinutes().toString(),
		seconds = parsedDate.getSeconds().toString();
	if (date.length < 2) date = '0'+date;
	if (month.length < 2) month = '0'+month;
	if (hours.length < 2) hours = '0'+hours;
	if (minutes.length < 2) minutes = '0'+minutes;
	if (seconds.length < 2) seconds = '0'+seconds;
	if (isNaN(parsedDate)) return unixtimeOrStatus;
	if (dateOnly) return parsedDate.getFullYear()+'-'+month+'-'+date;
	return date+'.'+month+'.'+parsedDate.getFullYear()+' '+hours+':'+minutes+':'+seconds;
}

function preparePlainTextReport(reportData) {
	let plainText = '',
		timestamp;
	for (let unit of reportData){
		timestamp = generateReadableTimestamp(unit.created);
		plainText +=
`${unit.counter}.
Полное имя: ${unit.fullName}
Телефон: ${unit.phone}, эл. почта: ${unit.email}
Участвует: ${unit.participates}
Регистрация: ${timestamp}
Контроль:
- потрачено: ${unit.controlAmount}
- ид. продавца: ${unit.controlVendorId}
- сообщение: ${unit.controlMessage}
\n`;
	}
	plainText += '\nКонец отчёта\n';
	return plainText;
}

function prepareHtmlReport(reportData) {
	let timestamp,
		htmlString =
`<table style="border: 1px #3e3e3e dotted;">
	<thead>
		<tr>
			<th>№</th>
			<th>Полное имя</th>
			<th>Телефон</th>
			<th>Эл. почта</th>
			<th>Участвует</th>
			<th>Регистрация</th>
			<th>Потрачено</th>
			<th>Ид. продавца</th>
			<th>Сообщение</th>
			<th>Изображение</th>
		<tr>
		<tr><td colspan="10"><hr/></td></tr>
	</thead>
	<tbody>`;
	for (let unit of reportData) {
		timestamp = generateReadableTimestamp(unit.created);
		htmlString +=
`<tr>
	<td>${unit.counter}</td>
	<td>${unit.fullName}</td>
	<td>${unit.phone}</td>
	<td>${unit.email}</td>
	<td>${unit.participates}</td>
	<td>${timestamp}</td>
	<td>${unit.controlAmount}</td>
	<td>${unit.controlVendorId}</td>
	<td>${unit.controlMessage}</td>
	<td>${unit.controlImage}</td>`;
	}
	htmlString += '</tbody></table>';
	return htmlString;
}

function saveReportToCSV(reportData,callback) {
	let timestampDateOnly = generateReadableTimestamp(new Date().getTime(), true);
	console.log('timestampDateOnly:', timestampDateOnly);

	let csvFields = ['counter', 'fullName', 'phone', 'email', 'participates', 'created', 'controlAmount', 'controlVendorId', 'controlMessage', 'controlImage'],
		csvFieldNames = ['№', 'Полное имя', 'Телефон', 'Эл. почта', 'Участвует', 'Регистрация', 'Потрачено', 'Ид. продавца', 'Сообщение', 'Изображение'],
		csvData = reportData;

	csvData.forEach((unit) => {
		unit.created = generateReadableTimestamp(unit.created);
	});

	json2csv({ data: reportData, fields: csvFields, fieldNames: csvFieldNames}, (err, csvReport) => {
		if (err) throw err;
		fs.writeFile(path+'/server/reporter/reports/'+timestampDateOnly+'.csv', csvReport, (err) => {
			if (err) throw err;
			console.log('successfully saved');
			callback(path+'/server/reporter/reports/'+timestampDateOnly+'.csv');
		});
	});
}

module.exports.generateReport = function(callback) {
	console.log('event: manually requested report');
	let plainTextReport = '',
		htmlReport = '';
	aggregateData((reportData) => {
		//console.log('reportData:', reportData);
		plainTextReport = preparePlainTextReport(reportData);
		htmlReport = prepareHtmlReport(reportData);
		saveReportToCSV(reportData, (reportFilePath) => {
			console.log('reportFilePath', reportFilePath);
			callback(plainTextReport, htmlReport, reportFilePath);
		});
	});
};
