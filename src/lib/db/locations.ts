
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// Fungsi untuk mendapatkan data cities
export async function getCities() {
  const { data: cities, error } = await supabase
    .from("cities")
    .select("*")
    .order("name");

  if (error) throw error;
  return cities;
}

// Fungsi untuk mendapatkan data subdistricts dengan city
export async function getSubdistricts(cityId?: string) {
  let query = supabase
    .from("subdistricts")
    .select(
      `
      *,
      cities!fk_subdistricts_city (
        name
      )
    `
    )
    .order("name");

  if (cityId) {
    query = query.eq("city_id", cityId);
  }

  const { data: subdistricts, error } = await query;
  if (error) throw error;
  return subdistricts;
}

// Fungsi untuk mendapatkan data branches dengan subdistrict dan city
export async function getBranches(subdistrictId?: string) {
  let query = supabase
    .from("branches")
    .select(
      `
      *,
      subdistricts!branches_subdistrict_id_fkey (
        name,
        cities!fk_subdistricts_city (
          name
        )
      )
    `
    )
    .order("name");

  if (subdistrictId) {
    query = query.eq("subdistrict_id", subdistrictId);
  }

  const { data: branches, error } = await query;
  if (error) throw error;
  return branches;
}

// Fungsi untuk menambah city baru
export async function createCity(cityData: { name: string }) {
  try {
    // Generate UUID dan gabungkan dengan data kota
    const newCity = {
      id: uuidv4(),
      name: cityData.name,
    };

    const { data, error } = await supabase
      .from("cities")
      .insert(newCity)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "42501") {
        throw new Error(
          "Tidak memiliki izin untuk menambah data. Periksa RLS policies."
        );
      } else if (error.code === "23505") {
        throw new Error("Kota dengan nama tersebut sudah ada.");
      } else {
        throw error;
      }
    }

    return data;
  } catch (error) {
    console.error("Create city error:", error);
    throw error;
  }
}

// Fungsi untuk update city
export async function updateCity(cityId: string, cityData: { name: string }) {
  const { data, error } = await supabase
    .from("cities")
    .update(cityData)
    .eq("id", cityId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fungsi untuk delete city
export async function deleteCity(cityId: string) {
  const { error } = await supabase.from("cities").delete().eq("id", cityId);

  if (error) throw error;
}

// Fungsi untuk menambah subdistrict baru
export async function createSubdistrict(subdistrictData: {
  name: string;
  city_id: string;
}) {
  try {
    // Generate UUID dan gabungkan dengan data kota
    const newSubdistrict = {
      id: uuidv4(),
      name: subdistrictData.name,
      city_id: subdistrictData.city_id,
    };
    const { data, error } = await supabase
      .from("subdistricts")
      .insert(newSubdistrict)
      .select(
        `
        *,
        cities!fk_subdistricts_city (
          name
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "42501") {
        throw new Error(
          "Tidak memiliki izin untuk menambah data. Periksa RLS policies."
        );
      } else if (error.code === "23505") {
        throw new Error("Kecamatan dengan nama tersebut sudah ada.");
      } else if (error.code === "23503") {
        throw new Error("Kota yang dipilih tidak valid.");
      } else {
        throw error;
      }
    }

    return data;
  } catch (error) {
    console.error("Create subdistrict error:", error);
    throw error;
  }
}

// Fungsi untuk update subdistrict
export async function updateSubdistrict(
  subdistrictId: string,
  subdistrictData: {
    name: string;
    city_id: string;
  }
) {
  const { data, error } = await supabase
    .from("subdistricts")
    .update(subdistrictData)
    .eq("id", subdistrictId)
    .select(
      `
      *,
      cities!fk_subdistricts_city (
        name
      )
    `
    )
    .single();

  if (error) throw error;
  return data;
}

// Fungsi untuk delete subdistrict
export async function deleteSubdistrict(subdistrictId: string) {
  const { error } = await supabase
    .from("subdistricts")
    .delete()
    .eq("id", subdistrictId);

  if (error) throw error;
}

// Fungsi untuk menambah branch baru
export async function createBranch(branchData: {
  name: string;
  subdistrict_id: string;
}) {
  try {
    // Generate UUID dan gabungkan dengan data kota
    const newBranch = {
      id: uuidv4(),
      name: branchData.name,
      subdistrict_id: branchData.subdistrict_id,
    };
    const { data, error } = await supabase
      .from("branches")
      .insert(newBranch)
      .select(
        `
        *,
        subdistricts!branches_subdistrict_id_fkey (
          name,
          cities!fk_subdistricts_city (
            name
          )
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "42501") {
        throw new Error(
          "Tidak memiliki izin untuk menambah data. Periksa RLS policies."
        );
      } else if (error.code === "23505") {
        throw new Error("Cabang dengan nama tersebut sudah ada.");
      } else if (error.code === "23503") {
        throw new Error("Kecamatan yang dipilih tidak valid.");
      } else {
        throw error;
      }
    }

    return data;
  } catch (error) {
    console.error("Create branch error:", error);
    throw error;
  }
}

// Fungsi untuk update branch
export async function updateBranch(
  branchId: string,
  branchData: {
    name: string;
    subdistrict_id: string;
  }
) {
  const { data, error } = await supabase
    .from("branches")
    .update(branchData)
    .eq("id", branchId)
    .select(
      `
      *,
      subdistricts!branches_subdistrict_id_fkey (
        name,
        cities!fk_subdistricts_city (
          name
        )
      )
    `
    )
    .single();

  if (error) throw error;
  return data;
}

// Fungsi untuk delete branch
export async function deleteBranch(branchId: string) {
  const { error } = await supabase.from("branches").delete().eq("id", branchId);

  if (error) throw error;
}
