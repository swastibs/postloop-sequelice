exports.paginate = async ({
  model,
  where = {},
  page = 1,
  limit = 10,
  include = [],
  order = [["createdAt", "DESC"]],
}) => {
  page = parseInt(page) || 1;
  limit = Math.min(parseInt(limit) || 10, 50);

  const offset = (page - 1) * limit;

  const { count: totalRecords, rows } = await model.findAndCountAll({
    where,
    limit,
    offset,
    include,
    order,
  });

  const totalPages = Math.max(Math.ceil(totalRecords / limit), 1);

  const safePage = page > totalPages ? totalPages : page;

  return {
    data: rows,
    pagination: {
      totalRecords,
      totalPages,
      currentPage: safePage,
      limit,
    },
  };
};
