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
demo_title: "Simulator: plan where to push, then control how to push"
demo_text: "The red object cannot be picked up where it is useful until it has been pushed to the goal ring, and a wall is in the way. The problem is split in two: a planner decides where the object should go next (blue waypoints around the wall), and a separate low-level controller works out how to push it there. With the planner switched off the controller pushes straight at the goal and jams the object against the wall. Drag the object, the wall or the goal."
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
