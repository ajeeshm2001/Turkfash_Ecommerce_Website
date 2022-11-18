const mongoClient = require('mongodb').MongoClient
const state = {
    db:null
}

module.exports.connect=(done)=>{
    const url='mongodb+srv://ajeesh2001:Ajeesh%40123@cluster0.susfc04.mongodb.net/test'
    const dbname = 'turkfash'

    mongoClient.connect(url,(err,data)=>{
        if(err){
            return done(err)
        }
        state.db=data.db(dbname)
    })
    done()
}
module.exports.get=()=>{
    return state.db
}