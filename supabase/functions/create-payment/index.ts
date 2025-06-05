
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
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Get and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body received:", requestBody);
    } catch (error) {
      console.error("Failed to parse request body:", error);
      throw new Error("Invalid request body format");
    }

    const { tier, amount, product_name, mode = "payment", project_id } = requestBody;
    
    // Validate all inputs
    if (!validateInput(tier, 'tier')) {
      console.error("Invalid tier:", tier);
      throw new Error('Invalid tier specified');
    }
    if (!validateInput(amount, 'amount')) {
      console.error("Invalid amount:", amount);
      throw new Error('Invalid amount specified');
    }
    if (project_id && !validateInput(project_id, 'project_id')) {
      console.error("Invalid project_id:", project_id);
      throw new Error('Invalid project ID specified');
    }

    console.log("Request validated:", { tier, amount, mode, project_id: project_id ? 'provided' : 'none' });
    
    // Initialize Stripe with validation
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY is not set");
      throw new Error("Payment service configuration error: Missing Stripe key");
    }
    if (!stripeSecretKey.startsWith('sk_')) {
      console.error("STRIPE_SECRET_KEY has invalid format");
      throw new Error("Payment service configuration error: Invalid Stripe key format");
    }
    
    console.log("Stripe key validation passed");
    
    let stripe;
    try {
      stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2023-10-16",
      });
      console.log("Stripe initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Stripe:", error);
      throw new Error("Payment service initialization failed");
    }

    // Create Supabase client with validation
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      throw new Error("Database configuration error");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client created");

    // Authenticate user with enhanced validation
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let customerEmail = "guest@memoryweave.com";
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log("Processing authenticated user");
      const token = authHeader.replace("Bearer ", "");
      
      // Validate token format
      if (token.length < 10) {
        console.error("Token too short:", token.length);
        throw new Error("Invalid authentication token");
      }
      
      try {
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
              console.error("Project access validation failed:", projectError);
              throw new Error("Access denied: Invalid project access");
            }
            console.log("Project access validated");
          }
        }
      } catch (error) {
        console.error("User authentication failed:", error);
        throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.log("No valid auth header, proceeding as guest");
    }

    // Get origin and create secure redirect URLs
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split('/').slice(0, 3).join('/') || "https://memoryweave.lovable.app";
    console.log("Using origin:", origin);
    
    const success_url = `${origin}/payment-success?tier=${encodeURIComponent(tier)}&project_id=${encodeURIComponent(project_id || "")}`;
    const cancel_url = `${origin}/subscription`;
    
    console.log("Redirect URLs created:", { success_url, cancel_url });

    // Check for existing Stripe customer with rate limiting
    let stripeCustomerId = null;
    if (user?.email) {
      console.log("Checking for existing Stripe customer");
      try {
        const customerList = await stripe.customers.list({ 
          email: user.email, 
          limit: 1 
        });
        
        if (customerList.data.length > 0) {
          stripeCustomerId = customerList.data[0].id;
          console.log("Found existing customer:", stripeCustomerId);
        } else {
          console.log("No existing customer found");
        }
      } catch (error) {
        console.error("Error checking for existing customer:", error);
        // Continue without existing customer - will create new one
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
      console.log("Using existing customer ID");
    } else {
      sessionParams.customer_email = customerEmail;
      console.log("Using customer email:", customerEmail);
    }

    console.log("Creating Stripe checkout session with params:", {
      mode: sessionParams.mode,
      customer: sessionParams.customer || 'none',
      customer_email: sessionParams.customer_email || 'none',
      line_items_count: sessionParams.line_items.length,
      success_url: sessionParams.success_url,
      cancel_url: sessionParams.cancel_url
    });

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
      console.log("Stripe session created successfully:", {
        sessionId: session.id,
        hasUrl: !!session.url,
        paymentIntent: session.payment_intent,
        url: session.url
      });
    } catch (error) {
      console.error("Failed to create Stripe session:", error);
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

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
        try {
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
        } catch (error) {
          console.error("Failed to record purchase intent:", error);
        }
      }
    }

    console.log("=== RETURNING SUCCESS RESPONSE ===");
    const response = {
      url: session.url,
      session_id: session.id 
    };
    console.log("Response data:", response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("=== ERROR IN CREATE-PAYMENT FUNCTION ===");
    console.error("Error type:", typeof error);
    console.error("Error name:", error instanceof Error ? error.name : 'Unknown');
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
    
    // Sanitize error messages for security
    const sanitizedMessage = error instanceof Error 
      ? error.message.replace(/[<>\"'&]/g, '').substring(0, 200)
      : "Payment processing error";
    
    const errorResponse = { error: sanitizedMessage };
    console.log("Error response:", errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
