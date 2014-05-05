var options = {login: '', hours: 168, money: 0};
function updateOptions(callback) {
	chrome.storage.sync.get({
		"login": '',
		"hours" : 168,
		"money" : 0,
	}, function(items) {
		options = items;
		callback();
	});
}
var timer;
var lastIssue = {
	'issue': 'UNKNOWN',
	'unlogged': 0,
}
var cur = {log: [], sum: 0, today: 0, progress: 0, need: 0, money:0, days: 0};


function getlastMonthDay(month) {
	var d = new Date(2014, month, 0);
	return d.getDate();
}

function getLeftWorkDays(month, day) {
	var weekends = {
		5: [1,2,3,4,9,10,11,17,18,24,25,31],
		6: [1,7,8,12,13,14,15,21,22,28,29],
		7: [5,6,12,13,19,20,26,27],
		8: [2,3,9,10,16,17,23,24,30,31],
		9: [6,7,13,14,20,21,27,28],
		10: [4,5,11,12,18,19,25,26],
		11: [1,2,3,4,8,9,15,16,22,23,29,30],
		12: [6,7,13,14,20,21,27,28],
	}

	var maxday = getlastMonthDay(month);
	var leftweekends = weekends.hasOwnProperty(month) ? weekends[month].filter(function(el) {return el>day}) : [];
	var totaldays = maxday - day;
	return totaldays - leftweekends.length;

}


function secondsToHours(seconds) {
	return (seconds/60/60);
}
function error(message, block) {

}

function calcRate() {
	var today = new Date(),
	dd = today.getDate(),
	mm = today.getMonth() + 1, //January is 0!
	left = getLeftWorkDays(mm, dd),
	hours = parseInt(options.hours) - parseFloat(cur.sum) - cur.progress;

	if (hours < 0) {
		cur.need = 0;
	} else {
		cur.need = hours/left;
	}
	cur.left = left;
	cur.money = (cur.sum + cur.progress) * options.money;
	cur.hours = options.hours;
}

function notify() {
	chrome.browserAction.setBadgeText ( { text: (cur.today + cur.progress).toFixed(1)});
	if (cur.progress) {
		chrome.browserAction.setBadgeBackgroundColor({color: '#009900'});
	} else {
		chrome.browserAction.setBadgeBackgroundColor({color: '#FF0000'});
	}
	var views = chrome.extension.getViews({"type": "popup"});
	if (views.length > 0) {
		views[0].dataReady();
	}
}

function updateInfo () {
	if (timer) {
		clearTimeout(timer);
		timer = 0;
	}

	getCurrent(function(type, progress) {
		switch(type) {
			case 'double':
				error('Запущено несколько задач', 0);
				break;
			case 'update':
				getMonthStat(function(err, data) {
					cur = data;
					cur.progress = 0;
					calcRate();
					updateInfo()
				});
				break;
			default:
				cur.progress = progress;
				calcRate();
				notify();
		}
	});
	timer = setTimeout(updateInfo, 60000);
}

function getCurrent(callback) {
	//var url = 'http://coldfs/myngs/in-progress';
	var url = 'kanban.rn/ngs/api/my/in-progress/';

	$.get(url, function(result) {
		if (result.issues) {
			if (result.issues.length == 0 && lastIssue.issue != 'UNKNOWN') {
				lastIssue.issue = 'UNKNOWN';
				lastIssue.unlogged = 0;
				callback('update');
			} else if (result.issues.length > 1) {
				callback('double');
			} else if (result.issues.length == 1) {
				if (result.issues[0].issue != lastIssue.issue) {
					lastIssue = result.issues[0];
					callback('update');
				} else {
					if (lastIssue.unlogged > result.issues[0].unlogged) {
						callback('update');
					} else {
						callback(null, secondsToHours(result.issues[0].unlogged));
					}
				}
			} else {
				callback(null, 0);
			}
		} else {
			callback('nodata', 0);
		}
	}, 'json');
}

function getMonthStat(callback) {
	if (options.login == '') {
		callback('Укажите имя пользователя в настройках');
		return;
	}

	var today = new Date(),
		dd = today.getDate(),
		mm = today.getMonth() + 1, //January is 0!
		yyyy = today.getFullYear(),
		mm2 = mm + 1,
		url;

	//Хардкод, во славу сатане.
	dd = dd.toString().replace(/^(\d{1})$/, "0$1")
	mm = mm.toString().replace(/^(\d{1})$/, "0$1")
	mm2 = mm2.toString().replace(/^(\d{1})$/, "0$1")

	today = dd + '.' + mm;

	//today = '30.05';
	if (mm == '12') {
		url = 'http://stat.rn/ajax/user_stat.php?user=' + options.login + '&period='+ (yyyy) +'-' + mm + '%3B'+ (yyyy + 1) +'-01';
	} else {
		url = 'http://stat.rn/ajax/user_stat.php?user=' + options.login + '&period='+ yyyy +'-' + mm + '%3B'+ yyyy +'-' + (mm2) + '';
	}

	//url = 'http://coldfs/myngs/user_stat.php.htm';

	$.get(url, function(res) {
		$('#temp').html(res);
		var log = {}, sum = 0;
		$('#temp tbody tr:even').each(function(i, el) {
			var a = [];
			$(el).find('td').each(function(j, el2) {
				a.push($.trim($(el2).text()));
			});
			log[a.shift()] = parseFloat(a[0]);
			sum = sum +  parseFloat(a[0]);
		});
		var cu = {log: log, sum: sum, today: log.hasOwnProperty(today) ? log[today]: 0, progress: 0};

		callback(null, cu);
	}, 'html');
}

function getData(callback) {

	if (cur.username == '') {
		chrome.browserAction.setBadgeText ( { text: '' } );

		if (callback) {
			callback();
		}
		return;
	}
	var today = new Date(),
		dd = today.getDate(),
		mm = today.getMonth() + 1, //January is 0!
		yyyy = today.getFullYear();

	if (dd < 10) {
		dd = '0' + dd
	} 

	var mm2 = mm + 1;

	if (mm < 10) {
		mm ='0' + mm
	} 

	if (mm2 < 10) {
		mm2 ='0' + mm2
	} 
	today = dd + '.' + mm;

	var url;
	
	if (mm == '12') {
		url = 'http://stat.rn/ajax/user_stat.php?user=' + cur.username + '&period='+ (yyyy) +'-' + mm + '%3B'+ (yyyy + 1) +'-01';
	} else {
		url = 'http://stat.rn/ajax/user_stat.php?user=' + cur.username + '&period='+ yyyy +'-' + mm + '%3B'+ yyyy +'-' + (mm2) + '';
	}
	
	//url = 'http://coldfs/myngs/user_stat.php.htm';

	$.get(url, function(res){
		$('#temp').html(res);
		var log = {}, sum = 0;
		$('#temp tbody tr:even').each(function(i, el) {
			var a = [];
			$(el).find('td').each(function(j, el2) {
				a.push($.trim($(el2).text()));
			});
			log[a.shift()] = parseFloat(a[0]);
			sum = sum +  parseFloat(a[0]);
		});
		cur = {online: true, log: log, sum: sum, today: log.hasOwnProperty(today) ? log[today]: 0, username: cur.username};
		chrome.browserAction.setBadgeText ( { text: cur.today.toFixed(1) } );
		if (callback) {
			callback();
		}		
	}, 'html');
}


function update(callback) {
	chrome.storage.sync.get({
		login: '',
	}, function(items) {
		setUsername(items.login);
		getData(callback);
	});
}

function getInfo(){
	return cur;
}
function setUsername(name) {
	cur.username = name;
}

$(function() {

	$('body').append('<div id="temp"></div>'); //because fuck you, what's why
	updateOptions(function() {
		getMonthStat(function(err, items) {
			console.log('initial', err, items);
			if (err) {
				console.log(err);
			} else {
				cur = items;
				updateInfo();
			}
		})
	});
	// setInterval(function() {
	// 	update();
	// }, 15 * 60 * 1000); //обновляем раз в 15 минут  
});