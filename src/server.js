import express from 'express'
import bodyparser, { json } from 'body-parser'
import mongoClient from 'mongodb'
/*
const articlesInfo={
        'learn-react':{
            upvotes: 0,
            comments:[]
        },
        'learn-node':{
            upvotes: 0,
            comments:[]
        },'my-thoghts-on-resumes':{
            upvotes: 0,
            comments:[]
        }
}
*/

const app = express()
app.use(bodyparser.json())
const uri = "mongodb+srv://pravendra:hathras1@cluster0-rrhcm.mongodb.net/my-blog?retryWrites=true&w=majority";

const withDB = async (operation) => {
    try {
        const client = await mongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const db = client.db('my-blog')
        await operation(db);
        client.close();
    }
    catch (error) {
        res.status(500).json({ message: `something went wrong: ${error}` })
    }
}

app.get('/api/articles/:name', async (req, res) => {
    const articleName = req.params.name
    withDB(async (db) => {
        const articleInfo = await db.collection('articles').findOne({ name: articleName })
        res.status(200).json(articleInfo)
    });

})

app.post('/api/articles/:name/upvote', async (req, res) => {
        const articleName = req.params.name
        withDB(async (db) => {
            let articleInfo = await db.collection('articles').findOne({ name: articleName })

            var myquery = { name: articleName };
            var newvalues = { $set: { upvotes: articleInfo.upvotes + 1 } };

            await db.collection('articles').updateOne(myquery, newvalues)
            articleInfo = await db.collection('articles').findOne({ name: articleName })
            res.status(200).json(articleInfo)
        });
        //articlesInfo[articleName].upvotes+=1

        //res.status(200).send(`Article ${articleName} now has ${articlesInfo[articleName].upvotes} upvotes`)
})

app.post('/api/articles/:name/add-comment', async (req, res) => {

    const articleName = req.params.name
    const { username, comment } = req.body

    withDB(async (db) => {
        let articleInfo = await db.collection('articles').findOne({ name: articleName })

        var myquery = { name: articleName };
        var newvalues = { $set: { comments: articleInfo.comments.concat({ username, comment }) } };

        await db.collection('articles').updateOne(myquery, newvalues)
        articleInfo = await db.collection('articles').findOne({ name: articleName })
        res.status(200).json(articleInfo)
    });

        //articlesInfo[articleName].comments.push({username,comment})
        //res.status(200).send(articlesInfo[articleName])
   
})


//Register Form: Post
app.post('/api/workwithus/register', async (req, res) => {
    const { name, mobilenumber, emailid, experienceon, location } = req.body
    withDB( async (db) => {
        var newvalue = { name, mobilenumber, emailid, experienceon, location };   
        const result = await db.collection('users').insertOne(newvalue)
        //console.log("inserted record is: ")
        //console.log(result.ops[0])
        res.status(200).json(`${name} registered successfully!`)
    });

})


app.listen(8000, () => console.log('server is running on 8000 port'))