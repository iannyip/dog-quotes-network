const publishableKey = 'pk_test_51IQmfABPFi6NInicOPk9F1qsIcoVUPxNGNwjc2KakAYjk6zY448gP49mhX1sskWdypQqsRXJ8CvDXoaYBWxjXp6i00wiJ2Oj0i';
// Question: do we need to import stripe module into this js file?
const stripe = Stripe(publishableKey); // Your Publishable Key
const elements = stripe.elements(); // Create a stripe element here

// Create our card inputs
var style = { // Setting the 'style' option property of elements.create
  base: {
    color: "#000"
  }
};
// This card variable is an element
const card = elements.create('card', { style });
card.mount('#card-element'); // Attach the element to the DOM by ID

const form = document.querySelector('#stripe-form');
const errorEl = document.querySelector('#card-errors');

// Give our token to our form
// This is a function
const stripeTokenHandler = (token) => {
  const hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

  form.submit();
}

// Create token from card data
form.addEventListener('submit', e => {
  e.preventDefault();

  console.log("this happened");
  stripe
    .createToken(card)
    .then(result => {
      console.log(result);
      if (result.error) {
        errorEl.textContent = result.error.message;
        console.log(result.error);
      } else {
        stripeTokenHandler(result.token);
      } 
    })
})