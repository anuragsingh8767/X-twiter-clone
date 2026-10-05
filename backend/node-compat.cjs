const { Buffer } = require('buffer');

if (!require('buffer').SlowBuffer) {
  Object.defineProperty(require('buffer'), 'SlowBuffer', {
    value: Buffer,
    configurable: true,
    writable: true,
  });
}
