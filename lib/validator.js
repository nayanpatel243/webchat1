const revalidator = require('lx-valid');


module.exports = function(req, schema){
  let body = Object.assign({}, req.body);
  let result = revalidator.validate(body, schema);
  if (result.valid) {
    return false;
  }
  
  let error = {};
  error.success = false;
  error.message = schema.message || 'Validation failed' ;
  error.errors = result.errors.map(error => {
    return {
      path: error.property,
      value: req.body[error.property],
      message: `${error.property} ${error.message}`
    };
  });

return error;
}