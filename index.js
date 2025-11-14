const express = require('express')
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const cors=require('cors')
require('dotenv').config()
const app = express()
const port = 3000
app.use(cors())
app.use(express.json())

// MONGO DB CONNECT


const uri = `mongodb+srv://${process.env.DB_UserName}:${process.env.DB_Password}@cluster0.1djote4.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db=client.db('krishi-App-db')
    const krishiCollection=db.collection('crops')

  app.get('/crops', async (req, res) => {
      const crops = await krishiCollection.find().toArray();
      res.send(crops);
    });

    // latest-data

  
app.get('/crops/latest', async (req, res) => {
  try {
    const crops = krishiCollection
      .find()
      .sort({ _id: -1 })  
      .limit(4);          
    const cropsArray = await crops.toArray();
    res.send(cropsArray);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch latest crops", error });
  }
});
  // single crop api

  app.get('/crops/:id', async (req, res) => {
      const {id} = req.params;
      const query = { _id: new ObjectId(id) };
      const crop = await krishiCollection.findOne(query);
      res.send(crop);
    });

    // interestAPI

    app.post("/crops/:id/interest", async (req, res) => {
  try {
    const cropId = req.params.id;
    const interest = req.body;

    const interestId = new ObjectId();
    const newInterest = { _id: interestId, ...interest };

    const result = await krishiCollection.updateOne(
      { _id: new ObjectId(cropId) },
      { $push: { interests: newInterest } }
    );


    res.send({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: error.message });
  }
});



app.get("/interests", async (req, res) => {
  const crops = await krishiCollection.find().toArray();

  // isorting-api
  app.get("/interests", async (req, res) => {
  const email = req.query.email;

  const userInterests = await cropsCollection
    .aggregate([
      { $unwind: "$interests" },
      { $match: { "interests.userEmail": email } },
      {
        $project: {
          _id: "$interests._id",
          cropName: "$name",
          quantity: "$interests.quantity",
          message: "$interests.message",
          status: "$interests.status",
          createdAt: "$interests.createdAt"
        }
      }
    ])
    .toArray();

  res.send(userInterests);
});

  



  
  const allInterests = crops.flatMap(crop => {
    return crop.interests?.map(int => ({
      ...int,
      cropName: crop.name,
      cropImage: crop.image,
      cropLocation: crop.location
    })) || [];
  });

  res.send(allInterests);
});


// CRUD

app.post("/crops", async (req, res) => {
  const crop = req.body;
  const result = await krishiCollection.insertOne(crop);
  res.send(result);
});

app.put("/crops/:id", async (req, res) => {
  const id = req.params.id;
  const updated = req.body;
  const result = await krishiCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updated }
  );
  res.send(result);
});

app.delete("/crops/:id", async (req, res) => {
  const id = req.params.id;
  const result = await krishiCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});
  


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// MONGO DB CONNECT

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
