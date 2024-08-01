import Payment from "../../models/payment.js";
import mercadopago, { MercadoPagoConfig, OAuth } from "mercadopago";
import mongoose from "mongoose";

// Replace with your credentials
const clientId = "YOUR_CLIENT_ID";
const accessToken = "YOUR_ACCESS_TOKEN";

export const createPreference = {
  do: async (req, res) => {
    const { blogPostId, blogTitle, blogPrice, sellerId } = req.query;
    const { uid } = req;

    // Set up preference object
    const preference = {
      items: [
        {
          id: blogPostId,
          description: blogTitle,
          quantity: 1,
          unit_price: blogPrice,
        },
      ],
      external_reference: blogPostId,
      payer_email: "buyer@example.com", // Replace with buyer's email
      split_payments: [
        {
          id: sellerId,
          rate: 0.8, // 80% to seller
        },
        {
          id: "YOUR_PLATFORM_ID", // Your platform's Mercado Pago user ID
          rate: 0.2, // 20% to platform
        },
      ],
    };

    // Create preference using Mercado Pago SDK
    mercadopago.preference
      .create(preference)
      .then((response) => {
        console.log("Preference created:", response.body);
        return response.body.init_point;
      })
      .catch((error) => {
        console.error("Error creating preference:", error);
      });
  },
};

export const createAccessToken = {
  do: async (req, res) => {
    const { clientSecret, clientId, code, redirectUri } = req.body;
    const client = new MercadoPagoConfig({
      accessToken: "access_token",
      options: { timeout: 5000 },
    });

    console.log("AccessToken body", req.body);

    const oauth = new OAuth(client);
    oauth
      .create({
        grant_type: "authorization_code",
        client_secret: "uSsYsrUPxgaMmzKn5TWs5p2UqoVeRkFl",
        client_id: "6845307964887160",
        code: "TG-66a168280647590001ca917d-1741726174",
        redirect_uri: redirectUri,
      })
      .then((result) => console.log("AccessToken", result))
      .catch((error) => console.log("AccessToken error", error));
  },
};
