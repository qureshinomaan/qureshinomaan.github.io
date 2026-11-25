---
layout: paper
title: "Flow Synthesis Based Visual Servoing Frameworks for Monocular Obstacle Avoidance Amidst High-Rises"
short: "Flow Synthesis Based Visual Servoing"
description: "A visual servoing framework that synthesises optical flow to steer micro air vehicles around high-rise obstacles using a single monocular camera. IEEE CASE 2022."
keywords:
  - "visual servoing"
  - "optical flow"
  - "flow synthesis"
  - "obstacle avoidance"
  - "monocular camera"
  - "micro air vehicle"
  - "MAV"
  - "drone navigation"
  - "saliency"
  - "cross-entropy method"
topics: [visual-servoing]
order: 7
authors:
  - "Harshit K Sankhla*"
  - "M Nomaan Qureshi*"
  - "Shankara Narayanan V*"
  - "Vedansh Mittal"
  - "Gunjan Gupta"
  - "Harit Pandya"
  - "K Madhava Krishna"
venue: "2022 IEEE International Conference on Automation Science and Engineering (CASE)"
year: 2022
pub_date: "2022/07/07"
paper_link: "https://arxiv.org/abs/2207.03557"
pdf_link: "https://arxiv.org/pdf/2207.03557"
arxiv: "2207.03557"
project_link: "https://sites.google.com/view/monocular-obstacle/home"
image: "/images/case.jpg"
highlight: true
tldr: "Obstacle avoidance amidst high rises is a challenging problem. We proposed a simple application of visual servoing to solve this problem. "
contribution: "Harshit came up with the problem of obstacle avoidance amidst high-rises. I came up with the core idea and wrote the paper as well as servoing code along with Shankara. Prof. Madhava was the main advisor."
abstract: "We propose a novel flow synthesis based visual servoing framework enabling long-range obstacle avoidance for Micro Air Vehicles (MAV) flying amongst tall skyscrapers. Recent deep learning based frameworks use optical flow to do high-precision visual servoing. In this paper, we explore the question: can we design a surrogate flow for these high-precision visual-servoing methods, which leads to obstacle avoidance? We revisit the concept of saliency for identifying high-rise structures in/close to the line of attack amongst other competing skyscrapers and buildings as a collision obstacle. A synthesised flow is used to displace the salient object segmentation mask. This flow is so computed that the visual servoing controller maneuvers the MAV safely around the obstacle. In this approach, we use a multi-step Cross-Entropy Method (CEM) based servo control to achieve flow convergence, resulting in obstacle avoidance. We use this novel pipeline to successfully and persistently maneuver high-rises and reach the goal in simulated and photo-realistic real-world scenes. We conduct extensive experimentation and compare our approach with optical flow and short-range depth-based obstacle avoidance methods to demonstrate the proposed framework's merit."
demo: flow-synthesis
demo_title: "Part the skyline: fly a drone through high-rises with one camera"
demo_text: "A micro air vehicle flies among skyscrapers at dusk using a single forward camera. The building in its line of attack is picked out as the salient obstacle, shown as the coral mask in the onboard view. Instead of estimating depth, the method synthesises an optical flow that would slide that mask out of the way (the bands peel sideways toward the dashed target), and a visual-servoing controller flies the vehicle so that the flow comes true, which steers it around the building. Choose which side to pass on, or switch avoidance off to see what happens without it."
faq:
  - q: "What does this paper propose?"
    a: "A flow-synthesis-based visual servoing framework that enables long-range obstacle avoidance for micro air vehicles flying among tall skyscrapers, using a monocular camera."
  - q: "How does it avoid an obstacle?"
    a: "Saliency identifies the high-rise in or close to the line of attack as the collision obstacle. A flow is synthesised that displaces the obstacle's segmentation mask, and a multi-step Cross-Entropy Method based servo controller drives the vehicle until that flow is achieved, which manoeuvres it around the obstacle."
  - q: "How was it evaluated?"
    a: "In simulated and photo-realistic real-world scenes, with comparisons against optical-flow and short-range depth-based obstacle avoidance methods."
agent_note_title: "Why optical flow is useful for robot agents"
agent_note: "Optical flow between the current camera image and a goal image tells a robot, for every tracked point, which way and how far the image still has to move. A visual-servoing controller turns that flow directly into a velocity command and stops when the flow vanishes. So an agent that can produce, retrieve or imagine a goal image can hand the low-level motion to visual servoing, without a 3D model of the scene or a hand-written motion plan, and it can read the remaining flow as a dense, interpretable measure of how far it is from done."
venue_short: "CASE 2022"
image_webp: "/images/case.webp"
image_w: 1000
image_h: 630
doi: "10.1109/CASE49997.2022.9926593"
pages: "1339-1345"
bibtex: |
  @inproceedings{sankhla2022flow,
    title         = {Flow Synthesis Based Visual Servoing Frameworks for Monocular Obstacle Avoidance Amidst High-Rises},
    author        = {Harshit K. Sankhla and M. Nomaan Qureshi and Shankara Narayanan V. and Vedansh Mittal and Gunjan Gupta and Harit Pandya and K. Madhava Krishna},
    booktitle     = {2022 IEEE International Conference on Automation Science and Engineering (CASE)},
    year          = {2022},
    pages         = {1339-1345},
    doi           = {10.1109/CASE49997.2022.9926593},
    eprint        = {2207.03557},
    archivePrefix = {arXiv},
    primaryClass  = {cs.RO}
  }
---
