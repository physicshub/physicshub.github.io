import TAGS, { LEVELS, DIFFICULTIES } from "../tags.js";

export const ballAcceleratingBlog = {
  id: "bb-003",
  slug: "ball-uniformly-accelerated-motion",
  name: "How does a ball accelerate toward a target?",
  desc: "Acceleration is how fast velocity changes. Aim a constant acceleration at a target and the ball speeds up, overshoots and loops back — here is why.",
  tags: [
    LEVELS.lowerSecondary,
    DIFFICULTIES.core,
    TAGS.PHYSICS,
    TAGS.KINEMATICS,
    TAGS.ACCELERATION,
  ],
  date: "21/01/2026",
  updated: "06/09/2026",
  theory: {
    sections: [
      {
        blocks: [
          {
            type: "sectionTitle",
            text: "How does a ball accelerate toward a target?",
          },
          {
            type: "paragraph",
            text: 'In this simulation the ball is given a **constant acceleration** that always points at your cursor. Acceleration means "how quickly the velocity is changing", so every moment the ball\'s speed and direction shift a little more toward the target. It does not stop when it arrives — it already has speed, so it shoots past and the acceleration curves it back around, making it loop or wobble around the cursor.',
          },
          {
            type: "callout",
            calloutType: "key",
            title: "Key fact",
            text: "Acceleration changes velocity, not position. A constant acceleration toward a point makes the ball speed up on the way in, overshoot, and swing back — the same way a thrown ball keeps rising for a moment after you let go.",
          },
          {
            type: "takeaways",
            title: "Key takeaways",
            items: [
              "**Velocity** is how fast and which way the ball moves; **acceleration** is how fast that velocity changes.",
              "Here the acceleration has a fixed size and always aims at the cursor, so the ball keeps gaining speed toward it.",
              "The ball overshoots the target because it still has velocity when it gets there — acceleration cannot stop it instantly.",
              "The **max speed** setting caps how fast it can go, which keeps the motion from running away.",
            ],
          },
          {
            type: "sectionTitle",
            text: "Velocity vs acceleration",
          },
          {
            type: "paragraph",
            text: "It is easy to mix these two up. **Velocity** tells you the motion right now: 3 m/s to the right, say. **Acceleration** tells you how that velocity is about to change: gaining 2 m/s of rightward speed every second. A ball can have a large velocity and zero acceleration (coasting at a steady speed) or zero velocity and a large acceleration (the instant you drop it).",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Acceleration in the **same direction** as the velocity → the ball speeds up.",
              "Acceleration **opposite** to the velocity → the ball slows down.",
              "Acceleration **sideways** to the velocity → the ball turns without changing speed.",
            ],
          },
          {
            type: "paragraph",
            text: "In the simulation the acceleration points at the cursor while the ball's velocity points wherever it happens to be heading, so all three of these happen in turn as it circles the target.",
          },
          {
            type: "sectionTitle",
            text: "The equations of uniformly accelerated motion",
          },
          {
            type: "paragraph",
            text: '"Uniformly accelerated" means the acceleration $a$ stays constant. Over a time $t$, a constant acceleration adds a steady amount of velocity, and the position follows a curve rather than a straight line:',
          },
          {
            type: "formula",
            ref: "displacement-constant-acceleration",
            latex:
              "\\begin{aligned}v(t) &= v_0 + a\\,t \\\\[2pt] x(t) &= x_0 + v_0\\,t + \\tfrac{1}{2}a\\,t^2\\end{aligned}",
          },
          {
            type: "paragraph",
            text: "The $\\tfrac12 a t^2$ term is what makes the ball's path bend. If the acceleration always pointed in one fixed direction (like gravity), that curve would be a parabola. Because this acceleration keeps re-aiming at the moving target, the path becomes a loop.",
          },
          {
            type: "note",
            text: 'The simulation works in metres and seconds. "Acceleration = 2" means the ball gains 2 m/s of speed toward the cursor every second, until it hits the max-speed limit.',
          },
          {
            type: "sectionTitle",
            text: "Why does it overshoot and orbit?",
          },
          {
            type: "paragraph",
            text: "When the ball reaches the cursor it is moving fast. Acceleration cannot delete that velocity in an instant — it can only bend it. So the ball flies past, and now the acceleration (still pointing back at the cursor) acts sideways to the motion and curves the ball into a turn. Repeat, and you get an orbit-like loop. Raise the acceleration and the loops get tighter and faster; lower the max speed and the ball settles closer to the target.",
          },
          {
            type: "callout",
            calloutType: "tip",
            title: "Try this",
            text: "Set the acceleration high and the max speed low, then move your cursor slowly. The ball trails behind like a dog on a lead. Now set max speed high and watch it fling itself into wide, looping arcs it can barely control.",
          },
          {
            type: "callout",
            calloutType: "info",
            title: "Where this shows up",
            text: 'A constant acceleration toward a target is exactly how a simple homing rocket or a "seek" behaviour in a video game works. The overshoot-and-correct wobble is why real guided projectiles need something extra — a brake, or steering that also looks at how fast it is closing in.',
          },
          {
            type: "faq",
            title: "Frequently asked questions",
            items: [
              {
                q: "What is the difference between speed, velocity and acceleration?",
                a: "Speed is just how fast something moves. Velocity is speed together with a direction. Acceleration is the rate at which velocity changes — speeding up, slowing down, or changing direction all count as acceleration.",
              },
              {
                q: "If the ball is accelerating toward the cursor, why doesn't it just stop there?",
                a: "Because acceleration changes velocity gradually, not instantly. By the time the ball reaches the cursor it has built up speed, and that speed carries it past. The acceleration then curves it back, so it loops around instead of stopping.",
              },
              {
                q: 'What does "uniformly accelerated" mean?',
                a: "It means the acceleration keeps the same magnitude the whole time. The direction can still change — here it always points at the cursor — but the strength of the pull is constant.",
              },
              {
                q: "Does a heavier ball accelerate more slowly?",
                a: "For the same force, yes — but this simulation sets the acceleration directly, so the ball's mass does not change the motion. Change the acceleration slider and you are changing the result directly.",
              },
            ],
          },
          {
            type: "sectionTitle",
            text: "Keep exploring",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Chase the cursor yourself in the [Ball Acceleration simulation](/simulations/BallAcceleration).",
              "The same equations with gravity as the acceleration: [How projectile motion works](/blog/projectile-parabolic-motion).",
              "What happens when the only acceleration is gravity: [Free fall and air resistance](/blog/ball-free-fall-comprehensive-guide).",
              "Splitting motion into directions: [The guide to vector operations](/blog/comprehensive-guide-to-vector-operations).",
            ],
          },
        ],
      },
    ],
  },
};
