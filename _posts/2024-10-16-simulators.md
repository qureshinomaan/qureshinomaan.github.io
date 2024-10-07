---
layout: default
title: "Why Simulators for Large-scale Robot Learning?"
date: 2024-04-15
---


<span style="color:red;font-family:verdana;font-size:20px"> Why Simulators for Large-scale Robot Learning?</span>

How do we build ChatGPT-scale models for robots? This is perhaps the wrong question to ask. Instead, we should ask how do we get internet scale data for robots? What are the challenges?

Internet enabled a data collection process on a scale which was unimaginable. If you go to 1950s and perhaps ask people in that time, what would be the best way to make a AI system like ChatGPT, most people perhaps would not come up with the idea of having internet. Many would even argue that we do not need data, rather we need the algorithm. But with internet, AI researchers got lucky. Once the data was available, the race for better algorithms began. For most robotics researchers today, I feel they are facing the same problem. They want to train their models like ChatGPT for robots. But they do not have enough data to train their models. They show generalisation to small scale experiments in their labs. But most of the times, I feel, these algorithms will not be useful in few years, when the data is available on a large scale. Instead, we should focus on how to collect data for robots on a large scale.

My recent experience by building <a href="https://splatsim.github.io">SplatSim</a> has reinforced my belief that simulators are the answer to this data problem for robotics. Standard advantage of simulators like safety, cost-efficiency and scalability remain. We just need to find ways to make simulator data useful. And <a href="https://splatsim.github.io">SplatSim</a> was the first step I took in this direction. I feel like there is still a lot of work to be done, other than simulators, but other than simulators, most ideas seem infeasible. A case can be made for perhaps using video data, which is abundant, but I feel video data doesn't have the control we can get with simulators. For example, in simulation, we can easily control the camera view, the lighting, the weather, the objects in the scene, etc. Other than that, I think Virtual Reality/Augmented Reality is a great option and I am excited about it. But it will take some time to reach the scale of internet for data collection for robotics using VR/AR. So in the near future, I think simulators are the best option, we have.



---
