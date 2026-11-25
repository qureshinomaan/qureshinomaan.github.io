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
demo: imagine2servo
demo_title: "Simulator: imagine a sub-goal, servo to it, repeat, in a real scene"
demo_text: "Servoing only works when the goal image overlaps what the camera currently sees. Here the camera starts on a poster on the wall of a real, captured robot workspace, and the task goal is a mark on the table, so the two images share nothing and servoing straight to the goal has no flow to follow. Imagine2Servo instead generates a nearby sub-goal image, servos to it, and repeats until the task is done. In this toy version a renderer of the captured scene plays the role of the diffusion model that imagines the sub-goal images."
faq:
  - q: "What is Imagine2Servo?"
    a: "Imagine2Servo is an approach that uses diffusion-based image editing to generate intermediate goal images for visual servoing, so that a robot can servo toward sub-goal images grounded in the task instead of needing a predefined goal image."
  - q: "What limitations of visual servoing does it address?"
    a: "Classical and flow-based visual servoing needs a target image at test time, needs substantial overlap between the initial and target images, and relies on feedback from a single camera. Imagine2Servo generates sub-goal images to remove the first two constraints and integrates multi-camera feedback."
  - q: "What does Imagine2Servo enable?"
    a: "Tasks such as long-range navigation and manipulation without predefined goal images, including scenarios with minimal overlap between the initial and target views. The paper validates the framework with real-world experiments."
agent_note_title: "Why optical flow is useful for robot agents"
agent_note: "Optical flow between the current camera image and a goal image tells a robot, for every tracked point, which way and how far the image still has to move. A visual-servoing controller turns that flow directly into a velocity command and stops when the flow vanishes. So an agent that can produce, retrieve or imagine a goal image can hand the low-level motion to visual servoing, without a 3D model of the scene or a hand-written motion plan, and it can read the remaining flow as a dense, interpretable measure of how far it is from done."
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
