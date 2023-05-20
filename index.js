const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5005;

//? middleware

app.use(cors());

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_TOY_USER}:${process.env.DB_PASS}@cluster0.xol1uc7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const toysCollection = client.db("disneyToys").collection("toys");
    const disneyCollection = client.db("disneyToys").collection("dolls");

    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const options = {
        // Include only the `title` and `imdb` fields in each returned document
        projection: { title: 1, price: 1, name: 1, rating: 1, img: 1 },
      };
      const result = await toysCollection.findOne(query, options);
      res.send(result);
    });

    //?disney dolls

    app.get("/dolls", async (req, res) => {
      console.log(req.query);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await disneyCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/dolls", async (req, res) => {
      const doll = req.body;
      console.log(doll);
      const result = await disneyCollection.insertOne(doll);
      res.send(result);
    });
    //? update data
    app.patch("/dolls/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoll = req.body;
      console.log(updatedDoll);
      const updateDoc = {
        $set: {
          status: updatedDoll.status,
        },
      };
      const result = await disneyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    //? delete data
    app.delete("/dolls/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await disneyCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Kids are playing with  their favourite toys");
});

app.listen(port, () => {
  console.log(`Toys are going under ground on port: ${port}`);
});
