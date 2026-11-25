---
layout: paper
title: "Disentangling Planning and Control for Non-Prehensile Tabletop Manipulation"
short: "Disentangling Planning and Control"
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
image: "/images/case2023.gif"
highlight: false
tldr: "Push + Grasp is an essential skill."
contribution: "I did not contribute much to this paper. I helped Vishal with the RL controller part, but Vishal and Kallol did most of the work."
demo: disentangling
demo_title: "Draw the intention: plan where to push, control how to push"
demo_text: "This is a tabletop seen from above, drawn as a tactical sketch. You set the intent by dragging the destination. A planner inks a route for the object around the clutter, as numbered waypoints. A separate low-level controller, the small dark pusher, works out the contact needed to move the object along that route, and the coral line records where the object has actually gone. Once the object is in the clear, the gripper closes on it. Switch the planner off and the controller pushes straight at the destination and jams the object against the clutter."
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
