---
layout: paper
title: "Learning Arc-Length Value Function for Fast Time-Optimal Pick and Place Sequence Planning and Execution"
short: "Arc-Length Value Function"
description: "Learns an arc-length value function in a robot arm's joint space to plan and execute time-optimal pick-and-place sequences quickly. IJCNN 2023."
keywords:
  - "arc-length value function"
  - "pick and place"
  - "sequence planning"
  - "time-optimal planning"
  - "joint space"
  - "task sequencing"
  - "robot arm"
  - "value function learning"
topics: [planning, robot-manipulation]
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
demo_title: "The expensive shortcut: shortest for the gripper is not shortest for the joints"
demo_text: "Four cubes must each go to the pad of their own colour, and the order of the jobs is up to the robot. Ordering them to minimise how far the gripper travels in Cartesian space is the obvious choice, but the joints are what actually have to move. The motion score on the right unrolls what each joint does, with the horizontal axis measured in joint-space arc length, so a longer score means more work for the arm. The faint lines are the other order. This toy finds both orders by trying every sequence; the paper learns an arc-length value function so that the ranking is fast enough to use online. Drag or shuffle the cubes and compare."
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
