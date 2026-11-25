---
layout: paper
title: "Disentangling Planning and Control for Non-Prehensile Tabletop Manipulation"
short: "Disentangling Planning and Control"
description: "A framework for non-prehensile tabletop manipulation that separates an A* planner from a low-level, object-centric RL controller that pushes objects by striking them. IEEE CASE 2023."
keywords:
  - "non-prehensile manipulation"
  - "pushing by striking"
  - "push-by-strike"
  - "tabletop manipulation"
  - "planning and control"
  - "A* planner"
  - "object-centric reinforcement learning"
  - "model-free RL"
  - "robot manipulation"
topics: [robot-manipulation, planning]
order: 4
authors:
  - "Vishal Reddy Mandadi"
  - "Kallol Saha"
  - "Dipanwita Guhathakurta"
  - "M Nomaan Qureshi"
  - "Aditya Agarwal"
  - "Bipasha Sen"
  - "Dipanjan Das"
  - "Brojeshwar Bhowmick"
  - "Arun Singh"
  - "Madhava Krishna"
venue: "2023 IEEE 19th International Conference on Automation Science and Engineering (CASE)"
year: 2023
pub_date: "2023"
paper_link: "https://ieeexplore.ieee.org/abstract/document/10260462"
doi: "10.1109/CASE56687.2023.10260462"
image: "/images/case2023.jpg"
highlight: false
tldr: "Push + Grasp is an essential skill."
contribution: "I did not contribute much to this paper. I helped Vishal with the RL controller part, but Vishal and Kallol did most of the work."
demo: disentangling
demo_title: "Draw the intention: plan where the object goes, control how to strike it"
demo_text: "This is a tabletop seen from above, drawn as a tactical sketch. You set the intent by dragging the destination. A planner inks a route for the object around the clutter, as numbered waypoints; like the paper, it is an A* search that only looks at the scene. A separate low-level controller, the small dark striker, only looks at the object: it lines up behind it and strikes it so that it slides to the next waypoint, then corrects with another strike if it stopped short. The coral line records where the object has actually gone. Once the object is in the clear, the gripper closes on it. Switch the planner off and the controller strikes straight at the destination: the object bounces off the clutter and needs more strikes, as the tally in the corner shows. In the paper the striking controller is learned with reinforcement learning; here the strike strength comes from a simple friction model."
venue_short: "CASE 2023"
video: "/images/case2023.mp4"
image_w: 600
image_h: 600
pages: "1-6"
abstract: "Manipulating a target object using non-prehensile actions presents a complex problem that requires addressing multiple constraints, such as finding collision-free trajectories, modeling the object dynamics, and speed of execution. Previous approaches have relied on contact-rich manipulation, where the object moves predictably while attached to the manipulator, thereby avoiding the need to model the object's dynamics. However, this assumption may not always hold, and different end-effectors may be necessary depending on the use case. In place of contact-rich manipulation, we implement the pushing-by-striking method (without tactile feedback) by explicitly modeling the object dynamics. Our novel framework disentangles planning and control enabling us to operate in a context-free manner. Our method consists of two components: an A* planner and a low-level RL controller. The low-level RL controller feeds on purely object-centric representations and has an object-centric action space, thus making it agnostic of the scene context. On the other hand, the planning module operates independently of the low-level control and only takes scene context into account, making the approach quick to adapt and implement. We demonstrate the performance of our algorithm against a global RL policy which is computationally expensive and unreliable to train or fine-tune. To the best of our knowledge, a model-free RL policy without tactile feedback on push-by-strike problems has not been addressed before."
faq:
  - q: "What does the paper propose?"
    a: "A framework for non-prehensile tabletop manipulation that disentangles planning from control. It has two components: an A* planner that takes the scene context into account, and a low-level reinforcement learning (RL) controller that moves the object."
  - q: "What is pushing by striking?"
    a: "Instead of contact-rich manipulation, where the object moves predictably while attached to the manipulator, the robot strikes the object and the object's dynamics are modelled explicitly. The paper does this without tactile feedback."
  - q: "Why separate the planner from the controller?"
    a: "The low-level RL controller uses purely object-centric representations and an object-centric action space, so it is agnostic of the scene context. The planning module operates independently of the low-level control and only takes the scene context into account, which makes the approach quick to adapt and implement."
  - q: "What is the method compared against?"
    a: "A global RL policy, which the paper describes as computationally expensive and unreliable to train or fine-tune."
bibtex: |
  @inproceedings{mandadi2023disentangling,
    author    = {Vishal Reddy Mandadi and Kallol Saha and Dipanwita Guhathakurta and M. Nomaan Qureshi and Aditya Agarwal and Bipasha Sen and Dipanjan Das and Brojeshwar Bhowmick and Arun Singh and Madhava Krishna},
    title     = {Disentangling Planning and Control for Non-Prehensile Tabletop Manipulation},
    booktitle = {2023 IEEE 19th International Conference on Automation Science and Engineering (CASE)},
    year      = {2023},
    pages     = {1-6},
    doi       = {10.1109/CASE56687.2023.10260462}
  }
---
