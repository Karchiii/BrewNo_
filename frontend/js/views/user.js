/**
 * ************************************************************************
 * Controls all Automation Tasks user interaction at /user
 * ************************************************************************
 */
import '../../styles/user.scss';

require('../common');

(function ($) {
  const $preloader = $('#preloader');
  $preloader.hide();

  $('[data-tooltip="true"]').tooltip();
}(jQuery));
