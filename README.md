# steadfast

Reliable handling of perpetually pending promises.

Requires native support for `Promise`, `const` and `let`.

## Installation

```
npm install steadfast
```

## API

### `steadfast.after(promise, delay)`

Allows you to observe whether the `promise` settles within the required time
`delay`, specified in milliseconds.

Returns an object with a new promise that is settled the same way as `promise`,
but remains pending if the timeout is reached first.

The returned object also has an `expired()` method. It takes a `handler`
function and returns a promise. The handler is called if the timeout is reached
before the original `promise` settled. It's passed `resolve` and `reject`
functions that can be used to settle the promise returned when calling
`expired()`. The returned promise is rejected if the handler throws an error.

The returned object also has an `finally()` method. It takes a `handler`
function and has no return value. The handler is called when the timeout is
reached or the original `promise` settles (whichever occurs first).

`setTimeout` is used internally. Consequently the timeout may be triggered a
little sooner or a little later than specified.

The timer is available on the returned object as `timer`. In io.js you could
call [`unref()`](https://iojs.org/api/timers.html#timers_unref) on the timer so
it won't unnecessarily keep the program running. Please read the io.js
documentation carefully, caveats emptor.

Returned promises are created through `new promise.constructor()`, meaning
Steadfast can be used with non-native Promise implementations.

#### Example

```js
const steadfast = require('steadfast');

const pending = new Promise(function(resolve) {
  setTimeout(function() {
    resolve('hi');
  }, 2000);
});

// expired() returns a promise that itself remains pending
steadfast.after(pending, 1000).expired(function() {
  console.log('pending expired after 1 second');
});

// here the promise is fulfilled
steadfast.after(pending, 1000).expired(function(resolve) {
  resolve('expired');
}).then(console.log);

// pending settles before the timeout, so it never expires
steadfast.after(pending, 5000).expired(function() {
  console.log('never called');
});

// pending settles before the timeout, so the promise settles the same way
steadfast.after(pending, 5000).promise.then(console.log);

// pending settles after the timeout, so the promise remains pending
steadfast.after(pending, 1000).promise.then(console.log);

// the handler is called when pending settles before the timeout
steadfast.after(pending, 5000).finally(function() {
  console.log('finally');
});

// the handler is called after the timeout
steadfast.after(pending, 1000).finally(function() {
  console.log('finally');
});

// unref() the timer so the process can exit early
steadfast.after(pending, 5000).timer.unref();
```

## License

ISC
