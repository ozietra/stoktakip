exports.getPagination = (page, size) => {
  const limit = size ? parseInt(size) : parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
  const offset = page ? (parseInt(page) - 1) * limit : 0;
  
  return { limit, offset };
};

exports.getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? parseInt(page) : 1;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems,
    items,
    totalPages,
    currentPage,
    pageSize: limit
  };
};

