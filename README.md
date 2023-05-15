# Description

Tool for annotating the text from job descriptions.

[Demo](https://github.com/LiteralGenie/jobber-labeler/assets/24236225/c0ff9c14-3843-47d9-a8a4-42e9cf3f70aa)

---

This repo is part of a larger collection:
  - [jobber-collector-server](https://github.com/LiteralGenie/jobber-collector-server) / [jobber-collector-client](https://github.com/LiteralGenie/jobber-collector-client)
    - Tool for scraping job posts from Indeed. The client is a userscript that automatically sends data to a Deno server / sqlite database as you browse Indeed listings.
  - [jobber-labler](https://github.com/LiteralGenie/jobber-labeler/) 
    - (this repo)
  - jobber-trainer 
    - (TODO) Fine-tunes an LLM to extract info into a structured format (eg minimum years of experience, location, etc)
  - jobber
    - (TODO) Userscript to insert summary next to job listings on Indeed.

# Features

- A "citation" can be added to each label, to specify which line(s) contain the relevant information. (So that breaking up long descriptions during training is possible.)

# Building

TODO
