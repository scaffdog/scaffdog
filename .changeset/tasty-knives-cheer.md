---
'@scaffdog/engine': minor
---

Add `plur` helper function.

```clike
{{ "dog" | plur }}
--> dogs

{{ "dog" | plur 1 }}
--> dog

{{ "dog" | plur 2 }}
--> dogs
```
