import HttpError from "../utils/http-error.js";

const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next(
      new HttpError(400, "Validation failed", result.error.flatten().fieldErrors)
    );
  }

  req.body = result.data;
  return next();
};

export default validate;
