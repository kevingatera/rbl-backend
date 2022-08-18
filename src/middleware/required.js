import { HttpException } from "./errors";

/* istanbul ignore next */
const auth = (req, res, next) => {
  const { authUser } = req;

  if (!authUser) {
    return next(new HttpException(401, 'YOU_MUST_LOGIN'));
  }

  next();
};

/***
 * Makes Sure that the request has all the required parameters.
 */
const reqData = reqKey => (...args) => (req, res, next) => {
  let missingParam = false;
  const reqObj = req[reqKey];
  args.forEach(param => {
    if (!reqObj[param]) {
      missingParam = true;
    }
  });
  if (missingParam) {
    return res.status(422).json({ errorKey: 'INVALID_REQUEST' });
  }
  return next();
};

const params = reqData('params');
const query = reqData('query');
const body = reqData('body');

export default { auth, params, query, body };
