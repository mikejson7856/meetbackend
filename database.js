import mongoose  from 'mongoose'

const mongouri='mongodb+srv://monamak426:MGxdusgeVrZdHxoH@database.umouihz.mongodb.net/meetdatabase?retryWrites=true&w=majority&appName=database'

// const mongouri="mongodb+srv://kha9647:Pde8cK7X6syC2No3@cluster0.8da30na.mongodb.net/testdatabase?retryWrites=true&w=majority&appName=Cluster0"

// const mongouri="mongodb+srv://kha9647:Pde8cK7X6syC2No3@cluster0.pgpstkd.mongodb.net/smsdatabase?retryWrites=true&w=majority&appName=Cluster0"
 
const connectDB = () => {

    mongoose.connect(mongouri
    ).then((result) => {
        console.log('mongo connected');
    })
        .catch((err) => { console.log(err) });
}

export default connectDB



