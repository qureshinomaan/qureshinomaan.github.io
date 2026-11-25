---
layout: paper
title: "SplatSim: Zero-Shot Sim2Real Transfer of RGB Manipulation Policies Using Gaussian Splatting"
short: "SplatSim"
description: "SplatSim renders robot simulators with Gaussian Splatting so that RGB manipulation policies trained purely in simulation transfer zero-shot to real robots. ICRA 2025."
keywords:
  - "SplatSim"
  - "Gaussian Splatting"
  - "3D Gaussian Splatting robotics"
  - "Sim2Real"
  - "sim-to-real transfer"
  - "zero-shot transfer"
  - "RGB manipulation policies"
  - "robot simulation"
  - "photorealistic rendering"
  - "imitation learning"
topics: [sim-to-real, gaussian-splatting, robot-manipulation]
order: 1
authors:
  - "M Nomaan Qureshi"
  - "Sparsh Garg"
  - "Francisco Yandun"
  - "David Held"
  - "George Kantor"
  - "Abhisesh Silwal"
venue: "2025 IEEE International Conference on Robotics and Automation (ICRA)"
year: 2025
pub_date: "2024/09/16"
paper_link: "https://arxiv.org/abs/2409.10161"
pdf_link: "https://arxiv.org/pdf/2409.10161"
arxiv: "2409.10161"
project_link: "https://splatsim.github.io"
code_link: "https://github.com/qureshinomaan/SplatSim"
image: "/images/icra2024.jpg"
highlight: true
tldr: "How do we scale up robot learning? Data is the magic which makes deep learning work, but for robots it is very expensive to collect data in the real world. We combine Gaussian Splatting with simulators to create a pipeline which can generate very realistic looking data for robots."
contribution: "I came up with the idea of using Gaussian Splatting as a renderer over Simulators and wrote most of the code. Sparsh's contribution was crucial in the early implementations of SplatSim, especially helping in coding the initial scripts for forward kinematics. However, he was away due to an internship for rest of the project. I wrote most of the paper while Sparsh made all the amazing figures for the paper. Francisco was very helpful in day to day discussions and solving system issues. Prof. David provided some very good advice on deploying policies in the real world.  Prof. George and Prof. Abhi provided invaluable insights on making the SplatSim framework practical and applicable to real world robots. Their focus, especially on the practicality of solution which can be deployed to real world fields was crucial."
abstract: "Sim2Real transfer, particularly for manipulation policies relying on RGB images, remains a critical challenge in robotics due to the significant domain shift between synthetic and real-world visual data. In this paper, we propose SplatSim, a novel framework that leverages Gaussian Splatting as the primary rendering primitive to reduce the Sim2Real gap for RGB-based manipulation policies. By replacing traditional mesh representations with Gaussian Splats in simulators, SplatSim produces highly photorealistic synthetic data while maintaining the scalability and cost-efficiency of simulation. We demonstrate the effectiveness of our framework by training manipulation policies within SplatSim and deploying them in the real world in a zero-shot manner, achieving an average success rate of 86.25%, compared to 97.5% for policies trained on real-world data."
demo: splatsim
demo_title: "SplatSim in your browser: the real robot, moved by simulated joints"
demo_text: "This is a Gaussian splat of the actual robot workspace from the paper, running in your browser, together with separately captured splats of an apple, a banana and a plate. SplatSim keeps the physics simulator but swaps what the camera sees: every splat is rigidly attached to the simulator body it belongs to, whether that is a robot link or an object. When the simulator changes the joint angles or moves an object, the splats move with their bodies, so the image looks like the real scene while the motion comes from simulation. Here the arm moves the apple to the plate and back; the blue skeleton is the simulator state that drives it. Drag to orbit."
faq:
  - q: "What is SplatSim?"
    a: "SplatSim is a framework that uses Gaussian Splatting as the primary rendering primitive inside a robot simulator, replacing traditional mesh representations, to reduce the Sim2Real gap for manipulation policies that take RGB images as input."
  - q: "What result does SplatSim report?"
    a: "Manipulation policies trained in SplatSim and deployed on the real robot zero-shot achieved an average success rate of 86.25%, compared to 97.5% for policies trained on real-world data."
  - q: "How does SplatSim render a moving robot from a static capture?"
    a: "The scene is captured once as Gaussian splats. Each splat is assigned to the simulator body it belongs to, such as a robot link or an object, and is moved rigidly with that body as the physics simulator updates its pose. The interactive demo on this page does this with the real capture in the browser."
  - q: "Where can I find the SplatSim code and project page?"
    a: "Code: https://github.com/qureshinomaan/SplatSim. Project page: https://splatsim.github.io. Paper: https://arxiv.org/abs/2409.10161."
demo_credit: "Scene: the UR5 workspace and the apple, banana and plate captures released with SplatSim, reduced for the web."
venue_short: "ICRA 2025"
video: "/images/icra2024.mp4"
image_w: 600
image_h: 336
doi: "10.1109/ICRA55743.2025.11128339"
pages: "6502-6509"
bibtex: |
  @inproceedings{qureshi2025splatsim,
    title         = {SplatSim: Zero-Shot Sim2Real Transfer of RGB Manipulation Policies Using Gaussian Splatting},
    author        = {Mohammad Nomaan Qureshi and Sparsh Garg and Francisco Yandun and David Held and George Kantor and Abhisesh Silwal},
    booktitle     = {2025 IEEE International Conference on Robotics and Automation (ICRA)},
    year          = {2025},
    pages         = {6502-6509},
    doi           = {10.1109/ICRA55743.2025.11128339},
    eprint        = {2409.10161},
    archivePrefix = {arXiv},
    primaryClass  = {cs.RO},
    url           = {https://arxiv.org/abs/2409.10161}
  }
---
