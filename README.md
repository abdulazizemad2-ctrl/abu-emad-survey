# استبيان ملخصات أبو عماد

- `index.html`: صفحة الاستبيان اللي ترسل رابطها للطلاب.
- `results.html`: صفحة الردود والإحصائيات (محمية بكلمة مرور).
- `questions.js`: الأسئلة ورابط السكربت. عدّل الأسئلة من هنا فقط.
- `apps-script/Code.gs`: السكربت اللي يحفظ الردود في Google Sheets.

## الإعداد (مرة وحدة، حوالي 5 دقائق)

1. افتح [sheets.new](https://sheets.new) لإنشاء جدول جديد، وسمّه مثلًا «ردود الاستبيان».
2. من القائمة: **Extensions › Apps Script** (الإضافات › برمجة التطبيقات).
3. احذف الكود الموجود والصق محتوى `apps-script/Code.gs`.
4. غيّر `ADMIN_KEY` لكلمة مرور خاصة فيك، ثم احفظ.
5. اضغط **Deploy › New deployment** واختر النوع **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. وافق على الصلاحيات، وانسخ رابط الـ Web app (ينتهي بـ `/exec`).
7. افتح `questions.js` في GitHub والصق الرابط مكان `PASTE_APPS_SCRIPT_URL_HERE`، ثم احفظ (Commit).
8. فعّل GitHub Pages: **Settings › Pages › Branch: main / root › Save**.

بعدها:
- رابط الاستبيان للطلاب: `https://<اسم-المستخدم>.github.io/<اسم-المستودع>/`
- رابط النتائج لك: `https://<اسم-المستخدم>.github.io/<اسم-المستودع>/results.html`

الردود تظهر أيضًا مباشرة في جدول Google Sheets في ورقة «الردود».

> إذا عدّلت `Code.gs` لاحقًا: Deploy › Manage deployments › تعديل › Version: New version، حتى يبقى نفس الرابط.
