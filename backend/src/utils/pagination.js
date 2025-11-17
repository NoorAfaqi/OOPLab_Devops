/**
 * Safely parse and limit pagination parameters to prevent DoS attacks
 * @param {number|string} page - Page number from query
 * @param {number|string} limit - Items per page from query
 * @param {object} options - Configuration options
 * @returns {object} - {page, limit, offset}
 */
function parsePagination(page, limit, options = {}) {
  const {
    minPage = 1,
    maxPage = 1000,
    defaultPage = 1,
    minLimit = 1,
    maxLimit = 100,
    defaultLimit = 10
  } = options;

  // Parse and validate page
  let parsedPage = parseInt(page, 10);
  if (isNaN(parsedPage) || parsedPage < minPage) {
    parsedPage = defaultPage;
  } else if (parsedPage > maxPage) {
    parsedPage = maxPage;
  }

  // Parse and validate limit
  let parsedLimit = parseInt(limit, 10);
  if (isNaN(parsedLimit) || parsedLimit < minLimit) {
    parsedLimit = defaultLimit;
  } else if (parsedLimit > maxLimit) {
    parsedLimit = maxLimit;
  }

  // Calculate offset
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset
  };
}

/**
 * Validate and sanitize sort parameters
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort direction (ASC/DESC)
 * @param {array} allowedFields - List of allowed fields
 * @returns {object} - {sortBy, sortOrder}
 */
function parseSortParams(sortBy, sortOrder, allowedFields = []) {
  let validatedSortBy = sortBy;
  if (!allowedFields.length || !allowedFields.includes(sortBy)) {
    validatedSortBy = 'createdAt'; // Default
  }

  let validatedSortOrder = (sortOrder || 'DESC').toUpperCase();
  if (!['ASC', 'DESC'].includes(validatedSortOrder)) {
    validatedSortOrder = 'DESC';
  }

  return {
    sortBy: validatedSortBy,
    sortOrder: validatedSortOrder
  };
}

module.exports = {
  parsePagination,
  parseSortParams
};

