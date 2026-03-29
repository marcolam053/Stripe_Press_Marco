const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Books = {
  '1': {
    title: 'The Art of Doing Science and Engineering',
    amount: 2300
  },
  '2': {
    title: 'The Making of Prince of Persia: Journals 1985-1993',
    amount: 2500
  },
  '3': {
    title: 'Working in Public: The Making and Maintenance of Open Source',
    amount: 2800
  }
};

var app = express();

// view engine setup (Handlebars)
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json({}));

/**
 * Helper Function: get selected book
 * @param {string} item
 * @returns {{title:string, amount: number} | null}
 */
// Helper: return order amount for the one selected book
function getSelectedBook(item){
  return Books[item] || null;
}

/**
 * Home route
 */
app.get('/', function(req, res) {
  res.render('index');
});

/**
 * Checkout route
 */
app.get('/checkout', function(req, res) {
  // Just hardcoding amounts here to avoid using a database
  const item = req.query.item;
  const selectedBook = getSelectedBook(item);

  if(!selectedBook) {
    return res.render('checkout', {
        error: 'No book selected'
    });
  }

  res.render('checkout', {
    item: item,
    title: selectedBook.title,
    amount: selectedBook.amount,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// Create payment intent
app.post('/create-payment-intent', async(req, res) =>{
  try{
    const {item} = req.body;
    const selectedBook = getSelectedBook(item);

    // if no book selected, throw error
    if (!selectedBook) {
      return res.status(400).json({ error: 'Bad request: no item selected' });
    }

    // Create paymentintent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: selectedBook.amount,
      currency: 'aud',
      automatic_payment_methods:{
        enabled: true,
      }
    });

   return res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error('PaymentIntent Creation Error: ', err);
    return res.status(500).json({error: 'Unable to Create PaymentIntent'});
  }
});

/**
 * Success route
 */
app.get('/success', async (req, res) => {
  // res.render('success');

  try {
    const paymentIntentId = req.query.payment_intent;

    if(!paymentIntentId) {
      return res.render('success', {
        error: 'Missing payment information'
      });
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.render('success', {
      status: paymentIntent.status,
      amount: (paymentIntent.amount/100).toFixed(2), // Stripe return amount in cent, corrected to 2 decimal place
      currency: paymentIntent.currency,
      transaction_Id: paymentIntent.id,
    });
  } catch (err) {
    console.error('Error retrieving PaymentIntent Error: ', err);
    res.render('success',{
      error: 'Unable to retrieve payment details'
    });
  }
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log('Getting served on port 3000');
});
