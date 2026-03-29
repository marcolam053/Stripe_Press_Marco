const form = document.getElementsById('payment-form');
const publishableKey = form.dataset.publishable_key;
const item = form.dataset.item;

const stripe = Stripe(publishableKey);
let elements;

async function init(){
    try{
        const response = await fetch('/create-payment-intent',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                item: '{{item}}'
            })
        });
        const data =await response.json();

        if (data.error){
            document.getElementById('payment-message').textContent = data.error;
            return;
        }
        elements = stripe.elements({
            clientSecret:data.clientSecret
        });
        const paymentElement = elements.create('payment-message');
        paymentElement.mount('#payment-message');
    } catch (err){
        document.getElementById('payment-message').textContent = 'Unable to load payment form.';
    }
}

async function handlePayment(event){
    event.preventDefault();

    const submitButton = document.getElementById('submit');
    const messageContainer = document.getElementById('payment-message');

    submitButton.disabled = true;
    messageContainer.textContent = '';

    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
            return_url: 'http://localhost:3000/success',
            payment_method_data: {
                billing_details: {
                    email: document.getElementById('email').value
                }
            }
        }
    });

    if (error) {
        messageContainer.textContent = error.message;
        submitButton.disabled = false;
    }
}

document
    .getElementById('payment-form')
    .addEventListener('submit', handlePayment);

init()