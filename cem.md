---
layout: default
is_contact: true
---
##  <span style="color:red"> Cross Entropy Method </span>

Sampling based approaches provide an alternative to
Cross entropy method is a sampling based approach to optimisation. Although the method sounds fancy, it is fairly straightforward to understand. Let's start by trying to find minimum of f(x) =  $(x-5)^2$. We start with a distribution  x = [mean=0, variance=1]. We generate 'n' samples from this distribution. We update the mean of our distributing to to the mean of the top 'k' samples which have minimum values of f(x). The variance is also updated in a similar fashion. 

---
