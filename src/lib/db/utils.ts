
import { supabase } from "@/lib/supabase";

// Fungsi untuk test koneksi Supabase
export async function testSupabaseConnection() {
  try {
    // Test koneksi dasar dengan query sederhana
    const { data, error } = await supabase.from("cities").select("id").limit(1);

    if (error) {
      console.error("Koneksi error:", error);
      return {
        connected: false,
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details,
        },
      };
    }

    // Test write permission
    const testData = { name: "TEST_CITY_" + Date.now() };
    const { error: writeError } = await supabase
      .from("cities")
      .insert(testData);

    if (writeError) {
      return {
        connected: true,
        canRead: true,
        canWrite: false,
        error: writeError.message,
        details: {
          code: writeError.code,
          hint: writeError.hint,
          details: writeError.details,
        },
      };
    }

    // Hapus data test
    await supabase.from("cities").delete().eq("name", testData.name);

    return {
      connected: true,
      canRead: true,
      canWrite: true,
    };
  } catch (error) {
    console.error("Test connection error:", error);
    return {
      connected: false,
      error: error.message,
    };
  }
}
