---
layout: paper
title: "Learning Arc-Length Value Function for Fast Time-Optimal Pick and Place Sequence Planning and Execution"
short: "Arc-Length Value Function"
order: 5
authors:
  - "Prajwal Thakur*"
  - "M Nomaan Qureshi*"
  - "Arun Kumar Singh"
  - "YVS Harish"
  - "Pushkal Katara"
  - "Houman Masnavi"
  - "K Madhava Krishna"
  - "Brojeshwar Bhowmick"
venue: "2023 International Joint Conference on Neural Networks (IJCNN)"
year: 2023
pub_date: "2023"
paper_link: "https://ieeexplore.ieee.org/abstract/document/10191434"
doi: "10.1109/IJCNN54540.2023.10191434"
image: "/images/ijcnn.gif"
highlight: false
tldr: "Shortest path in euclidean space is not the shortest path in joint space."
contribution: "Prof. Arun came up with the formulation. I along with Prajwal implemented it and wrote the paper. "
demo: arc-length
demo_title: "Simulator: the shortest path for the gripper is not the fastest for the joints"
demo_text: "Five cubes must each go to their own slot on the tray, and the order is up to the robot. Ordering the picks to minimise how far the gripper travels in Cartesian space is the obvious choice, but the joints are what actually have to move, and their speed limits decide how long each transfer takes. This toy finds both orders by trying every sequence; the paper learns an arc-length value function so that this ranking is fast enough to do online. Drag or shuffle the cubes and compare."
bibtex: |
  @inproceedings{thakur2023learning,
    author    = {Prajwal Thakur and M. Nomaan Qureshi and Arun Kumar Singh and Y V S Harish and Pushkal Katara and Houman Masnavi and K. Madhava Krishna and Brojeshwar Bhowmick},
    title     = {Learning Arc-Length Value Function for Fast Time-Optimal Pick and Place Sequence Planning and Execution},
    booktitle = {2023 International Joint Conference on Neural Networks (IJCNN)},
    year      = {2023},
    pages     = {1-10},
    doi       = {10.1109/IJCNN54540.2023.10191434}
  }
---
