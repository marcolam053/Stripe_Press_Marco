# Stripe Press - A Stripe Payment Element Demo

## 🎯 Objective

The objective is to demonstrate how quickly and seamlessly Stripe payments can be integrated into an existing web application to enable a fully functional checkout experience.

The implementation focuses on taking a simple Node.js + Express application and augmenting it with Stripe’s payment capabilities using the PaymentIntent API and Payment Element, without requiring major architectural changes.

## ⚡️ Highlights
This demo highlights:
- how minimal code changes are needed to introduce secure payment processing
- how Stripe handles sensitive payment data, reducing backend complexity and PCI scope
- how a complete end-to-end payment flow (checkout → payment → confirmation) can be achieved using a modern, recommended integration pattern
- how developers can maintain control over pricing and business logic on the server while leveraging Stripe for payment orchestration

Overall, the goal is to showcase a low-friction, production-aligned integration approach that can be easily extended into a more robust commerce solution.

------------------------------------------------------------------------

## 🛠️ How to build, configure and run

To get started, clone the repository and run npm install to install dependencies:

### Clone github & install dependencies
    git clone https://github.com/mattmitchell6/sa-takehome-project-node && cd sa-takehome-project-node
    npm install

### Configure

You'll need to retrieve a set of testmode API keys from the Stripe dashboard (you can create a free test account [here](https://dashboard.stripe.com/register)) ) to run this locally.

    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_PUBLISHABLE_KEY=pk_test_...

### Run
    npm start

Open in browser (Recommend using Chrome or Firefox):

    http://localhost:3000

------------------------------------------------------------------------

## 🚙  Approach
The solution follows Stripe’s recommended PaymentIntent + Payment Element architecture, with a focus on security and simplicity.
- Server-side pricing and validation to prevent client-side tampering
- Clear separation of responsibilities: backend handles payment orchestration, frontend handles payment collection via Stripe.js
- Minimal frontend logic to reduce complexity and errors
- Use of modern Stripe features (Payment Element, automatic payment methods) for flexibility and scalability

This approach keeps the integration lightweight while remaining aligned with production-ready design patterns.


------------------------------------------------------------------------


## 🏗️ Architecture

Client → Backend → Stripe → Client → Backend

-   Backend: creates PaymentIntent, retrieves result
-   Frontend: renders UI, confirms payment
-   Stripe: processes payment and handles authentication

------------------------------------------------------------------------

## 🌊 Stripe Flow

### 1. Create PaymentIntent (Server)

    stripe.paymentIntents.create(...)

### 2. Initialize Payment Element (Client)

    stripe.elements({ clientSecret })

### 3. Confirm Payment (Client)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'http://localhost:3000/success?payment_intent={PAYMENT_INTENT_ID}',
        payment_method_data: {
          billing_details: {
            email: document.getElementById('email').value
          }
        }
      }
    });

#### Explanation

-   This is the **critical step where payment is executed**
-   Stripe processes the payment and handles authentication
-   Redirects user to success page

### 4. Retrieve Payment (Server)

    stripe.paymentIntents.retrieve(paymentIntentId)

------------------------------------------------------------------------

## 🚨 Security Design
The solution keeps pricing and product validation on the backend so the browser cannot tamper with charge amounts. 
Stripe’s secret key is isolated to the server via environment variables, while only the publishable key is exposed to the client. 
Payment details are collected through Stripe’s Payment Element, which reduces PCI scope because raw card data never touches the application server. 
After redirect, the backend retrieves the PaymentIntent from Stripe to display the actual final payment state rather than trusting client-side assumptions.

Securtity designs that are implemented:
-   Pricing calculated server-side
-   Secret key stored in `.env`
-   Publishable key injected via template
-   Payment data handled by Stripe

------------------------------------------------------------------------

## 🌥️ Challenges
The main challenges were correctly separating client and server responsibilities, understanding the PaymentIntent lifecycle end-to-end, handling environment variables across server-rendered and browser contexts, and retrieving the final payment state reliably on the success page. 
The implementation needed to stay simple enough while still reflecting sound payment architecture.
-   Client vs server responsibility
-   PaymentIntent lifecycle understanding
-   Environment variable handling
-   Redirect + success flow

------------------------------------------------------------------------

## ⚙️ Future Improvements
The next phase of development would focus on two key areas: 
- **enhancing user experience to increase basket size and conversion**
- **strengthening the security and reliability of the payment flow**.

 ### 🧺 **Enhancing UX to drive conversion and basket size**  

The current implementation supports a single-item checkout flow. 
To better reflect real-world e-commerce behaviour and increase average order value, 
the application can be extended with a richer purchasing experience.

A new cart system would allow users to:
- add multiple items 
- adjust quantities 
- review their order before checkout

This creates more opportunities for upsell and increases basket size compared to a one-click purchase flow.

### 💪 **Strengthening security and payment reliability**  

While the current implementation follows Stripe’s recommended PaymentIntent architecture, 
further improvements can be made to make the system production-ready.

The most important enhancement would be introducing webhook-based payment handling. Instead of relying on browser redirects to determine success, the backend would listen to Stripe events to:
- confirm payment completion
- handle asynchronous payment methods
- ensure accurate order state even if the user does not return to the site

Additional security and reliability improvements include:
- **Order persistence**
  - Store orders in a database and link them to PaymentIntents to ensure traceability and consistency.
- **Idempotency protection**
  - Use idempotency keys when creating PaymentIntents to prevent duplicate charges from retries or network issues.
- **Metadata enrichment**
  - Attach internal identifiers (e.g. order ID, product ID) to PaymentIntents for better observability and debugging.
- **Customer management**: 
  - Stripe Customer objects to associate payments with users and support saved payment methods.
- **Stronger validation and controls**
  - Validate all incoming requests more rigorously and enforce stricter server-side checks to prevent malformed or malicious input.


------------------------------------------------------------------------
## Reference
- [Stripe Payment Element Docs](https://docs.stripe.com/payments/payment-element)
- [Stripe Elements Appearance API](https://docs.stripe.com/elements/appearance-api) 
- [Stripe PaymentIntent API Docs](https://docs.stripe.com/api/payment_intents)
- [Stripe Payment Element Integration Best Practice](https://docs.stripe.com/payments/payment-element/best-practices)

