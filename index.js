'use strict';

exports.after = function(promise, delay) {
  const Ctor = promise.constructor;

  let settled = false;

  let timer = null;
  const expired = new Promise(function(resolve) {
    timer = setTimeout(function() {
      if (!settled) {
        settled = true;
        resolve();
      }
    }, delay);
  });

  const ret = new Ctor(function(resolve, reject) {
    promise.then(function(value) {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    }, function(reason) {
      if (!settled) {
        settled = true;
        reject(reason);
      }
    });
  });

  const finalized = Promise.race([expired, ret]);

  const registerExpiryHandler = function(handler) {
    return new Ctor(function(resolve, reject) {
      expired.then(function() {
        try {
          handler(resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const registerFinallyHandler = function(handler) {
    const invoke = function() {
      handler();
    };

    finalized.then(invoke, invoke);
  };

  return {
    expired: registerExpiryHandler,
    finally: registerFinallyHandler,
    promise: ret,
    timer: timer,
  };
};
