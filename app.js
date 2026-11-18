(function () {
  'use strict';

  var PREFIX = 'apex.';
  var FORMAT = 'apex-backup';

  var el = {
    list: document.getElementById('keyList'),
    empty: document.getElementById('empty'),
    total: document.getElementById('total'),
    toast: document.getElementById('toast'),
    file: document.getElementById('file')
  };

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.toast.hidden = true; }, 2800);
  }

  function keys() {
    var out = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0) out.push(k);
    }
    return out.sort();
  }

  function bytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(2) + ' MB';
  }

  function render() {
    var found = keys();
    el.list.textContent = '';
    var sum = 0;

    found.forEach(function (k) {
      var value = localStorage.getItem(k) || '';
      sum += k.length + value.length;
      var li = document.createElement('li');
      var name = document.createElement('span');
      var app = k.slice(PREFIX.length).split('.')[0];
      var appSpan = document.createElement('span');
      appSpan.className = 'app';
      appSpan.textContent = app;
      name.appendChild(appSpan);
      name.appendChild(document.createTextNode(k.slice(PREFIX.length + app.length)));
      var size = document.createElement('span');
      size.className = 'size';
      size.textContent = bytes(value.length);
      li.appendChild(name);
      li.appendChild(size);
      el.list.appendChild(li);
    });

    el.empty.hidden = found.length !== 0;
    el.total.textContent = found.length
      ? found.length + (found.length === 1 ? ' key' : ' keys') + ' \u00b7 about ' + bytes(sum) + ' of data'
      : '';
  }

  function exportBackup() {
    var data = { format: FORMAT, version: 1, exported: new Date().toISOString(), keys: {} };
    var found = keys();
    if (!found.length) {
      toast('Nothing to export yet');
      return;
    }
    found.forEach(function (k) { data.keys[k] = localStorage.getItem(k); });
    var text = JSON.stringify(data, null, 2);
    var blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'apex-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    toast('Exported ' + found.length + (found.length === 1 ? ' key' : ' keys'));
  }

  function restore(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var data;
      try {
        data = JSON.parse(String(reader.result));
      } catch (err) {
        toast('That file is not valid JSON');
        return;
      }
      var map = data && (data.keys || data);
      if (!map || typeof map !== 'object' || Array.isArray(map)) {
        toast('Expected an Apex Backup file');
        return;
      }
      var names = Object.keys(map).filter(function (k) { return k.indexOf(PREFIX) === 0; });
      if (!names.length) {
        toast('No apex.* keys in that file');
        return;
      }
      if (!window.confirm('Restore ' + names.length + ' key' + (names.length === 1 ? '' : 's') +
        '? Existing keys with the same name will be replaced.')) {
        return;
      }
      var failed = 0;
      names.forEach(function (k) {
        try {
          localStorage.setItem(k, String(map[k]));
        } catch (err) {
          failed++;
        }
      });
      render();
      toast(failed ? 'Restored with ' + failed + ' failure' + (failed === 1 ? '' : 's') : 'Restored ' + names.length + (names.length === 1 ? ' key' : ' keys'));
    };
    reader.readAsText(file);
  }

  function wipe() {
    var found = keys();
    if (!found.length) {
      toast('There is no Apex data to clear');
      return;
    }
    if (!window.confirm('Delete all ' + found.length + ' apex.* keys from this browser? Export a backup first if you want them back.')) {
      return;
    }
    found.forEach(function (k) { localStorage.removeItem(k); });
    render();
    toast('Cleared ' + found.length + (found.length === 1 ? ' key' : ' keys'));
  }

  document.getElementById('exportBtn').addEventListener('click', exportBackup);
  document.getElementById('importBtn').addEventListener('click', function () { el.file.click(); });
  document.getElementById('importBtn2').addEventListener('click', function () { el.file.click(); });
  document.getElementById('wipeBtn').addEventListener('click', wipe);
  el.file.addEventListener('change', function () {
    var file = el.file.files && el.file.files[0];
    if (file) restore(file);
    el.file.value = '';
  });

  render();
  window.addEventListener('storage', render);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }
})();
