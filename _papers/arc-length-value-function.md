---
layout: paper
title: "Learning Arc-Length Value Function for Fast Time-Optimal Pick and Place Sequence Planning and Execution"
short: "Arc-Length Value Function"
description: "A learned value function estimates joint-space arc length between end-effector positions, giving a real-time planner for time-optimal pick-and-place sequences and a new inverse kinematics method. IJCNN 2023."
keywords:
  - "arc-length value function"
  - "pick and place"
  - "sequence planning"
  - "time-optimal planning"
  - "joint-space arc length"
  - "capacitated vehicle routing problem"
  - "inverse kinematics"
  - "metric learning"
  - "fixed-base manipulator"
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
venue_short: "IJCNN 2023"
image_w: 550
image_h: 181
thumb_fit: "contain"
pages: "1-10"
abstract: "This paper presents a real-time algorithm for computing the optimal sequence and motion plans for a fixed-base manipulator to pick and place a set of given objects. The optimality is defined in terms of the total execution time of the sequence or its proxy, the arc-length in the joint-space. The fundamental complexity stems from the fact that the optimality metric depends on the joint motion, but the task specification is in the end-effector space. Moreover, mapping between a pair of end-effector positions to the shortest arc-length joint trajectory is not analytic; instead, it entails solving a complex trajectory optimization problem. Existing works ignore this complex mapping and use the Euclidean distance in the end-effector space to compute the sequence. In this paper, we overcome the reliance on the Euclidean distance heuristic by introducing a novel data-driven technique to estimate the optimal arc-length cost in joint space (a.k.a the value function) between two given end-effector positions. We parametrize the value function as a Neural Network and motivate a niche choice for its architecture, inspired by the works on metric learning. The learned value function is then used as an edge cost in a capacitated vehicle routing problem (CVRP) set-up to compute the optimal visitation sequence. Finally, we optimize over the input space of the learnt value function network to propose a novel Inverse Kinematics (IK) algorithm that produces substantially shorter joint arc-length trajectories than existing approaches while executing the computed optimal sequence. We show that our sequence planner, in combination with our proposed IK, offers a substantial improvement in joint arc-length over existing state-of-the-art while maintaining scalability to a large number of objects."
faq:
  - q: "What problem does the paper solve?"
    a: "It computes, in real time, the optimal sequence and motion plans for a fixed-base manipulator to pick and place a set of given objects. Optimality is defined as the total execution time of the sequence or its proxy, the arc length in joint space."
  - q: "Why not order the objects by Euclidean distance?"
    a: "The optimality metric depends on the joint motion, but the task is specified in end-effector space, and the mapping from a pair of end-effector positions to the shortest arc-length joint trajectory is not analytic; it requires solving a trajectory optimisation problem. Existing works ignore this mapping and use the Euclidean distance in end-effector space to compute the sequence."
  - q: "What is the arc-length value function?"
    a: "A neural network, with an architecture inspired by work on metric learning, that estimates the optimal joint-space arc-length cost between two given end-effector positions. It is used as the edge cost in a capacitated vehicle routing problem (CVRP) to compute the optimal visitation sequence."
  - q: "How is the value function used for inverse kinematics?"
    a: "By optimising over the input space of the learned value function network, the paper proposes an inverse kinematics (IK) algorithm that produces substantially shorter joint arc-length trajectories than existing approaches while executing the computed sequence."
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
