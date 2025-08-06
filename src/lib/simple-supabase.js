/**
 * Simple client-side only Supabase integration
 * This bypasses any Next.js SSR issues
 */

import { createClient } from "@supabase/supabase-js";

let supabaseClient = null;

// Initialize client only when needed (browser only)
function getSupabaseClient() {
  if (typeof window === "undefined") {
    return null; // Server-side, return null
  }

  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase environment variables");
      return null;
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase client initialized");
  }

  return supabaseClient;
}

// Simple fetch function that works client-side only
export async function fetchSupabaseUsers() {
  return new Promise(async (resolve, reject) => {
    try {
      const client = getSupabaseClient();

      if (!client) {
        throw new Error("Supabase client not available");
      }

      console.log("🔄 Starting simple Supabase fetch...");

      const { data, error } = await client.from("user_profiles").select("*");

      if (error) {
        console.error("❌ Supabase error:", error);
        reject(error);
        return;
      }

      if (!data || data.length === 0) {
        console.warn("⚠️ No data returned");
        reject(new Error("No data returned"));
        return;
      }

      console.log("✅ Successfully fetched", data.length, "users");
      resolve(data);
    } catch (err) {
      console.error("❌ Exception in fetchSupabaseUsers:", err);
      reject(err);
    }
  });
}
