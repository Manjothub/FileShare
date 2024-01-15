const express = require('express');
const app = express();
const  connectDB = require('./config/db')
const path = require('path');
const cors = require('cors');
connectDB();
// Template Engine


const PORT = process.env.PORT || 3000;
// Cors
const corsOptions = {
    origin: process.env.ALLOWED_CLIENTS.split(',')
    
}
app.use(cors(corsOptions));
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');
app.use(express.static('public'))
app.use(express.json());



// Routes Information

app.use('/api/files',require('./routes/files'));
app.use('/files',require('./routes/show'));
app.use('/files/download',require('./routes/download'));

app.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})