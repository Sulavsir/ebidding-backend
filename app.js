const express = require("express");
require("express-async-errors");
require("dotenv").config();
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const port = 3003;
const connectDb = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const auctionItemRoutes = require("./routes/auctionItem.routes");
const auctionOrderRoutes = require("./routes/auctionOrder.routes");
const userRoutes = require("./routes/user.routes");
const bidRoutes = require("./routes/bid.routes");

const { checkAuth } = require("./middleware/check-auth.middleware");

app.use(cors());
app.use(cookieParser());

const stripe = require("stripe")(
  "sk_test_51M2ALFFEon6AQRRqZGoTHmXZFVSKoxQVoFRYpjpHMNeZ7CuWF2i2MEuVXCLDRGceLSR9Fh1tjLQp5aUK76gEHyX100Oz1EleVm"
);
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_4e432bec602c524f16450de5d256b34138cbecf1397183ae80e77a02d2664d3e";

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const paymentIntentSucceeded = event.data.object;
        console.log("session", paymentIntentSucceeded.metadata);
        const orderId = paymentIntentSucceeded.metadata.orderId;
        console.log({ orderId });
        await Order.updateOne(
          { _id: orderId },
          {
            status: "completed",
          }
        );
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
    }

    response.send();
  }
);

app.use(express.json());
app.use(express.static("uploads"));

connectDb();

app.use("/api/auth", authRoutes);
app.use("/api/products", auctionItemRoutes);
app.use("/api/auction-orders", auctionOrderRoutes);
app.use("/api/bid", bidRoutes);
app.use("/api/users", checkAuth(["Admin"]), userRoutes);

app.all("*", (req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    message: "Something went wrong.",
  });
});

app.listen(port, () => {
  console.log(`BidNet app listening on port ${port}`);
});


