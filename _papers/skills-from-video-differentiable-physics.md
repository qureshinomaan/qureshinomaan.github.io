---
layout: paper
title: "Learning Object Manipulation Skills from Video via Approximate Differentiable Physics"
short: "Manipulation Skills from Video via Differentiable Physics"
order: 6
authors:
  - "Vladimir Petrik"
  - "M Nomaan Qureshi"
  - "Josef Sivic"
  - "Makarand Tapaswi"
venue: "2022 IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)"
year: 2022
pub_date: "2022/08/03"
paper_link: "https://arxiv.org/abs/2208.01960"
pdf_link: "https://arxiv.org/pdf/2208.01960"
arxiv: "2208.01960"
project_link: "https://data.ciirc.cvut.cz/public/projects/2022Real2SimPhysics/"
code_link: "https://github.com/petrikvladimir/video_skills_learning_with_approx_physics"
image: "/images/iros22.gif"
highlight: true
tldr: "Incorporating laws of motions like gravity into learning object manipulation skills from video, can help recover better trajectories."
contribution: "This was Vladimir's idea. I worked on improving the segmentation which helped the performance of his idea -- and some help in writing the paper (related work and figures)."
abstract: "We aim to teach robots to perform simple object manipulation tasks by watching a single video demonstration. Towards this goal, we propose an optimization approach that outputs a coarse and temporally evolving 3D scene to mimic the action demonstrated in the input video. Similar to previous work, a differentiable renderer ensures perceptual fidelity between the 3D scene and the 2D video. Our key novelty lies in the inclusion of a differentiable approach to solve a set of Ordinary Differential Equations (ODEs) that allows us to approximately model laws of physics such as gravity, friction, and hand-object or object-object interactions. This not only enables us to dramatically improve the quality of estimated hand and object states, but also produces physically admissible trajectories that can be directly translated to a robot without the need for costly reinforcement learning. We evaluate our approach on a 3D reconstruction task that consists of 54 video demonstrations sourced from 9 actions such as pull something from right to left or put something in front of something. Our approach improves over previous state-of-the-art by almost 30%, demonstrating superior quality on especially challenging actions involving physical interactions of two objects such as put something onto something. Finally, we showcase the learned skills on a Franka Emika Panda robot."
demo: skills-from-video
demo_title: "Simulator: from one video to a motion a robot can replay"
demo_text: "The input is a single video of a hand placing a cube onto a block. A video pins down where things appear in the image but says little about depth, so a reconstruction that only matches appearance wobbles toward and away from the camera and can leave the cube floating. Adding approximate, differentiable physics asks the reconstruction to also obey gravity and contact, which gives a smooth, physically possible path that the robot can replay directly. Switch physics on and off, and orbit to view the path from the side."
faq:
  - q: "What does this paper do?"
    a: "It teaches robots simple object manipulation tasks from a single video demonstration. An optimization produces a coarse, temporally evolving 3D scene that mimics the action shown in the video."
  - q: "What is the key novelty?"
    a: "A differentiable way to solve a set of ordinary differential equations that approximately model physics such as gravity, friction, and hand-object or object-object interactions. This improves the estimated hand and object states and produces physically admissible trajectories that can be transferred to a robot without costly reinforcement learning."
  - q: "What results does it report?"
    a: "On a 3D reconstruction task with 54 video demonstrations from 9 actions, the approach improves over the previous state of the art by almost 30%, and the learned skills are shown on a Franka Emika Panda robot."
bibtex: |
  @misc{petrik2022learning,
    title         = {Learning Object Manipulation Skills from Video via Approximate Differentiable Physics},
    author        = {Vladimir Petrik and Mohammad Nomaan Qureshi and Josef Sivic and Makarand Tapaswi},
    year          = {2022},
    eprint        = {2208.01960},
    archivePrefix = {arXiv},
    primaryClass  = {cs.RO}
  }
---
