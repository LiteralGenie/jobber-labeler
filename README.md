# Description

Tool for annotating the text from job descriptions.

This repo is part of a larger collection:
  - [jobber-collector-server](https://github.com/LiteralGenie/jobber-collector-server) / [jobber-collector-client](https://github.com/LiteralGenie/jobber-collector-client)
    - Tool for scraping job posts from Indeed. The client is a userscript that sends data to a Deno server / sqlite database.
  - [jobber-labler](https://github.com/LiteralGenie/jobber-labeler/) 
    - (this repo)
  - jobber-trainer 
    - (TODO) Fine-tunes LLM to extract info into a structured format (eg minimum years of experience, location, etc)
  - jobber
    - (TODO) Userscript to display summary of job listing.

# Features

- A "citation" can be added to each label, to specify which line(s) contain the relevant information. (So that breaking up long descriptions during training is possible.)
  - [Demo](https://github.com/LiteralGenie/jobber-labeler/assets/24236225/c0ff9c14-3843-47d9-a8a4-42e9cf3f70aa)

# Building

TODO
