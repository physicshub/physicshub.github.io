-- PhysicsHub community — official starter presets (run after
-- 20260925000000_hardening.sql, from the SQL Editor or `supabase db push`).
--
-- A simulation with no presets shows an empty section, so the site ships its
-- own — one or two per simulation, signed "PhysicsHub" and featured. Every
-- preset needs an author (presets.author_id → profiles.id → auth.users.id), so
-- this creates one system account that can never sign in, and lets that
-- account — and only that one — use the reserved name. Safe to run more than
-- once: existing presets (same author, simulation and title) are skipped.
--
-- Each preset stores only the inputs it changes; "Try it" merges them over the
-- simulation's INITIAL_INPUTS (hooks/useExternalInputs.ts).

-- ---------------------------------------------------------------------------
-- 1. The system account: no password, an unreachable .invalid address, and
-- banned, so neither a password nor a magic link can ever open it.
-- ---------------------------------------------------------------------------

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, banned_until,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at
)
values (
  '00000000-0000-4000-8000-00000000c0de',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'presets@physicshub.invalid', '',
  now(), '2999-12-31 00:00:00+00',
  '{"provider": "email", "providers": ["email"]}', '{}',
  '', '', '', '',
  now(), now()
)
on conflict (id) do nothing;

-- handle_new_user() has already given it a pseudonym; the reserved-name rule
-- makes an exception for this one id, then the profile takes the site's name.
alter table public.profiles
  drop constraint if exists profiles_display_name_reserved,
  add constraint profiles_display_name_reserved
    check (
      id = '00000000-0000-4000-8000-00000000c0de'
      or lower(display_name) !~ '(physics ?hub|admin|moderator|official|staff|support)'
    );

insert into public.profiles (id, display_name)
values ('00000000-0000-4000-8000-00000000c0de', 'PhysicsHub')
on conflict (id) do update set display_name = excluded.display_name;

-- ---------------------------------------------------------------------------
-- 2. The presets. Written as the service role, so the rate limiter skips them
-- and `featured` is writable; `is_valid_inputs` and the text checks still run.
-- ---------------------------------------------------------------------------

insert into public.presets (sim_id, title, description, inputs, author_id, featured)
select v.sim_id, v.title, v.description, v.inputs::jsonb,
       '00000000-0000-4000-8000-00000000c0de', true
from (values
  -- ArchimedesPrinciple -----------------------------------------------------
  (
    'ArchimedesPrinciple',
    'Floating in the Dead Sea',
    'Brine this salty (about 1240 kg/m³) holds up things that sink in fresh water. Plastic at 1150 kg/m³ now floats, barely: about 93% of it under the surface, since the submerged fraction is the density ratio. Ice rides higher than in water, about 74% under. Iron still sinks.',
    '{"fluidDensity": 1240, "object1Material": 1150, "object2Material": 917, "object3Material": 7850}'
  ),
  (
    'ArchimedesPrinciple',
    'Ice that sinks',
    'In alcohol (about 790 kg/m³) an ice cube is denser than the liquid, so it goes straight to the bottom. Oak still floats, but only about 11% of it stays above the surface. Cork floats high, about 30% submerged.',
    '{"fluidDensity": 790, "object1Material": 917, "object2Material": 700, "object3Material": 240}'
  ),

  -- BallAcceleration --------------------------------------------------------
  (
    'BallAcceleration',
    'Weak push, high speed limit',
    'A small acceleration and a generous speed limit: the ball cannot turn quickly, so it overshoots the pointer and swings round it in wide loops. Acceleration changes the velocity gradually, it does not point the ball straight at the target.',
    '{"acceleration": 1, "maxspeed": 15}'
  ),
  (
    'BallAcceleration',
    'Strong push, low speed limit',
    'Here the ball reaches its 3 m/s cap almost instantly, so it follows the pointer at nearly constant speed and turns sharply. Compare with the wide loops you get when the acceleration is small.',
    '{"acceleration": 20, "maxspeed": 3}'
  ),

  -- BallGravity -------------------------------------------------------------
  (
    'BallGravity',
    'Dropped on Jupiter',
    'Gravity is about 2.5 times Earth''s, so the ball falls much faster and each bounce is quicker. With restitution 0.7 every rebound reaches 49% of the previous height, the same ratio as on any planet: bounce height depends on e², not on g.',
    '{"gravity": 24.79968, "restitution": 0.7}'
  ),
  (
    'BallGravity',
    'Frictionless floor',
    'Hold the mouse button to blow wind, then let go. With no friction nothing slows the ball horizontally, so it keeps sliding at the speed the wind gave it (Newton''s first law). Raise the friction coefficient to watch it stop.',
    '{"frictionMu": 0, "restitution": 0.5, "wind": 6}'
  ),

  -- BouncingBall ------------------------------------------------------------
  (
    'BouncingBall',
    'Bouncing on the Moon',
    'One-sixth of Earth''s gravity. With restitution 0.8 each bounce still reaches 64% of the previous height, exactly as on Earth, but every fall lasts about 2.5 times longer, because fall time grows as one over the square root of g.',
    '{"gravity": 1.61865, "restitution": 0.8}'
  ),
  (
    'BouncingBall',
    'A ball that gains energy',
    'Restitution above 1 means the ball leaves the floor faster than it arrived, so every bounce goes higher. No real passive ball can do this: energy would have to come from nowhere. Try it to see what the coefficient really controls.',
    '{"restitution": 1.05}'
  ),

  -- CircularMotion ----------------------------------------------------------
  (
    'CircularMotion',
    'Tight and fast',
    'At 4 m/s on a 0.5 m radius the centripetal acceleration is v²/r = 32 m/s², more than three times gravity, and one lap takes under 0.8 s. The velocity vector keeps its length but never its direction.',
    '{"radius": 0.5, "speed": 4}'
  ),
  (
    'CircularMotion',
    'Same speed, wider circle',
    'Same 4 m/s as a tight circle, but a 2 m radius: four times the radius gives a quarter of the centripetal acceleration, 8 m/s². The speed alone does not decide how hard the ball must be pulled inward.',
    '{"radius": 2, "speed": 4}'
  ),

  -- CollisionSimulation -----------------------------------------------------
  (
    'CollisionSimulation',
    'Heavy meets light',
    'A 10 kg ball hits a 1 kg ball head-on, both at 2 m/s, elastically. The heavy ball barely slows (to about 1.3 m/s) while the light one bounces back at about 5.3 m/s. Momentum and kinetic energy are both conserved.',
    '{"mass1": 10, "mass2": 1, "velocity1": 2, "velocity2": 2, "restitution": 1}'
  ),
  (
    'CollisionSimulation',
    'They stick together',
    'Restitution 0 is a perfectly inelastic collision: equal masses at 3 m/s and 1 m/s meet and move off together at 1 m/s. Momentum is conserved, but 80% of the kinetic energy is gone, turned into heat and deformation.',
    '{"mass1": 1, "mass2": 1, "velocity1": 3, "velocity2": 1, "restitution": 0}'
  ),

  -- DoublePendulum ----------------------------------------------------------
  (
    'DoublePendulum',
    'Balanced upside down',
    'Both arms start almost straight up, one degree apart. The pendulum hesitates at the top, then falls into chaos: flips, loops and near-stops that never repeat. Change either angle by a single degree and the whole motion is different, which is what sensitivity to initial conditions means.',
    '{"initialAngle1": 179, "initialAngle2": 180, "damping": 0}'
  ),
  (
    'DoublePendulum',
    'A calm normal mode',
    'Small angles, with the lower arm at about 1.41 (the square root of 2) times the upper one: this is the slow normal mode of equal arms and masses. Both bobs swing in step with one period, about 3.7 s here, and the chaos never appears.',
    '{"initialAngle1": 10, "initialAngle2": 14, "damping": 0}'
  ),

  -- HorizontalSpring --------------------------------------------------------
  (
    'HorizontalSpring',
    'A one-second oscillator',
    'k is 4π² N/m (about 39.5) for a 1 kg bob, so the period 2π·sqrt(m/k) is exactly 1 s. Pull the bob and let go: with no friction the amplitude never shrinks, and the period does not depend on how far you pull.',
    '{"bobMass": 1, "springK": 39.48, "bobDamping": 0}'
  ),
  (
    'HorizontalSpring',
    'Friction, not damping',
    'The friction here has a fixed 2 N magnitude, like a block sliding on a table. Pull the bob and let go: the swings shrink by the same distance every cycle (4F/k = 0.16 m), a straight-line decay rather than an exponential one, and it stops dead within 4 cm of rest.',
    '{"bobMass": 1, "springK": 50, "bobDamping": 2}'
  ),

  -- InclinedPlane -----------------------------------------------------------
  (
    'InclinedPlane',
    'On the edge of slipping',
    'With static friction 0.5 the block holds until the slope reaches arctan(0.5), about 26.6°. At 26° it stays put. Raise the angle by one degree and it starts to slide, then keeps sliding because kinetic friction is weaker.',
    '{"angle": 26, "frictionStatic": 0.5, "frictionKinetic": 0.3}'
  ),
  (
    'InclinedPlane',
    'Pushing it uphill',
    'Starting the 2 kg block up a 30° slope takes more than 18.3 N: the weight component along the slope plus static friction. The 25 N push wins, and once the block moves the weaker kinetic friction lets it accelerate at about 5 m/s².',
    '{"mass": 2, "angle": 30, "frictionStatic": 0.5, "frictionKinetic": 0.3, "appliedForce": 25, "appliedAngle": 0}'
  ),

  -- ParabolicMotion ---------------------------------------------------------
  (
    'ParabolicMotion',
    'From a height, 45° is not the best',
    'Launched at 5 m/s from 3 m up, the longest range comes at about 29°, not 45°: the ball is already falling toward a lower landing point, so a flatter throw wins. It lands about 4.7 m away, against 4.3 m at 45°.',
    '{"v0": 5, "angle": 29, "h0": 3}'
  ),
  (
    'ParabolicMotion',
    'Air drag breaks the symmetry',
    'With drag, the path is no longer a parabola: the ball rises more steeply than it falls, peaks early and lands well short of the drag-free guide. Drag grows with the square of speed, so it matters most at the start.',
    '{"v0": 8, "angle": 45, "dragCoeff": 0.1, "showGuides": true}'
  ),

  -- PiCollisions ------------------------------------------------------------
  (
    'PiCollisions',
    '314 collisions',
    'Make the big block 10,000 times heavier than the small one and count: the blocks collide exactly 314 times, the first three digits of π. Each factor of 100 in the mass ratio adds one more digit.',
    '{"smallBlockMass": 1, "largeBlockMass": 10000}'
  ),
  (
    'PiCollisions',
    '3141 collisions',
    'A mass ratio of one million gives exactly 3141 collisions, the first four digits of π. Most of them happen in a blur near the wall while the small block rattles back and forth.',
    '{"smallBlockMass": 1, "largeBlockMass": 1000000}'
  ),

  -- RayTracing --------------------------------------------------------------
  (
    'RayTracing',
    'Mirror sphere',
    'Reflectivity near its maximum and very little diffuse colour: most of what you see is the floor and the sky reflected in the sphere, traced by secondary rays. A high shininess keeps the highlight small and sharp.',
    '{"kd": 0.15, "ks": 0.9, "shininess": 180, "reflectivity": 0.9}'
  ),
  (
    'RayTracing',
    'Matte clay',
    'No specular highlight and no reflection: pure Lambert shading, where brightness depends only on the angle between the surface and the light. Move the light and watch the terminator, the line between lit and unlit, follow it.',
    '{"kd": 0.9, "ks": 0, "reflectivity": 0}'
  ),

  -- SimplePendulum ----------------------------------------------------------
  (
    'SimplePendulum',
    'The seconds pendulum',
    'A 1 m pendulum on Earth, with a small swing and no damping: the period is 2π·sqrt(L/g), about 2.0 s, so each swing one way takes one second. This is the classic grandfather-clock pendulum.',
    '{"length": 1, "gravity": 9.81, "initialAngle": 5, "damping": 0}'
  ),
  (
    'SimplePendulum',
    'Large swings run slow',
    'Released from 90°, the pendulum takes about 18% longer per swing than 2π·sqrt(L/g) predicts. That formula assumes sin θ is close to θ, which only holds for small angles.',
    '{"length": 3, "initialAngle": 90, "damping": 0}'
  ),

  -- SpringConnection --------------------------------------------------------
  (
    'SpringConnection',
    'Heavy bob, soft spring',
    'A 5 kg bob on a 50 N/m spring hangs about 1 m below the spring''s rest length (mg/k) and, with no damping, bobs with a period of 2π·sqrt(m/k), about 2 s. Gravity only moves the equilibrium: it does not change the period.',
    '{"bobMass": 5, "springK": 50, "bobDamping": 0}'
  ),
  (
    'SpringConnection',
    'Critically damped',
    'Damping of 10 N·s/m is exactly 2·sqrt(km) for this 0.5 kg bob and 50 N/m spring. Pull the bob and let go: it returns to rest as fast as possible without overshooting. Lower the damping to see it oscillate.',
    '{"bobMass": 0.5, "springK": 50, "bobDamping": 10}'
  ),

  -- ThreeBody ---------------------------------------------------------------
  (
    'ThreeBody',
    'Lagrange triangle, nudged',
    'Three equal masses on an equilateral triangle are an exact solution of the three-body problem, but an unstable one. A tiny nudge is enough: the triangle turns rigidly for a few orbits, then the error grows exponentially and it flies apart. Set Randomness back to 0 and it holds far longer.',
    '{"configuration": "lagrange", "chaos": 0.05, "trailEnabled": true}'
  ),
  (
    'ThreeBody',
    'Figure-eight, nudged',
    'The same small nudge that tears the Lagrange triangle apart barely disturbs the figure-eight orbit: the three bodies keep chasing each other along a slightly wobbling eight. Unlike the triangle, this solution is stable.',
    '{"configuration": "figure8", "chaos": 0.05, "trailEnabled": true}'
  ),

  -- TrigonometricCircle -----------------------------------------------------
  (
    'TrigonometricCircle',
    'Cosine is a shifted sine',
    'A phase of π/2 slides the sine curve a quarter turn to the left, and it lands exactly on the cosine: sin(θ + π/2) = cos θ. Compare the curve with the horizontal projection on the circle.',
    '{"model": "sin", "phase": 1.57}'
  ),
  (
    'TrigonometricCircle',
    'Tangent and its asymptotes',
    'tan θ is the height where the radius, extended, meets the tangent line at x = 1. As θ approaches 90° that line runs parallel to the radius, so the value shoots off to infinity: the vertical asymptotes.',
    '{"model": "tan", "showTangent": true, "showAsymptotes": true}'
  ),

  -- VectorsOperations -------------------------------------------------------
  (
    'VectorsOperations',
    'Parallelogram rule',
    'Addition drawn as a parallelogram: A and B start from the same point, and the diagonal is A + B. Move the pointer to change B and notice that the same diagonal closes the tip-to-tail triangle too.',
    '{"operation": "+", "visualizeMode": "parallelogram", "vectorAMag": 150, "vectorAAngle": 30}'
  ),
  (
    'VectorsOperations',
    'When the dot product is zero',
    'A points along the x axis; B follows the pointer. The dot product is |A| times the projection of B onto A: positive when they point the same way, zero at exactly 90°, negative beyond it.',
    '{"operation": "dot", "vectorAMag": 200, "vectorAAngle": 0}'
  )
) as v(sim_id, title, description, inputs)
where not exists (
  select 1 from public.presets p
  where p.author_id = '00000000-0000-4000-8000-00000000c0de'
    and p.sim_id = v.sim_id
    and p.title = v.title
);
