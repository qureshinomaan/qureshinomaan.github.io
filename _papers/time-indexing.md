---
layout: paper
title: "On Time-Indexing as Inductive Bias in Deep RL for Sequential Manipulation Tasks"
short: "Time-Indexing as Inductive Bias"
description: "A policy architecture that executes a different action head for each fixed time window: a simple inductive bias for deep reinforcement learning on sequential manipulation tasks, evaluated on Metaworld."
keywords:
  - "time-indexing"
  - "inductive bias"
  - "deep reinforcement learning"
  - "multi-head policy"
  - "sequential manipulation"
  - "skill learning"
  - "Metaworld"
  - "sample efficiency"
topics: [reinforcement-learning, robot-manipulation]
order: 3
authors:
  - "M Nomaan Qureshi"
  - "Ben Eisner"
  - "David Held"
venue: "Learning Meets Model-based Methods for Manipulation and Grasping Workshop @ IROS"
year: 2023
pub_date: "2024/01/03"
paper_link: "https://arxiv.org/abs/2401.01993"
pdf_link: "https://arxiv.org/pdf/2401.01993"
arxiv: "2401.01993"
image: "/images/multihead.png"
highlight: false
tldr: "Manipulation tasks are a sequence of distinct skills like reaching and grasping. A policy that executes a different action head for each fixed time window is a very simple inductive bias, and it outperforms standard single-head policies on Metaworld tasks."
contribution: "I contributed to the idea of using Time-indexing as Inductive Bias in Deep RL for Sequential Manipulation Tasks."
abstract: "While solving complex manipulation tasks, manipulation policies often need to learn a set of diverse skills to accomplish these tasks. The set of skills is often quite multimodal - each one may have a quite distinct distribution of actions and states. Standard deep policy-learning algorithms often model policies as deep neural networks with a single output head (deterministic or stochastic). This structure requires the network to learn to switch between modes internally, which can lead to lower sample efficiency and poor performance. In this paper we explore a simple structure which is conducive to skill learning required for so many of the manipulation tasks. Specifically, we propose a policy architecture that sequentially executes different action heads for fixed durations, enabling the learning of primitive skills such as reaching and grasping. Our empirical evaluation on the Metaworld tasks reveals that this simple structure outperforms standard policy learning methods, highlighting its potential for improved skill acquisition."
demo: time-indexing
demo_title: "One body, many clocks: an action head for each slice of time"
demo_text: "A standard policy has one output head that must represent every skill in a task. The idea here is simpler: give the policy K heads and run head k during the k-th slice of the episode. The ring is the clock, cut into K sectors; as the hand crosses a gap, control passes to the next head and the puck's ribbon changes colour. The manoeuvre passes through the same point twice, and what happens there depends only on which head the clock says is active. Change K, and drag around the ring to scrub time."
faq:
  - q: "What is the idea of time-indexing as an inductive bias?"
    a: "The policy has several action heads and executes them sequentially, each for a fixed duration, instead of using a single output head for the whole task. This lets each head learn one primitive skill such as reaching or grasping."
  - q: "Why not use a single output head?"
    a: "Manipulation tasks need a set of diverse skills whose action and state distributions are quite different. A single-head network has to learn to switch between these modes internally, which can lead to lower sample efficiency and poor performance."
  - q: "How was it evaluated?"
    a: "On Metaworld tasks, where this simple structure outperformed standard policy learning methods."
bibtex: |
  @misc{qureshi2024timeindexing,
    title         = {On Time-Indexing as Inductive Bias in Deep RL for Sequential Manipulation Tasks},
    author        = {M. Nomaan Qureshi and Ben Eisner and David Held},
    year          = {2024},
    eprint        = {2401.01993},
    archivePrefix = {arXiv},
    primaryClass  = {cs.RO}
  }
---
