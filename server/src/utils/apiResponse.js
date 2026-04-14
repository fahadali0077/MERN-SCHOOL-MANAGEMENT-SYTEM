/**
 * Standard API Response Helpers
 * All responses follow the envelope pattern:
 * { success, data, message, pagination }
 */

const successResponse = (res, data, message = 'Success', statusCode = 200, pagination = null) => {
  const response = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const paginationHelper = (page = 1, limit = 25, total = 0) => ({
  page: parseInt(page),
  limit: parseInt(limit),
  total,
  pages: Math.ceil(total / parseInt(limit))
});

const buildQuery = (queryParams) => {
  const { page = 1, limit = 25, search, sortBy = 'createdAt', order = 'desc', ...filters } = queryParams;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };
  
  // Build filter object from filter[field]=value params
  const filterQuery = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (key.startsWith('filter[') && key.endsWith(']')) {
      const field = key.slice(7, -1);
      filterQuery[field] = value;
    }
  });

  return { skip, limit: parseInt(limit), sort, page: parseInt(page), filterQuery, search };
};

module.exports = { successResponse, errorResponse, paginationHelper, buildQuery };
