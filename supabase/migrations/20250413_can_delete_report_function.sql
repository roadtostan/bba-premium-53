
-- Function to determine if a user can delete a report
CREATE OR REPLACE FUNCTION public.can_delete_report(p_user_id UUID, p_report_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role TEXT;
  v_report_status TEXT;
  v_user_subdistrict TEXT;
  v_report_subdistrict TEXT;
  v_report_branch_manager UUID;
BEGIN
  -- Get user information
  SELECT role::TEXT, subdistrict INTO v_user_role, v_user_subdistrict
  FROM users
  WHERE id = p_user_id;
  
  -- Get report information
  SELECT 
    r.status,
    r.branch_manager,
    s.name
  INTO 
    v_report_status,
    v_report_branch_manager,
    v_report_subdistrict
  FROM reports r
  LEFT JOIN subdistricts s ON r.subdistrict_id = s.id
  WHERE r.id = p_report_id;
  
  -- Super admin can delete any report
  IF v_user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Subdistrict admin can delete reports in their subdistrict that are NOT approved
  IF v_user_role = 'subdistrict_admin' AND
     v_user_subdistrict = v_report_subdistrict AND
     v_report_status != 'approved' THEN
    RETURN TRUE;
  END IF;
  
  -- Branch user can delete their own reports that are in draft or rejected status
  IF v_user_role = 'branch_user' AND 
     v_report_branch_manager = p_user_id AND
     (v_report_status = 'draft' OR v_report_status = 'rejected') THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;
