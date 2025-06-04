
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
    // Get the request body
    const { tier, amount, product_name, mode = "payment", project_id } = await req.json();
    
    // Initialize Stripe with the secret key from environment variables
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create a Supabase client using anon key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from the request authorization header
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let stripeCustomer = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (error) throw new Error(`Error getting user: ${error.message}`);
      user = data.user;
    }

    // Determine the success and cancel URLs from the request origin
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const success_url = `${origin}/payment-success?tier=${tier}&project_id=${project_id || ""}`;
    const cancel_url = `${origin}/payment-canceled`;

    // Check if this user already has a Stripe customer record
    if (user?.email) {
      const customerList = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customerList.data.length > 0) {
        stripeCustomer = customerList.data[0].id;
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
    };

    // Add either customer OR customer_email, but not both
    if (stripeCustomer) {
      sessionParams.customer = stripeCustomer;
    } else if (user?.email) {
      sessionParams.customer_email = user.email;
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // If user is authenticated and this is for a specific project, record the purchase intent
    if (user && project_id && mode === "payment") {
      // Create a service client that bypasses RLS
      const supabaseServiceClient = createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        { auth: { persistSession: false } }
      );

      // Record the purchase intent in the database
      await supabaseServiceClient.from("per_wedding_purchases").insert({
        user_id: user.id,
        project_id: project_id,
        stripe_payment_intent_id: session.payment_intent as string,
        tier: tier,
        amount: amount,
        status: "pending"
      });
    }

    // Return the session URL
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
    console.error("Error in create-payment function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
