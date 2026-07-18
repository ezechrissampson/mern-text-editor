# Manual verification checklist for sanitize.service.js

Run these once dependencies are installed (`npm install`) to confirm the
sanitization pipeline behaves as expected. A full Jest suite is a
recommended next step (see README "Production Checklist").

1. `sanitizeContentHtml('<script>alert(1)</script><p>hi</p>')` → script tag stripped, `<p>hi</p>` kept.
2. `sanitizeContentHtml('<img src="x" onerror="alert(1)">')` → onerror attribute stripped.
3. `sanitizeContentHtml('<a href="javascript:alert(1)">click</a>')` → href stripped/link neutralized.
4. `sanitizeContentHtml('<iframe src="https://evil.com"></iframe>')` → throws AppError(400).
5. `sanitizeContentHtml('<iframe src="https://www.youtube.com/embed/xyz"></iframe>')` → passes, sandbox attrs added.
6. `isSafeMediaUrl('javascript:alert(1)')` → false.
7. `isSafeMediaUrl('https://media.example.com/photo.jpg')` → true.
