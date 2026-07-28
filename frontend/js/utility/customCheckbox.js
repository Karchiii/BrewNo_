require('../common');

/**
 * Converts checkbox to Visual green-red buttons checkbox
 * @param selector  checkbox elements selector
 * @param on   function to be called if checkbox is on
 * @param off function to be called if checkbox is off
 */
function customCheckBox(selector, on, off) {
  const $checkBoxes = $(selector);
  if ($checkBoxes.length == 0) return;
  on = on || function () {
  };
  off = off || function () {
  };
  if ($checkBoxes.attr('type') == 'checkbox') {
    $checkBoxes.each(function () {
      const $this = $(this);
      const customCheck = $('<span/>').addClass('custom-check');
      const $button = $('<button/>').addClass('btn btn-sm smooth-transition');
      const chkIco = $('<span/>').addClass('glyphicon glyphicon-unchecked');
      const $label = $(`label[for="${$this.attr('id')}"]`);
      $button
        .data({
          rel: $this.data('rel'),
          'rel-value': $this.data('id'),
        })
        .addClass($this.val() == 'true' ? 'btn-success' : 'btn-danger')
        .append(chkIco);

      $this.wrap();
      customCheck.insertBefore($this);

      $this.attr('type', 'hidden');

      customCheck.append($button, $this);
      customCheck[0].button = $button;
      customCheck[0].input = $this;


      customCheck.on('click', function () {
        const $button = $(this)[0].button;
        const $input = $(this)[0].input;
        if ($input.val() == 'true') {
          $input.val('false');
          $button.data('active', 'true');
          off.call(this);
          $button.removeClass('btn-success').addClass('btn-danger');
        } else {
          $input.val('true');
          $button.data('active', 'false');
          on.call(this);
          $button.removeClass('btn-danger').addClass('btn-success');
        }
      });

      if ($label) {
        $label.on('click', () => {
          customCheck.trigger('click');
        });
        //	console.log($label)
      } else {
        //	console.log($label)
      }
    });
  } else {
    console.warn('only input type="checkbox" will be applied!');
  }
}
