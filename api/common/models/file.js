'use strict';

module.exports = function(File) {
  File.validatesNumericalityOf('size',
    {int: true, message: {int: 'size must be integer'}});
};
