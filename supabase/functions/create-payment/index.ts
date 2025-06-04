
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
    console.log("=== CREATE PAYMENT FUNCTION STARTED ===");
    
    // Get the request body
    const { tier, amount, product_name, mode = "payment", project_id } = await req.json();
    console.log("Request body:", { tier, amount, product_name, mode, project_id });
    
    // Initialize Stripe with the secret key from environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not found in environment");
      throw new Error("Stripe configuration error");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    console.log("Stripe initialized successfully");

    // Create a Supabase client using anon key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from the request authorization header
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let customerEmail = "guest@memoryweave.com"; // Default for guest checkout
    
    if (authHeader) {
      console.log("Processing authenticated user");
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (error) {
        console.error("Error getting user:", error);
        throw new Error(`Error getting user: ${error.message}`);
      }
      user = data.user;
      if (user?.email) {
        customerEmail = user.email;
        console.log("User authenticated:", user.email);
      }
    } else {
      console.log("No auth header, proceeding as guest");
    }

    // Determine the success and cancel URLs from the request origin
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const success_url = `${origin}/payment-success?tier=${tier}&project_id=${project_id || ""}`;
    const cancel_url = `${origin}/subscription`;
    
    console.log("Redirect URLs:", { success_url, cancel_url });

    // Check if this user already has a Stripe customer record
    let stripeCustomerId = null;
    if (user?.email) {
      console.log("Checking for existing Stripe customer");
      const customerList = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customerList.data.length > 0) {
        stripeCustomerId = customerList.data[0].id;
        console.log("Found existing customer:", stripeCustomerId);
      } else {
        console.log("No existing customer found");
      }
    }

    // Create checkout session parameters
    const sessionParams: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product_name || `MemoryWeave ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: `Wedding video editing - ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: success_url,
      cancel_url: cancel_url,
      allow_promotion_codes: true, // Allow promo codes
    };

    // Add customer information - use either existing customer ID or email for new customer
    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
      console.log("Using existing customer ID");
    } else {
      sessionParams.customer_email = customerEmail;
      console.log("Using customer email for new customer");
    }

    console.log("Creating Stripe checkout session with params:", {
      mode: sessionParams.mode,
      amount: amount,
      hasCustomer: !!stripeCustomerId,
      customerEmail: !stripeCustomerId ? customerEmail : 'existing customer'
    });

    // Create a checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log("Stripe session created successfully:", {
      sessionId: session.id,
      url: session.url,
      paymentIntent: session.payment_intent
    });

    // Verify the session URL is valid
    if (!session.url) {
      console.error("No URL returned from Stripe session creation");
      throw new Error("Failed to create checkout session URL");
    }

    // If user is authenticated and this is for a specific project, record the purchase intent
    if (user && project_id && mode === "payment") {
      console.log("Recording purchase intent in database");
      // Create a service client that bypasses RLS
      const supabaseServiceClient = createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        { auth: { persistSession: false } }
      );

      // Record the purchase intent in the database
      const { data: insertData, error: insertError } = await supabaseServiceClient
        .from("per_wedding_purchases")
        .insert({
          user_id: user.id,
          project_id: project_id,
          stripe_payment_intent_id: session.payment_intent as string,
          tier: tier,
          amount: amount,
          status: "pending"
        });
      
      if (insertError) {
        console.error("Error recording purchase intent:", insertError);
      } else {
        console.log("Purchase intent recorded successfully");
      }
    }

    // Return the session URL
    console.log("=== RETURNING SUCCESS RESPONSE ===");
    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("=== ERROR IN CREATE-PAYMENT FUNCTION ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
