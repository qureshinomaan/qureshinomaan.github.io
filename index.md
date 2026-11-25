---
layout: default
title: Nomaan Qureshi
---

## About Me

<div class="about">
    <div class="about-side">
        <img class="portrait" src="/images/nomaan.png" alt="Portrait of Nomaan Qureshi" width="200" height="200">
        <div>
            <a href="/resume.pdf">CV</a> |
            <a href="https://scholar.google.com/citations?user=ZmVf8kUAAAAJ&hl=en&sortby=pubdate">Google Scholar</a> |
            <a href="https://www.linkedin.com/in/qureshinomaan/">Linkedin</a> |
            <a href="https://github.com/qureshinomaan">Github</a> |
            <a href="mailto:nqafzal@gmail.com">Email</a> |
            <a href="https://twitter.com/qunomaan">Twitter</a>
        </div>
    </div>
    <div class="about-text">
        <p>Hi! I am a Research Engineer at <a href="https://skild.ai">Skild AI</a>, working on advancing robotics and AI. I completed my MS in Robotics at Carnegie Mellon University, where I was advised by <a href="https://www.ri.cmu.edu/ri-faculty/george-a-kantor/">Prof. George Kantor</a> and <a href="https://www.abhisilwal.com">Prof. Abhisesh Silwal</a>, and collaborated with <a href="https://davheld.github.io">Prof. David Held</a> and <a href="https://www.ri.cmu.edu/ri-people/francisco-yandun/">Dr. Francisco Yandun</a>. My interests broadly span robotics, machine learning, and building systems that support real-world applications. Previously, I worked on <a href="https://splatsim.github.io">SplatSim</a> and deployed robots in challenging real-world environments.</p>

        <p> Before that, I completed my integrated BS degree from <a href="https://csrankings.org/#/index?ai&vision&mlmining&nlp&inforet&robotics&in">IIIT Hyderabad</a>. I was an undergraduate researcher at Robotics Research Center, advised by <a href="https://scholar.google.co.in/citations?user=QDuPGHwAAAAJ&hl=en">Prof. K. Madhava Krishna.</a> I spent my summers of 2021 and 2022 working with Prof. David Held at Carnegie Mellon University. I formulated a differentiable version of linear dynamic systems, which could be used as a building block to accelerate the learning and transfer of policies. I also collaborated with <a href="https://makarandtapaswi.github.io">Prof. Makarand Tapaswi</a> on a project that aims to learn manipulation policies directly from human demonstrations like <a href="https://paperswithcode.com/dataset/something-something-v2">these.</a></p>
        <p>If you're looking for collaborators for Robotics/ML projects, please feel free to get in touch!</p>

    </div>
</div>

<hr class="fade">

## research
I want to solve robot manipulation. While most animals can walk or run, very few can manipulate their environments like humans do. There is an inherent simplicity yet profound intrigue in manipulation problems that captivates me. 

<hr class="fade">

## news
<div class="news-container">
  <ul>
<li>Jan 2025: <a href="/papers/splatsim/">SplatSim</a> accepted at ICRA 2025!</li>
<li>Sep 15, 2024: Submitted <a href="https://splatsim.github.io">SplatSim</a>  to ICRA 2025!</li>
<li>Jun 30, 2024: Imagine2Servo accepted at IROS 2024!</li>
<li>Sep 09, 2023: Teaching Assistant for <a href="https://16-831.github.io/fall23/">Robot Learning Course</a>!</li>
<li>Sep 09, 2023: Our paper on time-based inductive bias for RL policies got accepted to an IROS Workshop!</li>
<li>Aug 14, 2023: Started MS Robotics at CMU!</li>
<li>Apr 07, 2023: Our paper on data-driven inverse kinematics got accepted to IJCNN, 2023!</li>
<li>Jun 30, 2022: Our <a href="https://arxiv.org/pdf/2208.01960.pdf">paper</a> on skill learning using differentiable physics has been accepted for presentation at IROS, 2022!</li>
<li>May 26, 2022: Our <a href="https://sites.google.com/view/monocular-obstacle/home">paper</a> on Monocular Obstacle Avoidance got accepted to CASE,2022!</li>
<li>Jan 29, 2022: Our <a href="https://openreview.net/forum?id=rF-fT4pN1Wc&referrer=%5Bthe%20profile%20of%20Mohammad%20Nomaan%20Qureshi%5D">paper</a> on sequenced dynamical systems got accepted to GPL Workshop at ICLR, 2022!</li>
<li>Jun 30, 2021: Our work on Real Time Visual Servoing has been accepted for presentation at IROS,2021!</li>
<li>May 05, 2021: Started my internship at <a href="https://r-pad.github.io">R-PAD</a>, Carnegie Mellon University!</li>
<li>May 02, 2020: Started working at <a href="https://robotics.iiit.ac.in">Robotics Research Center</a>!</li>
  </ul>

</div>



<hr class="fade">

## Publications

Representative publications <span class="highlight-note">are highlighted.</span><br>
( "\*" denotes equal contribution. )

{% assign papers = site.papers | sort: "order" %}
{% for pub in papers %}
<div class="publication {% if pub.highlight %}highlighted{% endif %}">
  <div class="pub-image">
    <a href="{{ pub.url | relative_url }}"><img src="{{ pub.image | relative_url }}" alt="Teaser figure for {{ pub.short | default: pub.title | escape }}" loading="lazy"></a>
  </div>
  <div class="pub-content">
    <h3><a href="{{ pub.url | relative_url }}">{{ pub.title }}</a></h3>
    <p class="authors">{{ pub.authors | join: ", " | replace: 'M Nomaan Qureshi', '<strong class="me">M Nomaan Qureshi</strong>' }}</p>
    <p class="venue">{{ pub.venue }}, {{ pub.year }}{% if pub.note %} ({{ pub.note }}){% endif %}</p>
    <div class="pub-links">
      <a href="{{ pub.paper_link }}">Paper</a>
      {% if pub.project_link %} | <a href="{{ pub.project_link }}">Project</a>{% endif %}
      {% if pub.video_link %} | <a href="{{ pub.video_link }}">Video</a>{% endif %}
      {% if pub.code_link %} | <a href="{{ pub.code_link }}">Code</a>{% endif %}
      | <button type="button" onclick="toggleInfo('info{{ forloop.index }}')">Why?</button>
      | <button type="button" onclick="toggleInfo('contribution{{ forloop.index }}')">Contribution</button>
      | <button type="button" onclick="toggleInfo('bib{{ forloop.index }}')">Bibtex</button>
      {% if pub.demo %}| <a href="{{ pub.url | relative_url }}#sim">Simulator</a>{% endif %}
      | <a href="{{ pub.url | relative_url }}">Details</a>
    </div>
    <div id="info{{ forloop.index }}" class="hidden-info" hidden>
      <p>{{ pub.tldr }}</p>
    </div>
    <div id="contribution{{ forloop.index }}" class="hidden-info" hidden>
      <p>{{ pub.contribution }}</p>
    </div>
    <div id="bib{{ forloop.index }}" class="hidden-info" hidden>
      <pre><code>{{ pub.bibtex | escape }}</code></pre>
    </div>
  </div>
</div>
{% endfor %}

<script>
var currentlyOpenInfo = null;
function toggleInfo(infoId) {
    var clicked = document.getElementById(infoId);
    if (currentlyOpenInfo && currentlyOpenInfo !== clicked) {
        currentlyOpenInfo.hidden = true;
    }
    clicked.hidden = !clicked.hidden;
    currentlyOpenInfo = clicked.hidden ? null : clicked;
}
</script>

<hr class="fade">

## Contact
Please feel free to contact or interact with me through the following links:

* Email: nqafzal [at] gmail
* Google Scholar: [M. Nomaan Qureshi](https://scholar.google.com/citations?user=ZmVf8kUAAAAJ&hl=en)
* Twitter: [@qunomaan](https://twitter.com/qunomaan)
* GitHub: [qureshinomaan](https://github.com/qureshinomaan)
