function generalUtils() {
  const CustomError = function CustomError(message) {
    this.name = 'CustomError';
    this.message = message || '';
    const error = new Error(this.message);
    error.name = this.name;
    this.stack = error.stack;
  };
  CustomError.prototype = Object.create(Error.prototype);
}

generalUtils.prototype.jsonToGetParams = function (obj) {
  const str = [];
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
    }
  }
  return str.join('&');
};

generalUtils.prototype.getClientIp = function (req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0]
        || req.connection.remoteAddress;
};

generalUtils.prototype.getClientUserAgent = function (req) {
  return req.headers['user-agent'];
};

generalUtils.prototype.getRandomNumberFromRange = function (start, end) {
  return Math.floor(Math.random() * end) + start;
};

generalUtils.prototype.getRandomArbitrary = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

generalUtils.prototype.getRandomStringOfLength = function (length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)); }

  return text;
};

generalUtils.prototype.getRandomNumberofLength = function (length) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1));
};

module.exports = new generalUtils();

