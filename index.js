const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { ObjectID } = require("bson");

//middlware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uana9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("Server and Database connection succesfully!!!!");

    // set database
    const database = client.db("talkWebDatabase");

    // Product collection
    const productsCollection = database.collection("products");

    // order collection
    const ordersCollection = database.collection("oders");

    // posts collection
    const postsCollection = database.collection("posts");

    // user information collection in database
    const usersCollection = database.collection("users");

    /* --------------------- user part start--------------------------- */

    // --------- check admin ? admin check korar process----------
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //-------- add or post  users in database-----------
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // --------- make admin for dashboard --------
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    /* ------------------user part end ---------------------------- */

    /*--------------------------- Products part start ------------------------- */

    // Post or add Products
    app.post("/products", async (req, res) => {
      const addProduct = req.body;
      const result = await productsCollection.insertOne(addProduct);
      res.json(result);
    });

    //------------Get Products Api---------------
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    // ----------- delete Product--------------
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    /*--------------------------- Product part end ------------------------- */

    /* ------------ Order part start---------------- */

    //Get orders Api
    app.get("/oders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // Get Spacific user order
    app.get("/oders/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const cursor = ordersCollection.find(query);
      const myOrders = await cursor.toArray();
      res.send(myOrders);
    });

    //-------- post data for orders-------
    app.post("/oders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    // ----------- delete orders--------------
    app.delete("/oders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });

    /* -----------------order part end --------------------------*/

    /*--------------------------- Posts part start ------------------------- */

    // Post or add user post
    app.post("/posts", async (req, res) => {
      const addPosts = req.body;
      const result = await postsCollection.insertOne(addPosts);
      res.json(result);
    });

    //------------Get post Api---------------
    app.get("/posts", async (req, res) => {
      const cursor = postsCollection.find({});
      const posts = await cursor.toArray();
      res.send(posts);
    });

    // ----------- delete post--------------
    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const result = await postsCollection.deleteOne(query);
      res.send(result);
    });

    /*--------------------------- Posts part end ------------------------- */
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome Talk Web! Read And Write!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
