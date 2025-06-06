const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


//middleware
app.use(cors())
app.use(express.json())


//mongodb data
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster21kousar.ai36vz4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster21kousar`;

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
    // await client.connect();


    //data collection
    const jobDataCollection = client.db("careerCode").collection("jobs")
    const applicationsCollection = client.db('careerCode').collection("applications")


    // get jobs api from database
    app.get('/jobs', async (req, res) => {
      const cursor = jobDataCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    //get single data from database
    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobDataCollection.findOne(query);
      res.send(result)
    })

    //send data form to data base
    app.post("/jobs", async(req, res)=>{
      const newJob = req.body;
      console.log(newJob)
      const result = await jobDataCollection.insertOne(newJob);
      res.send(result)
    })


    //job appplications API's

    app.get('/applications', async (req, res) => {
      const email = req.query.email;
      const query = {
        applicant: email
      }
      const result = await applicationsCollection.find(query).toArray()


    
      //bad way to aggregate data
      for (const application of result) {
        const jobId = application.jobId;
        const jobQuery = { _id: new ObjectId(jobId) }
        const job = await jobDataCollection.findOne(jobQuery)
        // console.log(job)
        application.company = job.company
        application.title = job.title;
        application.company_logo = job.company_logo
      }


      res.send(result)
    })


    app.post('/applications', async (req, res) => {
      const application = req.body;
      // console.log(application)
      const result = await applicationsCollection.insertOne(application);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// route
app.get('/', (req, res) => {
  res.send("Welcome to career job portal back end server")
})

app.listen(port, () => {
  console.log(`This is my career code job portal backend server${port}`)
})