// async handler wrapper
//! promise asyncHandler wrapper
const asyncHandler = (fn)=>{
    return (req,res,next)=>{
        Promise.resolve(fn(req,res,next)).catch((err)=>{
            next(err);  
        })
    }
}
//! why asyncHandler is needed?
// asyncHandler exists purely to catch errors from async route handlers and forward them to Express's error-handling middleware, so you don't have to write try/catch inside every single controller function.
// If everything inside works fine → the Promise resolves → .catch() never fires → response already sent via res.json(...) inside your function → done.
// If something throws (bad DB query, invalid signature, etc.) → the Promise rejects → .catch((err) => next(err)) fires → Express routes it to your error middleware → you log it and send a clean error response.


//* function control
// fn(req, res, next) calls your original async handler. Since it's an async function, calling it always returns a Promise.
// Promise.resolve(...) wraps that in a promise explicitly. This is a safety net — even if fn were a regular (non-async) function that returns a plain value instead of a promise, Promise.resolve() normalizes it into a promise so .catch() works reliably either way.
// .catch((err) => next(err)) — if the promise rejects (meaning something inside fn threw or a awaited call failed), the error is passed to Express's next() function.
// Passing an error to next(err) tells Express "an error occurred," which routes it to your error-handling middleware (app.use((err, req, res, next) => {...})), instead of crashing or hanging.

//* flow 
// Request comes in
//       │
//       ▼
// asyncHandler's returned function runs
//       │
//       ▼
// fn(req, res, next) is called → returns a Promise
//       │
//       ├── resolves normally → response already sent inside fn, done
//       │
//       └── rejects (error thrown) → .catch() fires → next(err) → Express error middleware

//* error handling using next(err)
//? Step 1: next(err) signals an error to Express
// When you call next() with an argument, Express treats it specially. next() alone means "move to the next middleware normally." But next(err) means "skip all remaining normal middleware/routes, and jump straight to error-handling middleware."
//? Step 2: Express looks for error-handling middleware
// Error-handling middleware in Express is defined with 4 parameters instead of the usual 3:
// app.use((err, req, res, next) => {
//    this is an error handler because it has 4 args
// });

//* flow of error
// Now, whenever any asyncHandler-wrapped route throws, the flow is:
// Route throws/rejects
//       │
//       ▼
// asyncHandler's .catch() fires → next(err)
//       │
//       ▼
// Express skips normal routes, finds your 4-arg error middleware
//       │
//       ▼
// console.error(err.stack)  → printed in your terminal
// res.json({...})           → sent to client

// Express detects the 4-arg signature and knows to route errors here.

//! must be defined AFTER all your routes
// app.use((err, req, res, next) => {
//   console.error(err.stack); // logs full stack trace to console

//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error"
//   });
// });

//? Step 3: Your error-handling middleware runs
// Now, what happens in the default Express handler
// If you have no custom 4-arg error middleware, Express's built-in default handler:

// Takes that same err object
// Prints err.stack to your console/terminal — so you'll see the real stack trace, e.g.:

//    Error: Invalid payment signature
//        at /routes/payment.js:14:9
//        at asyncHandler (...)

// Sends a response to the client:
// In development (NODE_ENV not set to production): an HTML page containing the error message + full stack trace
// In production: just 500 Internal Server Error (no details, to avoid leaking internals)

module.exports = asyncHandler


//! try-catch asyncHandler wrapper
// const asyncHandler = () => {};
// const asyncHandler = (fn) => {()=>{}} // here fn is a function so need a function callback
// const asyncHandler = (fn) => ()=>{} // removed the outer curly brackets
// const asyncHandler = (fn) => async ()=>{}

//? const asyncHandler = (fn)=> async (req,res,next)=> {
//     try {
//         await fn(req,res,next);
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }
