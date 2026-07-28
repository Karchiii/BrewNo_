module.exports = (options, content) => new Promise((resolve) => {
  options = options || {};

  const results = [];

  const currentPage = Number(options.page) || 1;
  const resultsPerPage = Number(options.perPage) || 50;
  const maxPages = Number(options.maxPages) || 10;
  const skip = (currentPage - 1) * resultsPerPage;
  const totalPages = Math.ceil(content.length / resultsPerPage);
  const rest = content.length - skip;

  if (rest >= resultsPerPage) {
    end = skip + resultsPerPage;
  } else {
    end = skip + rest;
  }

  let k = 0;

  for (let i = skip; i < end; i++) {
    results[k] = content[i];
    k++;
  }

  const rtn = {
    total: content.length,
    results,
    currentPage,
    totalPages,
    pages: [],
    previous: (currentPage > 1) ? (currentPage - 1) : false,
    next: (currentPage < totalPages) ? (currentPage + 1) : false,
    first: skip + 1,
    last: skip + results.length,
  };

  getPages(rtn, maxPages);

  resolve(rtn);
});

const getPages = (options, maxPages) => {
  const surround = Math.floor(maxPages / 2);
  let firstPage = maxPages ? Math.max(1, options.currentPage - surround) : 1;
  const padRight = Math.max(((options.currentPage - surround) - 1) * -1, 0);
  const lastPage = maxPages ? Math.min(options.totalPages, options.currentPage + surround + padRight) : options.totalPages;
  const padLeft = Math.max(((options.currentPage + surround) - lastPage), 0);
  options.pages = [];
  firstPage = Math.max(Math.min(firstPage, firstPage - padLeft), 1);
  for (let i = firstPage; i <= lastPage; i++) {
    options.pages.push(i);
  }
  if (firstPage !== 1) {
    options.pages.shift();
    options.pages.unshift('...');
  }
  if (lastPage !== Number(options.totalPages)) {
    options.pages.pop();
    options.pages.push('...');
  }
};
