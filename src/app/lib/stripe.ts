import Stripe from "stripe";
import config from "../config";

export const stripe = new Stripe(config.Stripe_Secret_key as string);
