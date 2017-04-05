'use strict';

let path = process.cwd();

module.exports = (fs, Entrant, schedule, json2csv, mailTransporter) => {
	/*
	* aggregate data for report
	*/
	function aggregateData(callback){
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

	function generateReadableTimestamp(unixtimeOrStatus, dateOnly){
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
	function preparePlainTextReport(reportData){
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

	function prepareHtmlReport(reportData){
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
		for (let unit of reportData){
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

	function saveReportToCSV(reportData,callback){
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

	/*
	* send pSys report
	*/
	let mailOptions;
	function sendEmailReport(recipientEmail, plainTextReport, htmlReport, attachmentPath){ // eslint-disable-line no-unused-vars
		if (attachmentPath) {
			mailOptions = {
				from: '"Генератор отчётов pSys 👥" <'+process.env.MAILER_EMAIL+'>',
				to: recipientEmail,
				subject: 'pSys: Еженедельный отчёт ✔',
				text: 'pSys: Еженедельный отчёт.\n\n'+plainTextReport,
				html: '<h3>pSys: Еженедельный отчёт.</h3>'+htmlReport,
				attachments: [{ path: attachmentPath }]
			};
		}else {
			mailOptions = {
				from: '"Генератор отчётов pSys 👥" <'+process.env.MAILER_EMAIL+'>',
				to: recipientEmail,
				subject: 'pSys: Еженедельный отчёт ✔',
				text: 'pSys: Еженедельный отчёт.\n\n'+plainTextReport,
				html: '<h3>pSys: Еженедельный отчёт.</h3>'+htmlReport
			};
		}
		mailTransporter.sendMail(mailOptions, function(err, info){
			if(err){return console.log(err);}
			console.log('Message sent: ' + info.response);
		});
	}

	let rule = new schedule.RecurrenceRule();
	rule.dayOfWeek = [0]; // once a week on a particular day, 0 - Sunday
	//rule.dayOfWeek = [0, new schedule.Range(1, 6)]; // every day
	rule.hour = 23;
	rule.minute = 0;
	rule.second = 0;
	let plainTextReport = '', // eslint-disable-line no-unused-vars
		htmlReport = ''; // eslint-disable-line no-unused-vars
	let reportJob = schedule.scheduleJob(rule, function(){ // eslint-disable-line no-unused-vars
		console.log('event: scheduled report time');
		aggregateData((reportData) => {
			//console.log('reportData:', reportData);
			plainTextReport = preparePlainTextReport(reportData);
			htmlReport = prepareHtmlReport(reportData);
			saveReportToCSV(reportData, (reportFilePath) => {
				console.log('reportFilePath', reportFilePath);
				/*
				*	TODO
				*	uncomment both lines when everything's ready, so that junk emails are not sent while developing
				*/
				//sendEmailReport(process.env.MAILER_RECIPIENT_EMAIL, plainTextReport, htmlReport, reportFilePath); // deployment config
				//sendEmailReport(process.env.MAILER_EMAIL, plainTextReport, htmlReport, reportFilePath); // development config
			});
		});
	});

};
