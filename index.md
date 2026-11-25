---
layout: default
title: Nomaan Qureshi
---

<section class="hero" aria-label="About">
    <div class="hero-portrait">
        <picture>
            <source srcset="/images/nomaan.webp" type="image/webp">
            <img src="/images/nomaan.jpg" alt="Portrait of Nomaan Qureshi" width="640" height="640" fetchpriority="high">
        </picture>
    </div>
    <div class="hero-body">
        <h1>Nomaan Qureshi</h1>
        <p>Hi! I am a Research Engineer at <a href="https://skild.ai">Skild AI</a>, working on advancing robotics and AI. I completed my MS in Robotics at Carnegie Mellon University, where I was advised by <a href="https://www.ri.cmu.edu/ri-faculty/george-a-kantor/">Prof. George Kantor</a> and <a href="https://www.abhisilwal.com">Prof. Abhisesh Silwal</a>, and collaborated with <a href="https://davheld.github.io">Prof. David Held</a> and <a href="https://www.ri.cmu.edu/ri-people/francisco-yandun/">Dr. Francisco Yandun</a>. My interests broadly span robotics, machine learning, and building systems that support real-world applications. Previously, I worked on <a href="https://splatsim.github.io">SplatSim</a> and deployed robots in challenging real-world environments.</p>
        <p>Before that, I completed my integrated BS degree from <a href="https://csrankings.org/#/index?ai&vision&mlmining&nlp&inforet&robotics&in">IIIT Hyderabad</a>. I was an undergraduate researcher at Robotics Research Center, advised by <a href="https://scholar.google.co.in/citations?user=QDuPGHwAAAAJ&hl=en">Prof. K. Madhava Krishna.</a> I spent my summers of 2021 and 2022 working with Prof. David Held at Carnegie Mellon University. I formulated a <a href="/papers/deep-sequenced-linear-dynamical-systems/">differentiable version of linear dynamic systems</a>, which could be used as a building block to accelerate the learning and transfer of policies. I also collaborated with <a href="https://makarandtapaswi.github.io">Prof. Makarand Tapaswi</a> on a <a href="/papers/skills-from-video-differentiable-physics/">project</a> that aims to learn manipulation policies directly from human demonstrations like <a href="https://paperswithcode.com/dataset/something-something-v2">these.</a></p>
        <p>If you're looking for collaborators for Robotics/ML projects, please feel free to get in touch!</p>
        <p class="hero-links">
            <a class="tlink" href="/resume.pdf">CV</a>
            <a class="tlink" href="https://scholar.google.com/citations?user=ZmVf8kUAAAAJ&hl=en&sortby=pubdate">Google Scholar</a>
            <a class="tlink" href="https://github.com/qureshinomaan">GitHub</a>
            <a class="tlink" href="https://www.linkedin.com/in/qureshinomaan/">LinkedIn</a>
            <a class="tlink" href="https://twitter.com/qunomaan">Twitter</a>
            <a class="tlink" href="mailto:nqafzal@gmail.com">Email</a>
        </p>
    </div>
</section>

<section class="section" id="research">
    <h2>Research</h2>
    <p class="statement">I want to solve robot manipulation. While most animals can walk or run, very few can manipulate their environments like humans do. There is an inherent simplicity yet profound intrigue in manipulation problems that captivates me.</p>
</section>

<section class="section" id="news">
    <h2>News</h2>
    <ul class="news">
        <li><time>Jan 2025</time><span><a href="/papers/splatsim/">SplatSim</a> accepted at ICRA 2025!</span></li>
        <li><time>Sep 15, 2024</time><span>Submitted <a href="https://splatsim.github.io">SplatSim</a> to ICRA 2025!</span></li>
        <li><time>Jun 30, 2024</time><span><a href="/papers/imagine2servo/">Imagine2Servo</a> accepted at IROS 2024!</span></li>
        <li><time>Sep 09, 2023</time><span>Teaching Assistant for <a href="https://16-831.github.io/fall23/">Robot Learning Course</a>!</span></li>
        <li><time>Sep 09, 2023</time><span>Our <a href="/papers/time-indexing/">paper</a> on time-based inductive bias for RL policies got accepted to an IROS Workshop!</span></li>
    </ul>
    <details class="more">
        <summary>Earlier news</summary>
        <ul class="news">
            <li><time>Aug 14, 2023</time><span>Started MS Robotics at CMU!</span></li>
            <li><time>Apr 07, 2023</time><span>Our <a href="/papers/arc-length-value-function/">paper</a> on data-driven inverse kinematics got accepted to IJCNN, 2023!</span></li>
            <li><time>Jun 30, 2022</time><span>Our <a href="/papers/skills-from-video-differentiable-physics/">paper</a> on skill learning using differentiable physics has been accepted for presentation at IROS, 2022!</span></li>
            <li><time>May 26, 2022</time><span>Our <a href="/papers/flow-synthesis-visual-servoing/">paper</a> on Monocular Obstacle Avoidance got accepted to CASE, 2022!</span></li>
            <li><time>Jan 29, 2022</time><span>Our <a href="/papers/deep-sequenced-linear-dynamical-systems/">paper</a> on sequenced dynamical systems got accepted to GPL Workshop at ICLR, 2022!</span></li>
            <li><time>Jun 30, 2021</time><span>Our work on <a href="/papers/rtvs/">Real Time Visual Servoing</a> has been accepted for presentation at IROS, 2021!</span></li>
            <li><time>May 05, 2021</time><span>Started my internship at <a href="https://r-pad.github.io">R-PAD</a>, Carnegie Mellon University!</span></li>
            <li><time>May 02, 2020</time><span>Started working at <a href="https://robotics.iiit.ac.in">Robotics Research Center</a>!</span></li>
        </ul>
    </details>
</section>

<section class="section" id="publications">
    <h2>Publications</h2>
    <p class="section-note">Representative publications <span class="highlight-note">are highlighted</span>. "*" denotes equal contribution. Each paper has its own page with a summary, questions and answers, and an interactive visual. You can also browse <a href="/research/">by topic</a> or download the <a href="/papers.bib">BibTeX for all papers</a>.</p>

    {% assign papers = site.papers | sort: "order" %}
    {% for pub in papers %}
    {%- assign slug = pub.url | remove: "/papers/" | remove: "/" -%}
    <article class="pub{% if pub.highlight %} is-featured{% endif %}" id="{{ slug }}">
        <a class="pub-media{% if pub.thumb_fit == 'contain' %} fit-contain{% endif %}" href="{{ pub.url | relative_url }}" tabindex="-1" aria-hidden="true">
            {%- if pub.video %}
            <video muted loop playsinline preload="none" data-autoplay poster="{{ pub.image | relative_url }}" width="{{ pub.image_w }}" height="{{ pub.image_h }}" aria-label="Teaser clip for {{ pub.short | default: pub.title | escape }}">
                <source src="{{ pub.video | relative_url }}" type="video/mp4">
            </video>
            {%- else %}
            <picture>
                {%- if pub.image_webp %}<source srcset="{{ pub.image_webp | relative_url }}" type="image/webp">{% endif %}
                <img src="{{ pub.image | relative_url }}" alt="Teaser figure for {{ pub.short | default: pub.title | escape }}" loading="lazy" width="{{ pub.image_w }}" height="{{ pub.image_h }}">
            </picture>
            {%- endif %}
        </a>
        <div class="pub-body">
            <p class="pub-venue"><span class="badge">{{ pub.venue_short | default: pub.year }}</span>{% if pub.note %}<span class="badge badge-accent">{{ pub.note }}</span>{% endif %}</p>
            <h3><a href="{{ pub.url | relative_url }}">{{ pub.title }}</a></h3>
            <p class="authors">{{ pub.authors | join: ", " | replace: 'M Nomaan Qureshi', '<strong class="me">M Nomaan Qureshi</strong>' }}</p>
            <p class="venue-full">{{ pub.venue }}, {{ pub.year }}{% if pub.note %} ({{ pub.note }}){% endif %}</p>
            <div class="pub-links">
                <a class="pill" href="{{ pub.paper_link }}">Paper</a>
                {%- if pub.demo %}<a class="pill pill-accent" href="{{ pub.url | relative_url }}#sim">Interactive visual</a>{% endif %}
                {%- if pub.project_link %}<a class="tlink" href="{{ pub.project_link }}">Project</a>{% endif %}
                {%- if pub.code_link %}<a class="tlink" href="{{ pub.code_link }}">Code</a>{% endif %}
                {%- if pub.video_link %}<a class="tlink" href="{{ pub.video_link }}">Video</a>{% endif %}
                <button class="tlink" type="button" aria-expanded="false" aria-controls="info-{{ slug }}" onclick="toggleInfo(this)">Why?</button>
                <button class="tlink" type="button" aria-expanded="false" aria-controls="contribution-{{ slug }}" onclick="toggleInfo(this)">Contribution</button>
                <button class="tlink" type="button" aria-expanded="false" aria-controls="bib-{{ slug }}" onclick="toggleInfo(this)">BibTeX</button>
            </div>
            <div id="info-{{ slug }}" class="hidden-info" hidden>
                <p>{{ pub.tldr }}</p>
            </div>
            <div id="contribution-{{ slug }}" class="hidden-info" hidden>
                <p>{{ pub.contribution }}</p>
            </div>
            <div id="bib-{{ slug }}" class="hidden-info" hidden>
                <pre><code>{{ pub.bibtex | escape }}</code></pre>
            </div>
        </div>
    </article>
    {% endfor %}
</section>

<script>
var openInfo = null;
function toggleInfo(btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (openInfo && openInfo.panel !== panel) {
        openInfo.panel.hidden = true;
        openInfo.btn.setAttribute("aria-expanded", "false");
    }
    panel.hidden = !panel.hidden;
    btn.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
    openInfo = panel.hidden ? null : { panel: panel, btn: btn };
}
</script>

<section class="section" id="contact">
    <h2>Contact</h2>
    <p>Please feel free to contact or interact with me through the following links:</p>
    <ul class="contact-list">
        <li><span>Email</span> nqafzal [at] gmail</li>
        <li><span>Google Scholar</span> <a href="https://scholar.google.com/citations?user=ZmVf8kUAAAAJ&hl=en">M. Nomaan Qureshi</a></li>
        <li><span>Twitter</span> <a href="https://twitter.com/qunomaan">@qunomaan</a></li>
        <li><span>GitHub</span> <a href="https://github.com/qureshinomaan">qureshinomaan</a></li>
    </ul>
</section>
