import { supabase } from "../supabaseClient";

export async function addRecommendation(payload) {
  return await supabase
    .from("recommendations")
    .insert([payload]);
}
