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

	var today_total = log.today + log.progress,
		month_sum = log.sum + log.progress,
		month_total = parseFloat(log.hours)

	$('#today-text').text(prettyHours(today_total));
	$('#money-text').text(parseFloat(log.money).toFixed(0));

	$('#dayly-need').text(log.need.toFixed(2) + "ч. " + log.left + "д.")
	$('#month-progress').text(month_sum.toFixed(1) + " / " + month_total)	

	$('#dayly-meter')[0].value = log.need;
	$("#bar #main")[0].value = month_sum;
	$("#bar #main")[0].max = month_total;
	$("#bar #main")[0].alt = month_sum + "/" + month_total
	if(log.sum+log.progress > log.hours) {
		var percent = month_total / month_sum;

		$("#bar #main").width(100*percent+"%");
		$("#bar #overtime").show();
		$("#bar #overtime").width(100*(1 - percent)+"%");
	} else {
		$("#bar #overtime").hide();
		$("#bar #main").width(100+"%");
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

	$('.dayly-meter').hover(function(ev){
		var dn = $('#dayly-need');
		dn.show();
		var x = ev.clientX,
			window_width = $('body')[0].clientWidth + 16,
			popup_width = dn[0].clientWidth;
		if (x + popup_width > window_width) {
			x = window_width - popup_width;
		}
		dn[0].style.top = ev.clientY + "px";
		dn[0].style.left = x + "px";
	}, function(){
		$('#dayly-need').hide();
	});

	$('.bar').hover(function(ev){
		var dn = $('#month-progress');
		dn.show();
		var x = ev.clientX,
			window_width = $('body')[0].clientWidth + 16,
			popup_width = dn[0].clientWidth;
		if (x + popup_width > window_width) {
			x = window_width - popup_width;
		}
		dn[0].style.top = ev.clientY + "px";
		dn[0].style.left = x + "px";
	}, function(){
		$('#month-progress').hide();
	});

	dataReady();
});
