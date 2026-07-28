/**
 * ************************************************************************
 * Refresh site on delete.
 * ************************************************************************
 */
import '../../styles/trash.scss';

require('../common');

(function ($) {
  const socket = io.connect(window.location.origin);

  socket.on('trash', (data) => {
    window.location.reload();
  });
}(jQuery));
