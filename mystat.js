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

var cur = {online: false, log: [], sum: 0, today: 0, username: ''};

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
	update();
    setInterval(function() {
    	update();
    }, 15 * 60 * 1000); //обновляем раз в 15 минут  
});