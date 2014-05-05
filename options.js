// Saves options to chrome.storage
function save_options() {
  var login = document.getElementById('login').value;
  chrome.storage.sync.set({
    login: login,
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
    login: '',
  }, function(items) {
    document.getElementById('login').value = items.login;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);