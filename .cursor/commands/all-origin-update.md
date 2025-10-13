---
name: all origin update 
description: push to all git remotes
---

```shell
git remote | xargs -n1 git push --all 
```
