---
layout: paper
title: "Deep Sequenced Linear Dynamical Systems for Manipulation Policy Learning"
short: "Deep Sequenced Linear Dynamical Systems"
order: 8
authors:
  - "M Nomaan Qureshi"
  - "Ben Eisner"
  - "David Held"
venue: "ICLR 2022 Workshop on Generalizable Policy Learning in Physical World"
year: 2022
pub_date: "2022"
paper_link: "https://openreview.net/forum?id=rF-fT4pN1Wc"
pdf_link: "https://openreview.net/pdf?id=rF-fT4pN1Wc"
image: "/images/dlds.png"
highlight: true
tldr: "What inductive bias to use for policy learning in manipulation tasks? We found out that simple linear dynamical systems work surprisingly well when you make them differentiable.  "
contribution: "I came up with the idea of differentiable linear dynamical systems and how they can be integrated into policy learning. I did most for this paper. Ben introduced me to dynamical systems and manipulation policy learning and was a wonderful mentor. Prof. David was the main advisor and provided invaluable feedback."
demo: deep-sequenced-lds
demo_title: "A form taking shape: a policy made of linear dynamical systems"
demo_text: "Each of the eight thousand particles follows the same simple rule, a linear dynamical system that pulls it toward its own attractor point: x′ = A(g − x). The policy is a short sequence of such systems. When one has brought everything to its attractors, the next takes over and a new form assembles, with an amber wave marking the handoff. Because every system is stable, a shove is simply absorbed. Change the stiffness and the swirl of A, shove the cloud, or step through the sequence yourself."
bibtex: |
  @inproceedings{qureshi2022deep,
    title     = {Deep Sequenced Linear Dynamical Systems for Manipulation Policy Learning},
    author    = {Mohammad Nomaan Qureshi and Ben Eisner and David Held},
    booktitle = {ICLR 2022 Workshop on Generalizable Policy Learning in Physical World},
    year      = {2022},
    url       = {https://openreview.net/forum?id=rF-fT4pN1Wc}
  }
---
