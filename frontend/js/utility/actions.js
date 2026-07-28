require('../common');

(function ($) {
  $.ajaxPrefilter((options) => { options.async = true; });

  const fa = new flashAlert('.alertbox');

  function ajaxCall(method, url, next, postData = {}) {
    const preloader = $('#preloader');
    preloader.removeClass('hidden');
    preloader.show();
    $[method](url.join('/'), postData)
      .done((data) => {
        preloader.hide();
        if (next) next(data);
      })
      .fail((err) => {
        preloader.hide();
        console.log('ERROR', err);
        fa.danger(err.responseText);
      });
  }

  $('.action-open').click(function (e) {
    e.preventDefault();
    const self = $(this);
    const id = self.data('id');
    const action = self.data('action');
    const target = self.data('target');
    if (self.data('propagation') !== false) e.stopPropagation();
    if (target) return window.open(`/${action}/${id}`, target);
    window.location.href = `/${action}/${id}`;
    return null;
  });

  $('.action-add').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const self = $(this);
    const folderID = self.data('folder');
    let id = self.data('id');
    if (id === undefined) {
      id = 'null';
    }
    const action = self.data('action');
    let url = [];
    if (folderID !== undefined) {
      url = ['/modal', action, folderID, id];
    } else {
      url = ['/modal', action, id];
    }
    const dialog = $(self.data('target'));
    dialog.html('');
    ajaxCall('get', url, (data) => {
      dialog.html(data);
      dialog.modal('show');
    });
  });

  $('.action-edit').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    const self = $(this);
    const folderID = self.data('folder');
    const id = self.data('id');
    const action = self.data('action');
    let url = [];
    if (folderID !== undefined) {
      url = ['/modal', action, folderID, id];
    } else {
      url = ['/modal', action, id];
    }
    const dialog = $(self.data('target'));
    dialog.html('');
    ajaxCall('get', url, (data) => {
      dialog.html(data);
      dialog.modal('show');
    });
  });

  $('.action-remove').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    const self = $(this);
    const id = self.data('id');
    const action = self.data('action');
    const url = [`/${action}`, 'remove', id];
    ajaxCall('post', url, (data) => {
      if (data.error === false) return window.location.reload();
      fa.danger(data.result);
      return null;
    });
  });  
}(jQuery));
