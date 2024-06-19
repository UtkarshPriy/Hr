import mongoose from 'mongoose';
const dbUrl = process.env.DB_URL || 'mongodb://localhost/skill_3';
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on('error',console.error.bind(console,'error connecting db'));

db.once('open',()=>{
    console.log('db connected!!')
});

export default db;