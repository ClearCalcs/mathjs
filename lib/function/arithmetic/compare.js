module.exports = function (math) {
  var util = require('../../util/index'),

      BigNumber = math.type.BigNumber,
      Complex = require('../../type/Complex'),
      Unit = require('../../type/Unit'),
      collection = require('../../type/collection'),

      isNumber = util.number.isNumber,
      isBoolean = util['boolean'].isBoolean,
      isString = util.string.isString,
      isComplex = Complex.isComplex,
      isUnit = Unit.isUnit,
      isCollection = collection.isCollection;

  /**
   * Compare two values. Returns 1 when x > y, -1 when x < y, and 0 when x == y
   * For matrices, the function is evaluated element wise.
   *
   *    compare(x, y)
   *
   * @param  {Number | BigNumber | Boolean | Unit | String | Array | Matrix} x
   * @param  {Number | BigNumber | Boolean | Unit | String | Array | Matrix} y
   * @return {Number | BigNumber | Array | Matrix} res
   */
  math.compare = function compare(x, y) {
    if (arguments.length != 2) {
      throw new util.error.ArgumentsError('compare', arguments.length, 2);
    }

    if (isNumber(x) && isNumber(y)) {
      return (x > y) ? 1 : ((x < y) ? -1 : 0);
    }

    if (x instanceof BigNumber) {
      // try to convert to big number
      if (isNumber(y)) {
        y = BigNumber.convert(y);
      }
      else if (isBoolean(y)) {
        y = new BigNumber(y ? 1 : 0);
      }

      if (y instanceof BigNumber) {
        return new BigNumber(x.cmp(y));
      }

      // downgrade to Number
      return compare(x.toNumber(), y);
    }
    if (y instanceof BigNumber) {
      // try to convert to big number
      if (isNumber(x)) {
        x = BigNumber.convert(x);
      }
      else if (isBoolean(x)) {
        x = new BigNumber(x ? 1 : 0);
      }

      if (x instanceof BigNumber) {
        return new BigNumber(x.cmp(y));
      }

      // downgrade to Number
      return compare(x, y.toNumber());
    }

    if ((isUnit(x)) && (isUnit(y))) {
      if (!x.equalBase(y)) {
        throw new Error('Cannot compare units with different base');
      }
      return (x.value > y.value) ? 1 : ((x.value < y.value) ? -1 : 0);
    }

    if (isCollection(x) || isCollection(y)) {
      return collection.deepMap2(x, y, compare);
    }

    // Note: test strings after testing collections,
    // else we can't compare a string with a matrix
    if (isString(x) || isString(y)) {
      return (x > y) ? 1 : ((x < y) ? -1 : 0);
    }

    if (isBoolean(x)) {
      return compare(+x, y);
    }
    if (isBoolean(y)) {
      return compare(x, +y);
    }

    if (isComplex(x) || isComplex(y)) {
      throw new TypeError('No ordering relation is defined for complex numbers');
    }

    throw new math.error.UnsupportedTypeError('compare', math['typeof'](x), math['typeof'](y));
  };
};