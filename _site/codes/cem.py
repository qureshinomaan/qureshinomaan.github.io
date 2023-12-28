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
    
    
    
    
