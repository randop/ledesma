---
layout: post
title:  "Github Jenkins"
date: 2025-06-23T11:42:44+00:00
categories: github jenkins CI/CD
---

Over the past few months, I’ve been exploring an alternative to [Jenkins](https://www.jenkins.io/): [Github Actions](https://github.com/features/actions).

It enables CI/CD workflow automation that integrates directly with any GitHub repository.
As of now, it offers 2,000 CI/CD minutes per month for *free* on public repositories.

### Here is how it works in practice:
1. Create a new file named `.github/workflows/action.yml` in your project.
2. Add the following basic action to check out the repository:
```yaml
name: My Action Test
on:
  push:
    branches: ["master"]
  pull_request:
    branches: ["master"]
  workflow_dispatch: # Allow manual triggering
jobs:
  checkout:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
```
3. Push the changes to github repository. This will trigger the workflow action to execute.

### Docker support
There are multiple *actions* that supports building docker images with [cross-platform architectures](https://github.com/marketplace/actions/run-on-architecture) by using matrix strategy. The possibilities for docker CI/CD is good and straightforward.

### Conclusion
Many open-source repositories have adopted GitHub Actions, primarily due to the limited availability of Jenkins or its perceived complexity.
[During major incidents in 2023](https://github.blog/news-insights/company-news/addressing-githubs-recent-availability-issues/), Github suffered database cluster failure that resulted in widespread GitHub Actions workflow failures. There is great possibility of it happening again soon. Having an available Jenkins CI/CD that will not be affected by big tech outages is very important.