---
layout: default0
is_contact: true
---
##  <span style="color:red"> Cross Entropy Method </span>
<img src="../images/CEM.jpg" alt="CEM" > </img>

### Introduction
Cross entropy method is a sampling based approach to optimisation. CEM belongs to the class of Monte-Carlo methods, where the general theme is to maximise the probability of favourable events. Although the method sounds fancy, it is fairly straightforward to understand. Let's start by taking an example. Our objective is to minimise the function f(x) = $$ (x-5) ^2 $$. CEM algorithm is described as follows :
1. Initialise a gaussian distribution.
  * Let's take our mean = 0, variance = 5.
2. Sample 'n' values of x from our distribution.
3. Compute f(x) for each sample and sort them in ascending order.
4. Update the mean and variance of our distribution to mean and variance of top 'k' samples.
5. Terminate if converged, else go to step 2.

Ya that's it.

### Code
```
  import numpy as np

  def objective(x):
      return (x-5)**2


  ITER = 0
  MAX_ITERS = 100
  MIN_ERROR = 0.1
  ERROR = 100

  num_samples = 20
  top_k = 5
  mu, sigma = 0.0, 5

  while ERROR > MIN_ERROR and ITER < MAX_ITERS:
      samples = np.random.normal(mu, sigma, (num_samples))
      samples_losses = objective(samples)
      sorted_index = np.argsort(samples_losses)
      
      mu = np.mean(samples[sorted_index[0:top_k]])
      sigma = np.std(samples[sorted_index[0:top_k]])
      ERROR = objective(mu)
      ITER += 1

```


### Mathematical Analysis

### Applications of CEM

#### Travelling Salesman Problem

#### Model Predictive Control

---
