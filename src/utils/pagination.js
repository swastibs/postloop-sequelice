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

  // First get total count
  const { count: totalRecords } = await model.findAndCountAll({
    where,
  });

  const totalPages = Math.max(Math.ceil(totalRecords / limit), 1);

  // Clamp page BEFORE querying data
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const offset = (safePage - 1) * limit;

  const { rows } = await model.findAndCountAll({
    where,
    limit,
    offset,
    include,
    order,
  });

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
