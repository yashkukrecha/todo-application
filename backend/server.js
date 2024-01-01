// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

// Creating an instance of Express
const app = express();

// Loading environment variables from a .env file into process.env
require("dotenv").config();

// Importing the Firestore database instance from firebase.js
const db = require("./firebase");
db.settings({ ignoreUndefinedProperties: true });

// Middlewares to handle cross-origin requests and to parse the body of incoming requests to JSON
app.use(cors());
app.use(bodyParser.json());

const auth = (req, res, next) => {
  try {
    const tokenId = req.get("Authorization").split("Bearer ")[1];
    admin.auth().verifyIdToken(tokenId)
      .then((decoded) => {
        req.token = decoded;
        next();
      })
      .catch((error) => res.status(401).send(error));
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};

// Your API routes will go here...

// GET: Endpoint to retrieve all tasks
app.get("/tasks", auth, async (req, res) => {
  try {
    // Fetching all documents from the "tasks" collection in Firestore
    const snapshot = await db.collection("tasks").get();
    
    let tasks = [];
    // Looping through each document and collecting data
    snapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,  // Document ID from Firestore
        ...doc.data(),  // Document data
      });
    });
    
    // Sending a successful response with the tasks data
    res.status(200).send(tasks);
  } catch (error) {
    // Sending an error response in case of an exception
    res.status(500).send(error.message);
  }
});

// GET: Endpoint to retrieve all tasks for a user
// ... 
app.get("/tasks/:user", auth, async (req, res) => {
  try {
    const snapshot = await db.collection("tasks").where("user", "==", req.params.user).get();
    let tasks = [];
    snapshot.forEach((doc) => { tasks.push({ id: doc.id, ...doc.data() }) });
    res.status(200).send(tasks);
  } catch (error) {
    res.status(500).send(error.message);
  }
})

// POST: Endpoint to add a new task
// ...
app.post("/tasks", auth, async (req, res) => {
  try {
    const data = {
      'user': req.body.user,
      'name': req.body.name,
      'finished': req.body.finished
    }
    const addedTask = await db.collection("tasks").add(data);
    res.status(201).send({
      id: addedTask.id,  // Automatically generated Document ID from Firestore
      ...data,
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
})

// DELETE: Endpoint to remove a task
// ... 
app.delete("/tasks/:id", auth, async (req, res) => {
  try {
    await db.collection("tasks").doc(req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
})

// Setting the port for the server to listen on
const PORT = process.env.PORT || 3001;
// Starting the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});