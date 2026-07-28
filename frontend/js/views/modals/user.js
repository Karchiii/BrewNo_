require('../../common');

(function ($) {
  const fa = new flashAlert('#missingFields');

  $('input[name=passwordConfirm]').prop('disabled', true);

  if ($('input[name=password]').prop('required') == false) {
    $('input[name=password]').prop('placeholder', 'Change password is optional');
  }

  $('input[name=password]').on('input', () => {
    if ($('input[name=password]').val().length > 0) {
      $('input[name=passwordConfirm]').prop('disabled', false);
    } else {
      $('input[name=passwordConfirm]').prop('value', '');
      $('input[name=passwordConfirm]').prop('disabled', true);
    }
  });

  $('#userForm').validator().on('submit', (e) => {
    if (e.isDefaultPrevented()) {
      // handle the invalid form...
    } else {
      // everything looks good!
      e.preventDefault();
      let id = $('#selectedID').val();
      if (id === '') id = 'null';

      if (id === 'null') {
        var url = `/user/create/${id}`;
      } else {
        var url = `/user/update/${id}`;
      }

      const options = [];
      $('.optionValue').each((index, item) => {
        switch ($(item).attr('type')) {
          case 'text':
            options.push({ name: $(item).attr('name'), value: $(item).val() });
            break;
          case 'password':
            options.push({ name: $(item).attr('name'), value: $(item).val() });
            break;
          case 'select':
            options.push({ name: $(item).attr('name'), value: $(item).val() });
            break;
        }
      });

      if ($('input[name=password]').val() == $('input[name=passwordConfirm]').val()) {
        $.post(url, { options })
          .then((data) => {
            if (data.error) {
              fa.danger(data.result);
            } else {
              window.location.reload();
            }
          })
          .fail((err) => {
            fa.danger(err.statusText);
          });
      } else {
        fa.danger("Password confirm doesn't match!");
      }
    }
  });

  $('#userForm').validator('update');
}(jQuery));
