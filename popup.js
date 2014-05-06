function dataReady() {
	draw();
}

function prettyHours(hours) {
	var h = Math.floor(hours);
	var d = hours % 1;
	var m = Math.floor(60 * d);
	return h + ' ч. ' + ((m > 0) ? (m + ' м.') : '');
}

function draw() {
	var log = chrome.extension.getBackgroundPage().getInfo();

	$('#noname').hide();
	$('#mainapp').show();
	$('#loading').hide();
	$('#loading').text('загрузка данных');
	$('#result').show();

	$('#today').text(prettyHours(log.today + log.progress));
	$('#month').text(prettyHours(log.sum + log.progress));

	$('#left').text(log.left);

	if (log.need) {
		$('#need').html('<br/>Для желаемых ' + log.hours + ' часов, необходимо отрабатывать ' + parseFloat(log.need).toFixed(1) + ' часов в день');
	} else {
		$('#need').text('');
	}

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

$(function() {

	$('a[href="more"]').click(function(){
		$('#more').toggle();
		return false;
	});

	$('a[href="refresh"]').click(function(){
		$('#loading').show();
		$('#result').hide();
		chrome.extension.getBackgroundPage().updateInfo();
		return false;
	});

	dataReady();
});