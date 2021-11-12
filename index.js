const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
var MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000

//middleWare
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tz5xn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
        await client.connect();
        console.log('database connected successfully')
        const database = client.db('cars_sales')
        const servicesCollection =database.collection('services')
        const carsCollection = database.collection('cars')
        const ordersCollection = database.collection('orders')
        const userCollection = database.collection('users')
        

      //get data
      app.get('/services', async (req, res) =>{
        const cursor = servicesCollection.find({});
        const services = await cursor.toArray();
        res.send(services)
      });

      app.get('/cars', async (req, res) =>{
        const cursor = carsCollection.find({});
        const cars = await cursor.toArray();
        res.send(cars)
      });

      app.get('/orders', async(req, res) =>{
        const email = req.query.email;
        const query = {email: email}
        console.log(query)
        const cursor = ordersCollection.find(query);
        const order = cursor.toArray();
        res.json(order)
      });

      app.get('/users/:email', async(req, res) =>{
        const email = req.params.email;
        const query ={email: email };
         const user = await userCollection.findOne(query);
         let isAdmin = false;
         if(user?.role === 'admin'){
           isAdmin = true;
         }
         res.json({admin: isAdmin});
      })
       
      //post api
      app.post('/cars', async (req, res)=>{
        const car = req.body;
        console.log('hit the post', car)
        const result = await carsCollection.insertOne(car)
        console.log(result)
        res.json(result)
      })

      app.post('/orders', async (req, res) =>{
         const order = req.body;
         const result = await ordersCollection.insertOne(order)
         res.json(result)
      })
      // saved user
      app.post('/users', async (req, res) =>{
        const user = req.body;
        const result = await userCollection.insertOne(user);
        console.log(result)
        res.json(result);
      })

      app.put('/users', async(req, res) =>{
        const user = req.body;
        const filter = {email: user.email };
        const options = { upsert: true };
        const updateDoc = {$set: user}
        const result = await userCollection.updateOne(filter, updateDoc, options)
        res.json(result)
      })

      app.put('/users/admin', async (req, res) =>{
        const user = req.body;
        console.log('put', user);
        const filter = {email: user.email}
        const updateDoc = {$set: {role: 'admin'}};
        const result = await userCollection.updateOne(filter, updateDoc);
        res.json(result)
      })

      //delete api
      app.delete('/cars/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const result = await carsCollection.deleteOne(query)
      
        res.json(result)
      })
   
        
      }

  

    finally{
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello Car World!')
})

app.listen(port, () => {
  console.log(`Listing at ${port}`)
})