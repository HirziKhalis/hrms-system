export async function paginateQuery(pool, baseQuery, countQuery, params = [], page = 1, limit = 10) {
  const offset = (page - 1) * limit;

  // Append LIMIT and OFFSET to the main query
  const paginatedQuery = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const result = await pool.query(paginatedQuery, [...params, limit, offset]);

  // Count total rows (optional: reuse logic if this gets repetitive)
  const countResult = await pool.query(countQuery, params);
  const totalRows = parseInt(countResult.rows[0].count);

  return {
    data: result.rows,
    totalRows,
    currentPage: page,
    totalPages: Math.ceil(totalRows / limit),
  };
}
