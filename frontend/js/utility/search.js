require('../common');

/**
 * ************************************************************************
 * Controls Search Fields
 * ************************************************************************
*/
(function ($) {
  $('button[data-toggle="search"]').click((e) => {
    const target = $(e.currentTarget);
    const searchField = $(`#${target.attr('data-value')}`);
    let limit = 999;
    if (target.attr('data-limit')) limit = target.attr('data-limit');
    window.location = `${target.attr('data-target')}?search=${encodeURIComponent(searchField.val())}&limit=${limit}`;
  });
  $('.searchField').keyup(function (e) {
    if (e.keyCode === 13) {
      $(this).parent().children('.btn-search').trigger('click');
    }
  });
}(jQuery));
