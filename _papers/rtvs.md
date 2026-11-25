---
layout: paper
title: "RTVS: A Lightweight Differentiable MPC Framework for Real-Time Visual Servoing"
short: "RTVS"
description: "RTVS is a lightweight differentiable MPC framework for visual servoing that generates 6-DoF control near real time (10.52 Hz), using differential cross-entropy sampling and a lightweight neural network. IROS 2021."
keywords:
  - "RTVS"
  - "real-time visual servoing"
  - "visual servoing"
  - "differentiable MPC"
  - "model predictive control"
  - "cross-entropy method"
  - "optical flow"
  - "6-DoF"
  - "Habitat simulator"
  - "DeepMPCVS"
topics: [visual-servoing]
order: 9
authors:
  - "M Nomaan Qureshi*"
  - "Pushkal Katara*"
  - "Abhinav Gupta*"
  - "Harit Pandya"
  - "YVS Harish"
  - "AadilMehdi Sanchawala"
  - "Gourav Kumar"
  - "Brojeshwar Bhowmick"
  - "K Madhava Krishna"
venue: "2021 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)"
year: 2021
pub_date: "2021"
paper_link: "https://ieeexplore.ieee.org/abstract/document/9636290"
doi: "10.1109/IROS51168.2021.9636290"
video_link: "https://www.youtube.com/watch?v=iQidWKBwkDw"
image: "/images/rtvs.jpg"
highlight: false
tldr: "Simple extension of DeepMPCVS for real-time visual servoing. Although simple, we later built upon this to several cool works. In general, got me interested in visual servoing."
contribution: "First paper! I came up with the core idea of using a lightweight neural network, instead of heavy lstm pipeline. Pushkal and Abhinav helped me refine the idea and wrote the paper. Harit and Gaurav helped with the paper writing and initial problem formulation. Prof. Madhava was the main advisor."
demo: rtvs
demo_title: "Simulator: servo a camera to a goal image, in a real scene"
demo_text: "Visual servoing moves a camera until what it sees matches a goal image. You are looking through the camera inside a Gaussian splat of a real garden; the inset is the goal image, a real render of the same scene from the goal pose. The coloured strokes are the optical flow that still separates the current view from the goal image. Each control tick runs a few optimiser steps of a small model-predictive controller on that flow, then applies the resulting 6-DoF camera velocity, until the flow vanishes. Try fewer or more MPC steps per tick, and new start poses."
agent_note_title: "Why optical flow is useful for robot agents"
agent_note: "Optical flow between the current camera image and a goal image tells a robot, for every tracked point, which way and how far the image still has to move. A visual-servoing controller turns that flow directly into a velocity command and stops when the flow vanishes. So an agent that can produce, retrieve or imagine a goal image can hand the low-level motion to visual servoing, without a 3D model of the scene or a hand-written motion plan, and it can read the remaining flow as a dense, interpretable measure of how far it is from done."
demo_credit: "Scene: the garden capture from the Mip-NeRF 360 dataset (Barron et al., CVPR 2022), reduced for the web. It is used here only as an environment; it is not from the RTVS paper."
venue_short: "IROS 2021"
video: "/images/rtvs.mp4"
image_w: 600
image_h: 338
pages: "3798-3805"
abstract: "Recent data-driven approaches to visual servoing have shown improved performances over classical methods due to precise feature matching and depth estimation. Some recent servoing approaches use a model predictive control (MPC) framework which generalise well to novel environments and are capable of incorporating dynamic constraints, but are computationally intractable in real-time, making it difficult to deploy in real-world scenarios. On the contrary, single-step methods optimise greedily and achieve high servoing rates, but lack the benefits of the MPC multi-step ahead formulation. In this paper, we make the best of both worlds and propose a lightweight visual servoing MPC framework which generates optimal control near real-time at a frequency of 10.52 Hz. This work utilises the differential cross-entropy sampling method for quick and effective control generation along with a lightweight neural network, significantly improving the servoing frequency. We also propose a flow depth normalisation layer which ameliorates the issue of inferior predictions of two view depth from the flow network. We conduct extensive experimentation on the Habitat simulator and show a notable decrease in servoing time in comparison with other approaches that optimise over a time horizon. We achieve the right balance between time and performance for visual servoing in six degrees of freedom (6DoF), while retaining the advantageous MPC formulation."
faq:
  - q: "What is RTVS?"
    a: "RTVS is a lightweight model predictive control (MPC) framework for visual servoing. It generates control near real time, at a frequency of 10.52 Hz, while keeping the multi-step-ahead MPC formulation."
  - q: "How does RTVS reach near real-time rates?"
    a: "It uses the differential cross-entropy sampling method for quick and effective control generation, together with a lightweight neural network, which significantly improves the servoing frequency. Earlier MPC-based servoing approaches generalise well but are computationally intractable in real time."
  - q: "What is the flow depth normalisation layer?"
    a: "A layer proposed in the paper that ameliorates the issue of inferior two-view depth predictions from the optical flow network."
  - q: "How was RTVS evaluated?"
    a: "With extensive experiments on the Habitat simulator, for visual servoing in six degrees of freedom (6DoF). The paper reports a notable decrease in servoing time compared with other approaches that optimise over a time horizon."
bibtex: |
  @inproceedings{qureshi2021rtvs,
    author    = {M. Nomaan Qureshi and Pushkal Katara and Abhinav Gupta and Harit Pandya and Y V S Harish and AadilMehdi Sanchawala and Gourav Kumar and Brojeshwar Bhowmick and K. Madhava Krishna},
    title     = {RTVS: A Lightweight Differentiable MPC Framework for Real-Time Visual Servoing},
    booktitle = {2021 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)},
    year      = {2021},
    pages     = {3798-3805},
    doi       = {10.1109/IROS51168.2021.9636290}
  }
---
