-- Learners who bought a course can always read it (study view + dashboard tab)

drop policy if exists "Purchasers can view purchased courses" on courses;

create policy "Purchasers can view purchased courses"
  on courses for select
  using (
    exists (
      select 1
      from course_purchases cp
      where cp.course_id = courses.id
        and cp.user_id = auth.uid()
    )
  );
