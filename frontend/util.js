import {load} from '@cashfreepayments/cashfree-js';
let getcashfree; // Declare the variable globally

async function initialize() {
  getcashfree = await load({
    mode: "production" // or production
  });
}

initialize();  // Call the async function

// Export a function that returns the cashfree value
export const cashfree = () => getcashfree;
