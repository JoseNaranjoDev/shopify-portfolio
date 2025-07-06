const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config({ path: "./config.env" });

const accessToken = process.env.PUBLIC_STOREFRONT_API_TOKEN;
const query = `query {
  shop {
    id
    name
    email
    billingAddress {
      id
      address1
    }
  }
  products(first:5) {
    nodes {
      id
      title
    }
  }
}`;

// axios({
//   url: "https://josenaranjo-dev.myshopify.com/admin/api/2023-01/graphql.json",
//   method: "post",
//   headers: {
//     "X-Shopify-Access-Token": accessToken,
//     "Content-Type": "application/json",
//   },
//   data: { query },
// })
//   .then((response) => console.log(...response.data.data.products.nodes))
//   .catch((error) => console.error(error));
