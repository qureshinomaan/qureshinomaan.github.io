---
layout: default
is_contact: true
---
##  <span style="color:red"> Cross Entropy Method </span>

### Introduction
Cross entropy method is a sampling based approach to optimisation. Although the method sounds fancy, it is fairly straightforward to understand. Let's start by taking an example. Our objective is to minimise the function f(x) = $$ (x-5) ^2 $$. CEM algorithm is described as follows :
1. Initialise a gaussian distribution.
  * Let's take our mean = 0, variance = 0.
2. Sample 'n' values of x from our distribution.
3. Compute f(x) for each sample and sort them in ascending order.
4. Update the mean and variance of our distribution to mean and variance of top 'k' samples.
5. Terminate if converged, else go to step 2.

Ya that's it.

### Code


### Mathematical Analysis

### Applications of CEM

#### Travelling Salesman Problem

#### Model Predictive Control

---
