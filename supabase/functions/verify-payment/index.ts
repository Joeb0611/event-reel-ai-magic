
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get session ID from request
    const { session_id } = await req.json();
    if (!session_id) {
      throw new Error("No session ID provided");
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the session details
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    // Check if payment was successful
    const isPaymentSuccessful = session.payment_status === "paid";

    // If there is a payment intent, update the purchase record
    if (isPaymentSuccessful && session.payment_intent) {
      // Create a service client to bypass RLS
      const supabaseServiceClient = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        { auth: { persistSession: false } }
      );

      // Update the purchase record status
      await supabaseServiceClient
        .from("per_wedding_purchases")
        .update({ status: "paid" })
        .eq("stripe_payment_intent_id", session.payment_intent);
    }

    return new Response(
      JSON.stringify({ 
        success: isPaymentSuccessful,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in verify-payment function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
