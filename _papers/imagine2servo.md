---
layout: paper
title: "Imagine2Servo: Intelligent Visual Servoing with Diffusion-Driven Goal Generation for Robotic Tasks"
short: "Imagine2Servo"
order: 2
authors:
  - "Pranjali Pathre"
  - "Gunjan Gupta"
  - "M Nomaan Qureshi"
  - "Mandyam Brunda"
  - "Samarth Brahmbhatt"
  - "K Madhava Krishna"
venue: "2024 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)"
year: 2024
note: "Oral"
pub_date: "2024/10/16"
paper_link: "https://arxiv.org/abs/2410.12432"
pdf_link: "https://arxiv.org/pdf/2410.12432"
arxiv: "2410.12432"
image: "/images/iros2024.gif"
highlight: true
tldr: "How do we use foundational vision models for robot tasks? Diffusion models are very good at generating image goals, servoing is very good at reaching them. Combining the two is a natural fit."
contribution: "I came up with the formulation for this paper. Pranjali did most of the work and Gunjan did the real world robot experiments. "
abstract: "Visual servoing, the method of controlling robot motion through feedback from visual sensors, has seen significant advancements with the integration of optical flow-based methods. However, its application remains limited by inherent challenges, such as the necessity for a target image at test time, the requirement of substantial overlap between initial and target images, and the reliance on feedback from a single camera. This paper introduces Imagine2Servo, an innovative approach leveraging diffusion-based image editing techniques to enhance visual servoing algorithms by generating intermediate goal images. This methodology allows for the extension of visual servoing applications beyond traditional constraints, enabling tasks like long-range navigation and manipulation without predefined goal images. We propose a pipeline that synthesizes subgoal images grounded in the task at hand, facilitating servoing in scenarios with minimal initial and target image overlap and integrating multi-camera feedback for comprehensive task execution. Our contributions demonstrate a novel application of image generation to robotic control, significantly broadening the capabilities of visual servoing systems. Real-world experiments validate the effectiveness and versatility of the Imagine2Servo framework in accomplishing a variety of tasks, marking a notable advancement in the field of visual servoing."
bibtex: |
  @inproceedings{pathre2024imagine2servo,
    title         = {Imagine2Servo: Intelligent Visual Servoing with Diffusion-Driven Goal Generation for Robotic Tasks},
    author        = {Pranjali Pathre and Gunjan Gupta and M. Nomaan Qureshi and Mandyam Brunda and Samarth Brahmbhatt and K. Madhava Krishna},
    booktitle     = {2024 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)},
    year          = {2024},
    eprint        = {2410.12432},
    archivePrefix = {arXiv},
    primaryClass  = {cs.RO},
    url           = {https://arxiv.org/abs/2410.12432}
  }
---
