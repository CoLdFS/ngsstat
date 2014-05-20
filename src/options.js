// Saves options to chrome.storage
function save_options() {
  var login = document.getElementById('login').value;
  var hours = document.getElementById('hours').value;
  var money = document.getElementById('money').value;
  hours = parseInt(hours);
  chrome.storage.sync.set({
    login: login,
    hours: hours,
    money: money,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Настройки сохранены';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    "login": '',
    "hours" : 168,
    "money" : 0,
  }, function(items) {
    document.getElementById('login').value = items.login;
    document.getElementById('hours').value = items.hours;
    document.getElementById('money').value = items.money;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
