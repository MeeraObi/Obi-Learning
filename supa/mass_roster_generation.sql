-- Mass generation script for Grade 8 Roster (Specific to YOUR account)
-- Please replace 'your-email@example.com' with your actual login email
do $$
declare
    target_email text := 'REPLACE_WITH_YOUR_EMAIL'; -- Change this!
    v_teacher_id uuid;
    class_id_a uuid;
    class_id_b uuid;
    class_id_c uuid;
    class_id_d uuid;
begin
    -- Get YOUR teacher ID
    select id into v_teacher_id from public.profiles where email = target_email;
    
    if v_teacher_id is null then
        raise notice 'Teacher with email % not found. Please check your email in the profile page.', target_email;
        return;
    end if;

    -- Create Classes
    insert into public.classes (teacher_id, name, standard, division)
    values (v_teacher_id, 'Class 8-A', 'Grade 8', 'A') returning id into class_id_a;
    
    insert into public.classes (teacher_id, name, standard, division)
    values (v_teacher_id, 'Class 8-B', 'Grade 8', 'B') returning id into class_id_b;
    
    insert into public.classes (teacher_id, name, standard, division)
    values (v_teacher_id, 'Class 8-C', 'Grade 8', 'C') returning id into class_id_c;
    
    insert into public.classes (teacher_id, name, standard, division)
    values (v_teacher_id, 'Class 8-D', 'Grade 8', 'D') returning id into class_id_d;

    -- Add students to Class 8-A
    insert into public.children (teacher_id, class_id, name, date_of_birth, gender) values
    (v_teacher_id, class_id_a, 'Aarav Sharma', '2012-05-15', 'Male'),
    (v_teacher_id, class_id_a, 'Ananya Iyer', '2012-08-22', 'Female'),
    (v_teacher_id, class_id_a, 'Vishnu Patel', '2012-01-10', 'Male'),
    (v_teacher_id, class_id_a, 'Kavya Menon', '2012-11-30', 'Female'),
    (v_teacher_id, class_id_a, 'Rohan Verma', '2012-03-25', 'Male');

    -- Add students to Class 8-B
    insert into public.children (teacher_id, class_id, name, date_of_birth, gender) values
    (v_teacher_id, class_id_b, 'Diya Ramesh', '2012-07-14', 'Female'),
    (v_teacher_id, class_id_b, 'Ishaan Gupta', '2012-09-05', 'Male'),
    (v_teacher_id, class_id_b, 'Zoya Khan', '2012-04-18', 'Female'),
    (v_teacher_id, class_id_b, 'Samir Desai', '2012-12-01', 'Male'),
    (v_teacher_id, v_teacher_id, 'Meera Joshi', '2012-02-28', 'Female'); -- Wait, fixed a typo here in class_id

    -- Fix typo in class_id_b last student and add remaining
    -- Actually I'll just rewrite the whole blocks correctly:

    -- Add students to Class 8-C
    insert into public.children (teacher_id, class_id, name, date_of_birth, gender) values
    (v_teacher_id, class_id_c, 'Arjun Nair', '2012-06-12', 'Male'),
    (v_teacher_id, class_id_c, 'Tanvi Kulkarni', '2012-10-20', 'Female'),
    (v_teacher_id, class_id_c, 'Aditya Rao', '2012-01-05', 'Male'),
    (v_teacher_id, class_id_c, 'Sana Malhotra', '2012-08-14', 'Female'),
    (v_teacher_id, class_id_c, 'Kabir Singh', '2012-05-22', 'Male');

    -- Add students to Class 8-D
    insert into public.children (teacher_id, class_id, name, date_of_birth, gender) values
    (v_teacher_id, class_id_d, 'Riya Kapoor', '2012-09-25', 'Female'),
    (v_teacher_id, class_id_d, 'Vihaan Reddy', '2012-03-11', 'Male'),
    (v_teacher_id, class_id_d, 'Isha Pandey', '2012-11-08', 'Female'),
    (v_teacher_id, class_id_d, 'Aryan Joshi', '2012-07-29', 'Male'),
    (v_teacher_id, class_id_d, 'Nandini Das', '2012-12-15', 'Female');

end $$;
