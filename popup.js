$(function() {
	function prettyHours(hours) {
		var h = Math.floor(hours);
		var d = hours % 1;
		var m = Math.floor(60 * d);
		return h + ' ч. ' + ((m > 0) ? (m + ' м.') : '');

	}

	function draw() {
		var log = chrome.extension.getBackgroundPage().getInfo();
		
		if (log.username=='') {
			$('#noname').show();
			$('#mainapp').hide();
		} else {
			$('#noname').hide();
			$('#mainapp').show();

		}
		$('#loading').text('Нет доступа к данным');
		if (cur.online) {
			$('#loading').hide();
			$('#loading').text('загрузка данных');
			$('#result').show();
		}
		$('#today').text(prettyHours(log.today));
		$('#month').text(prettyHours(log.sum));
		drawLog(log.log);
	}

	function drawLog(table){
		$('#more').empty();
		for (date in table) {
			if (table.hasOwnProperty(date)) {
				$('#more').append('<b>' + date + '</b>: ' + prettyHours(table[date]) + '<br/>');
			}
		}
	}

	$('a[href="more"]').click(function(){
		$('#more').toggle();
		return false;
	});

	$('a[href="refresh"]').click(function(){
		$('#loading').show();
		$('#result').hide();
		chrome.extension.getBackgroundPage().update(function() {
			draw();
		});
		return false;
	});

	draw();
})