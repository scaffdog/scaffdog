---
'@scaffdog/engine': patch
'scaffdog': patch
---

Fixes for `safe-eval` vulnerability issues.
Fixes to remove `safe-eval` as a dependency and use `vm.runInNewContext` instead.
Since scaffdog is intended to be used in a development environment, it is assumed that the input code is safe. Do not use the `eval` helper function in situations where it receives input from third parties.

Fixes: #766
