
-- Create a SECURITY DEFINER function to safely retrieve report location data
-- This function bypasses RLS and avoids infinite recursion
CREATE OR REPLACE FUNCTION public.get_report_location_data_safe(p_report_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_location_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'branch_id', r.branch_id,
    'subdistrict_id', r.subdistrict_id,
    'city_id', r.city_id
  )
  INTO v_location_data
  FROM reports r
  WHERE r.id = p_report_id;
  
  RETURN v_location_data;
END;
$$;
