---
layout: paper
title: "On Time-Indexing as Inductive Bias in Deep RL for Sequential Manipulation Tasks"
short: "Time-Indexing as Inductive Bias"
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
