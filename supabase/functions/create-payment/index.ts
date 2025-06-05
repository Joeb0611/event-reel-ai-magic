
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation and sanitization
const validateInput = (input: any, type: string): boolean => {
  switch (type) {
    case 'tier':
      return typeof input === 'string' && ['premium', 'professional'].includes(input);
    case 'amount':
      return typeof input === 'number' && input > 0 && input <= 100000; // Max $1000
    case 'project_id':
      return !input || (typeof input === 'string' && input.length <= 100);
    default:
      return false;
  }
};

const sanitizeString = (input: string): string => {
  return input.replace(/[<>\"'&]/g, '').trim().substring(0, 200);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== CREATE PAYMENT FUNCTION STARTED ===");
    
    // Get and validate request body
    const requestBody = await req.json();
    const { tier, amount, product_name, mode = "payment", project_id } = requestBody;
    
    // Validate all inputs
    if (!validateInput(tier, 'tier')) {
      throw new Error('Invalid tier specified');
    }
    if (!validateInput(amount, 'amount')) {
      throw new Error('Invalid amount specified');
    }
    if (project_id && !validateInput(project_id, 'project_id')) {
      throw new Error('Invalid project ID specified');
    }

    console.log("Request validated:", { tier, amount, mode, project_id: project_id ? 'provided' : 'none' });
    
    // Initialize Stripe with validation
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
      console.error("Invalid or missing STRIPE_SECRET_KEY");
      throw new Error("Payment service configuration error");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    console.log("Stripe initialized successfully");

    // Create Supabase client with validation
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration error");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Authenticate user with enhanced validation
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let customerEmail = "guest@memoryweave.com";
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log("Processing authenticated user");
      const token = authHeader.replace("Bearer ", "");
      
      // Validate token format
      if (token.length < 10) {
        throw new Error("Invalid authentication token");
      }
      
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (error) {
        console.error("Authentication error:", error);
        throw new Error(`Authentication failed: ${error.message}`);
      }
      
      user = data.user;
      if (user?.email) {
        customerEmail = user.email;
        console.log("User authenticated:", user.email.substring(0, 3) + "***");
        
        // If project_id is provided, validate user owns the project
        if (project_id) {
          const { data: projectData, error: projectError } = await supabaseClient
            .from('projects')
            .select('id')
            .eq('id', project_id)
            .eq('user_id', user.id)
            .single();
            
          if (projectError || !projectData) {
            throw new Error("Access denied: Invalid project access");
          }
          console.log("Project access validated");
        }
      }
    } else {
      console.log("No valid auth header, proceeding as guest");
    }

    // Validate and sanitize origin
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const allowedOrigins = [
      "http://localhost:5173",
      "https://memoryweave.lovable.app",
      // Add your production domains here
    ];
    
    if (!allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      console.error("Origin not allowed:", origin);
      throw new Error("Access denied: Invalid origin");
    }

    // Create secure redirect URLs
    const success_url = `${origin}/payment-success?tier=${encodeURIComponent(tier)}&project_id=${encodeURIComponent(project_id || "")}`;
    const cancel_url = `${origin}/subscription`;
    
    console.log("Redirect URLs validated");

    // Check for existing Stripe customer with rate limiting
    let stripeCustomerId = null;
    if (user?.email) {
      console.log("Checking for existing Stripe customer");
      const customerList = await stripe.customers.list({ 
        email: user.email, 
        limit: 1 
      });
      
      if (customerList.data.length > 0) {
        stripeCustomerId = customerList.data[0].id;
        console.log("Found existing customer");
      }
    }

    // Create secure checkout session
    const sessionParams: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: sanitizeString(product_name || `MemoryWeave ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`),
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
      allow_promotion_codes: true,
      // Enhanced security settings
      payment_intent_data: {
        metadata: {
          tier: tier,
          user_id: user?.id || 'guest',
          project_id: project_id || '',
          timestamp: new Date().toISOString()
        }
      }
    };

    // Add customer information securely
    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
    } else {
      sessionParams.customer_email = customerEmail;
    }

    console.log("Creating Stripe checkout session");
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    console.log("Stripe session created successfully:", {
      sessionId: session.id,
      hasUrl: !!session.url,
      paymentIntent: session.payment_intent
    });

    // Validate session creation
    if (!session.url) {
      console.error("No URL returned from Stripe session creation");
      throw new Error("Failed to create checkout session URL");
    }

    // Securely record purchase intent for authenticated users
    if (user && project_id && mode === "payment") {
      console.log("Recording purchase intent in database");
      
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseServiceKey) {
        console.error("Service role key not available");
      } else {
        const supabaseServiceClient = createClient(
          supabaseUrl,
          supabaseServiceKey,
          { auth: { persistSession: false } }
        );

        const { error: insertError } = await supabaseServiceClient
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
    }

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
    
    // Sanitize error messages for security
    const sanitizedMessage = error instanceof Error 
      ? error.message.replace(/[<>\"'&]/g, '').substring(0, 200)
      : "Payment processing error";
    
    return new Response(
      JSON.stringify({ error: sanitizedMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
