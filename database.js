import mongoose  from 'mongoose'

const mongouri='mongodb+srv://monamak426:MGxdusgeVrZdHxoH@database.umouihz.mongodb.net/meetdatabase?retryWrites=true&w=majority&appName=database'

// const mongouri ='mongodb://mikejson7856:Xo29r4BIdGff5nFQ@ac-2mrpor8-shard-00-00.yqadcrk.mongodb.net:27017,ac-2mrpor8-shard-00-01.yqadcrk.mongodb.net:27017,ac-2mrpor8-shard-00-02.yqadcrk.mongodb.net:27017/skipdatabase?ssl=true&replicaSet=atlas-tx134a-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0'
const connectDB = () => {

    mongoose.connect(mongouri
    ).then((result) => {
        console.log('mongo connected');
    })
        .catch((err) => { console.log(err) });
}

export default connectDB



