const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wq4ks.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri)

async function run() {

    try {

        await client.connect();
        const database = client.db('ourShop');
        const serviceCollection = database.collection('allProduct');
        const userCollection = database.collection('User Collection')
        const userBookingCollection = database.collection('UserBooking');
        const userReviewCollection = database.collection('userReview');


        // All Get API
        // GET API
        app.get('/addProduct', async (req, res) => {
            const cursor = serviceCollection.find({});
            const allProduct = await cursor.toArray();
            res.send(allProduct);
        })

        // Get sigle Service Details
        app.get('/addProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.json(service);
        })

        // GET USER Booking
        app.get('/myBooking/:email', async (req, res) => {
            const email = req.params.email;
            const cursor = userBookingCollection.find({ email });
            const services = await cursor.toArray();
            res.send(services);
        })

        // GET ALL User Booking
        app.get("/allEvents", async (req, res) => {
            const result = await userBookingCollection.find({}).toArray();
            res.send(result);
        });

        // GET All User Review 
        app.get('/userReview', async (req, res) => {
            const result = await userReviewCollection.find({}).toArray();
            res.send(result)
        })

        // GET All Products 
        app.get('/allServices', async (req, res) => {
            const result = await serviceCollection.find({}).toArray();
            res.send(result)
        })

        // Admin Filter 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })



        // ALL DELETE API ************

        // Delete Single user Booking
        app.delete('/myBooking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userBookingCollection.deleteOne(query);
            res.json(result)
        })

        // Delete All Manage Products
        app.delete('/allEvents/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await userBookingCollection.deleteOne(query);
            console.log('Delete ')
            res.json(result)
        })

        // Delete All Services
        app.delete('/allServices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.json(result);
        })



        // ALL POST API **********

        // Post API
        app.post('/addProduct', async (req, res) => {
            const addProduct = req.body;
            const result = await serviceCollection.insertOne(addProduct);
            res.json(result)
            console.log(result)
        })

        // Add Buy Api
        app.post('/userBook', async (req, res) => {
            const booking = req.body;
            const result = await userBookingCollection.insertOne(booking);
            res.json(result);
        });

        // POST USER API
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await userCollection.insertOne(users);
            res.json(result);
        })

        // POST Review API
        app.post('/userReview', async (req, res) => {
            const review = req.body;
            const result = await userReviewCollection.insertOne(review);
            res.json(result);
        })


        // All PUT API ******************

        // Put Google User API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user._id };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            console.log(result)
            res.json(result);
        })



        // ALL PUT API ***********
        // Make Admin API
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log('PUT', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

        // Suatus Update API
        app.put("/statusUpdate/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            console.log(req.params.id);
            const result = await userBookingCollection.updateOne(filter, {
                $set: {
                    status: req.body.status,
                },
            });
            res.send(result);
            console.log(result);
        });




    }

    finally {

    }

}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Cars Server Running !!!')
});

app.listen(port, () => {
    console.log(`Example App Listening At http://localhost:${port} Working`)
})