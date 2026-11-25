---
layout: paper
title: "RTVS: A Lightweight Differentiable MPC Framework for Real-Time Visual Servoing"
short: "RTVS"
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
image: "/images/rtvs.gif"
highlight: false
tldr: "Simple extension of DeepMPCVS for real-time visual servoing. Although simple, we later built upon this to several cool works. In general, got me interested in visual servoing."
contribution: "First paper! I came up with the core idea of using a lightweight neural network, instead of heavy lstm pipeline. Pushkal and Abhinav helped me refine the idea and wrote the paper. Harit and Gaurav helped with the paper writing and initial problem formulation. Prof. Madhava was the main advisor."
demo: rtvs
demo_title: "Simulator: servo a camera to a goal image, in a real scene"
demo_text: "Visual servoing moves a camera until what it sees matches a goal image. You are looking through the robot camera inside a Gaussian splat of a real robot workspace; the inset is the goal image, a real render of the same scene from the goal pose. The coloured arrows are the optical flow that still separates the current view from the goal image. Each control tick runs a few optimiser steps of a small model-predictive controller on that flow, then applies the resulting 6-DoF camera velocity, until the flow vanishes. Try fewer or more MPC steps per tick, and new start poses."
agent_note_title: "Why optical flow is useful for robot agents"
agent_note: "Optical flow between the current camera image and a goal image tells a robot, for every tracked point, which way and how far the image still has to move. A visual-servoing controller turns that flow directly into a velocity command and stops when the flow vanishes. So an agent that can produce, retrieve or imagine a goal image can hand the low-level motion to visual servoing, without a 3D model of the scene or a hand-written motion plan, and it can read the remaining flow as a dense, interpretable measure of how far it is from done."
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
