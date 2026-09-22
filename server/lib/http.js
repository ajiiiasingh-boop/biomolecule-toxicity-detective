/**
 * http.js — small helpers so every route reports problems the same way.
 */

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (what, id) =>
  new ApiError(404, 'not_found', `No ${what} with id "${id}".`);

export const badRequest = (message, details) =>
  new ApiError(400, 'bad_request', message, details);

/** Wraps an async route handler so a rejected promise reaches the error handler. */
export const route = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

/**
 * Validates that `value` is one of `allowed`, and throws a 400 naming the
 * legal values if not. Keeps the answer checker honest: an id that is not in
 * the shared taxonomy is a client bug, not a wrong answer.
 */
export function mustBeOneOf(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw badRequest(`"${field}" must be one of the known ids.`, {
      field,
      received: value ?? null,
      allowed
    });
  }
  return value;
}
