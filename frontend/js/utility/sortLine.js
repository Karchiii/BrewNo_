require('../common');

/**
 * Created by db on 21.06.2017.
 */
/**
 * ************************************************************************
 * Controls Sortable Lines
 * ************************************************************************
 */
(function ($) {
  $('.sortLine').click((e) => {
    const target = $(e.currentTarget);
    const sortName = target.attr('data-name');
    console.log(`SORT BY ${sortName}`);
    function getUrlVars() {
      const vars = {};
      const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        (m, key, value) => {
          vars[key] = value;
        });
      return vars;
    }

    let dataTarget = target.attr('data-target');
    if (dataTarget === '') {
      dataTarget = window.location.pathname;
    }


    let queryString = `${dataTarget}?sort=${encodeURIComponent(sortName)}`;

    if (getUrlVars().sort) {
      if (getUrlVars().sort.indexOf('-') === -1 && getUrlVars().sort === encodeURIComponent(sortName)) {
        queryString = `${dataTarget}?sort=-${encodeURIComponent(sortName)}`;
      }
    }

    if (getUrlVars().search) {
      const searchVal = getUrlVars().search;
      queryString += `&search=${searchVal}`;
    }
    if (getUrlVars().contractID) {
      const { contractID } = getUrlVars();
      queryString += `&contractID=${contractID}`;
    }
    window.location = queryString;
  });
}(jQuery));
