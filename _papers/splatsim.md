---
layout: paper
title: "SplatSim: Zero-Shot Sim2Real Transfer of RGB Manipulation Policies Using Gaussian Splatting"
short: "SplatSim"
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
image: "/images/icra2024.gif"
highlight: true
tldr: "How do we scale up robot learning? Data is the magic which makes deep learning work, but for robots it is very expensive to collect data in the real world. We combine Gaussian Splatting with simulators to create a pipeline which can generate very realistic looking data for robots."
contribution: "I came up with the idea of using Gaussian Splatting as a renderer over Simulators and wrote most of the code. Sparsh's contribution was crucial in the early implementations of SplatSim, especially helping in coding the initial scripts for forward kinematics. However, he was away due to an internship for rest of the project. I wrote most of the paper while Sparsh made all the amazing figures for the paper. Francisco was very helpful in day to day discussions and solving system issues. Prof. David provided some very good advice on deploying policies in the real world.  Prof. George and Prof. Abhi provided invaluable insights on making the SplatSim framework practical and applicable to real world robots. Their focus, especially on the practicality of solution which can be deployed to real world fields was crucial."
abstract: "Sim2Real transfer, particularly for manipulation policies relying on RGB images, remains a critical challenge in robotics due to the significant domain shift between synthetic and real-world visual data. In this paper, we propose SplatSim, a novel framework that leverages Gaussian Splatting as the primary rendering primitive to reduce the Sim2Real gap for RGB-based manipulation policies. By replacing traditional mesh representations with Gaussian Splats in simulators, SplatSim produces highly photorealistic synthetic data while maintaining the scalability and cost-efficiency of simulation. We demonstrate the effectiveness of our framework by training manipulation policies within SplatSim and deploying them in the real world in a zero-shot manner, achieving an average success rate of 86.25%, compared to 97.5% for policies trained on real-world data."
bibtex: |
  @inproceedings{qureshi2025splatsim,
    title         = {SplatSim: Zero-Shot Sim2Real Transfer of RGB Manipulation Policies Using Gaussian Splatting},
    author        = {Mohammad Nomaan Qureshi and Sparsh Garg and Francisco Yandun and David Held and George Kantor and Abhisesh Silwal},
    booktitle     = {2025 IEEE International Conference on Robotics and Automation (ICRA)},
    year          = {2025},
    eprint        = {2409.10161},
    archivePrefix = {arXiv},
    primaryClass  = {cs.RO},
    url           = {https://arxiv.org/abs/2409.10161}
  }
---
