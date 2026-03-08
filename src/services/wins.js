import { supabase } from "../lib/supabase";
import { todayBrasiliaKey } from "../utils/date";

export async function fetchWinsToday() {
  const date = todayBrasiliaKey();

  const { data, error } = await supabase
    .from("wins")
    .select("wins_count")
    .eq("game_date", date)
    .maybeSingle();

  if (error) throw new Error(`wins GET failed: ${error.message}`);
  return (data?.wins_count ?? 0) | 0;
}

export async function incrementWinsToday() {
  const date = todayBrasiliaKey();

  const { data, error } = await supabase.functions.invoke("increment-wins", {
    body: { date },
  });

  if (error) throw new Error(`wins increment failed: ${error.message}`);
  return (data?.wins_count ?? 0) | 0;
}
