require('dotenv').config('path:env');
const app = require('./src/app.js')
const connectDB = require('./src/db/db.js');

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log(error);
        throw error;
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.error(`MongoDB conenction failed ${err}`);
    throw err;
})