---
layout: default0
is_contact: true
---
##  <span style="color:red"> Visual Servoing </span>
<img src="../images/vs.jpg" alt="Visual Servoing" />

### Introduction
Visual servoing is controlling the motion of robot using a vision sensor or camera. What we mean by this is that given a target image and current image, we want to generate a sequence of velocity commands that takes us from current image to the target image. Visual servoing aims to provide an abstraction layer, so that we can provide images as goal to the robot and ask it to move, instead of explicit 3D coordinates. This abstraction is particularly interesting because it maps direct image measurements from the environment to action, instead of requiring an intermeditate co-ordinate systems which depends on the frame. The amount of possibilities that this kind of abstraction opens up is amazing. We humans also tend to think and move in image space. Visual servoing covers the moving part. If we can combine this servoing with imagination, we will have a fully autonomous robot based on just vision sensor.  


### Image Based Visual Servoing (IBVS).

#### The interaction matrix
Interation matrix is a matrix which expresses the relation between the motion imposed camera and the motion of features on image plane.
```
          ┌                                        ┐
L  =      [ −1/Z    0    x/Z    x*y   −(1+x^2)    y│
          │   0   −1/Z   y/Z   1+y^2    −x*y     −x│
          └                                        ┘
```
Here (x, y) are the pixel coordinates in the image plane and Z is the depth value at (x, y).

### MPC Based Visual Servoing.

### References
[1] http://users.softlab.ntua.gr/~ktzaf/Courses/literature/24_Visual_Servoing_and_Visual_Tracking.pdf

---
