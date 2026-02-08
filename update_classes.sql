-- STEP 1: Check what classes currently exist
SELECT id, name, standard, division FROM classes ORDER BY name;

-- STEP 2: Delete subject-based classes
-- Note: If you get a foreign key constraint error, you may need to first 
-- update or delete related records in the children table
DELETE FROM classes 
WHERE name IN ('English', 'EVS', 'Maths', 'Mathematics', 'Science', 'Hindi', 'Social Science', 'Universal Science');

-- STEP 3: Verify only propers classes remain
SELECT id, name, standard, division FROM classes ORDER BY standard, division;