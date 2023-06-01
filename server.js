const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { MongoClient } = require('mongodb');

const url = process.env.DATABASE_URL;
const db_Name = process.env.DATABASE_NAME;

const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51NCZkbGy0kbFHoHStTfHmPIK1xCF2aMZZOUxccZOPct3dhprBZyldyDB2xtBpOfmHOGfsR4BlIUlv8b29OMVlgDI00pmktSwMw');






async function startServer() {
  try {
    const db = await connectToMongo();
    
    
    const app = express();
    app.use(cors());


    // Middleware
    app.use(express.json());
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    

    app.post('/charge', async (req, res) => {
        const { userId, amount } = req.body;
      
        try {
          // Create a Stripe charge
          //create a stripe payment token  
           

          //create a stripe payment method
        
          const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
              number: '4242424242424242',
              exp_month: 12,
              exp_year: 2023,
              cvc: '123',
            },
          });
          const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method: paymentMethod.id, 
            confirm: true, // Confirm the payment immediately
          });
      
          // Return the payment intent to the Bike Rental Microservice
          res.json({ paymentIntent });
        } catch (error) {
          console.error('Error processing payment:', error);
          res.status(500).json({ error: 'Payment processing failed' });
        }
      });

    const PORT = 3001;

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting the server:', error);
  }
}

// Connect to MongoDB
async function connectToMongo() {
  try {
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Storing a reference to the database so you can use it later
    const db = client.db(db_Name);

    console.log(`Connected MongoDB: ${url}`);
    console.log(`Database: ${db_Name}`);

    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Call the startServer function to begin the server initialization
startServer();


