// ===== الإعداد =====
// بعد نشر سكربت Google Apps Script، الصق رابط الـ Web App هنا:
window.SURVEY_CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwbtU8PqdEi5kj_DYAHM2rnGzh48GlVOUmX61mXx6OBJrAzBHA0jd5yDz0RKlOqBd-s/exec"
};

// ===== أسئلة الاستبيان =====
// type: radio (اختيار واحد) | checkbox (متعدد) | scale (مقياس) | grid (شبكة تقييم) | text | textarea
window.SURVEY = [
  {
    title: "معلومات عامة",
    questions: [
      { id: "subjects", type: "checkbox", label: "المواد اللي استخدمت ملخصها", required: true, filter: true,
        options: ["دراسات إسلامية: العقيدة والعبادة", "مناهج البحث", "تطور القوانين", "مبادئ القانون", "القانون الدستوري", "المدخل إلى الفقه الإسلامي"] },
      { id: "subject_rating", type: "grid", label: "قيّم ملخص كل مادة استخدمتها",
        options: ["ممتاز", "جيد", "مقبول", "ضعيف"],
        rows: [
          { id: "s_aqeedah", label: "دراسات إسلامية: العقيدة والعبادة" },
          { id: "s_research", label: "مناهج البحث" },
          { id: "s_history", label: "تطور القوانين" },
          { id: "s_principles", label: "مبادئ القانون" },
          { id: "s_const", label: "القانون الدستوري" },
          { id: "s_fiqh", label: "المدخل إلى الفقه الإسلامي" }
        ] },
      { id: "best_subject", type: "radio", label: "أفضل ملخص استفدت منه",
        options: ["دراسات إسلامية: العقيدة والعبادة", "مناهج البحث", "تطور القوانين", "مبادئ القانون", "القانون الدستوري", "المدخل إلى الفقه الإسلامي"] },
      { id: "source", type: "radio", label: "كيف عرفت عن ملخصات أبو عماد؟",
        options: ["صديق / زميل", "قروب الدفعة", "تويتر / إكس", "تيليجرام", "أخرى"] }
    ]
  },
  {
    title: "تقييم الاستفادة",
    questions: [
      { id: "overall", type: "scale", label: "بشكل عام، ما مدى استفادتك من الملخصات؟", required: true,
        min: 1, max: 5, minLabel: "ضعيفة", maxLabel: "ممتازة" },
      { id: "aspects", type: "grid", label: "قيّم الجوانب التالية",
        options: ["ممتاز", "جيد", "مقبول", "ضعيف"],
        rows: [
          { id: "r_coverage", label: "شمول المحتوى" },
          { id: "r_clarity", label: "الوضوح والترتيب" },
          { id: "r_colors", label: "الترميز اللوني" },
          { id: "r_tables", label: "جداول المقارنة" },
          { id: "r_traps", label: "فخاخ الاختبار" },
          { id: "r_night", label: "ورقة ليلة الاختبار" }
        ] },
      { id: "coverage", type: "radio", label: "كم من أسئلة الاختبار كانت مغطاة في الملخص؟",
        options: ["أكثر من 75%", "من 50 إلى 75%", "من 25 إلى 50%", "أقل من 25%"] },
      { id: "reliance", type: "radio", label: "كيف اعتمدت على الملخص في مذاكرتك؟",
        options: ["كان مرجعي الأساسي", "استخدمته مع الكتاب", "للمراجعة فقط", "نادرًا"] },
      { id: "grade", type: "radio", label: "هل ساعدك الملخص في تحسين درجتك؟",
        options: ["بشكل كبير", "بشكل متوسط", "بشكل بسيط", "لا"] },
      { id: "nps", type: "scale", label: "ما احتمال أنك توصي زميلك بملخصاتنا؟",
        min: 0, max: 10, minLabel: "مستبعد", maxLabel: "أكيد" }
    ]
  },
  {
    title: "الرسوم الرمزية",
    questions: [
      { id: "paid", type: "radio", label: "بالنظر للقيمة اللي تقدمها الملخصات، هل تؤيد أن تكون برسوم رمزية مستقبلًا؟", required: true,
        options: ["نعم أؤيد", "أؤيد إذا أضيفت مميزات جديدة", "محايد", "لا أؤيد"] },
      { id: "price", type: "radio", label: "لو كانت مدفوعة، كم السعر المناسب للمادة الواحدة؟",
        options: ["أقل من 10 ريال", "10 إلى 20 ريال", "21 إلى 30 ريال", "أكثر من 30 ريال"] },
      { id: "addons", type: "checkbox", label: "وش الإضافات اللي تخلّي الملخص يستاهل الرسوم؟",
        options: ["اختبار إلكتروني محاكي", "خرائط مفاهيم", "أسئلة التجميعات السابقة", "شرح صوتي أو فيديو", "جلسة مراجعة قبل الاختبار", "نسخة مطبوعة"] }
    ]
  },
  {
    title: "اقتراحاتك",
    questions: [
      { id: "liked", type: "text", label: "أكثر شيء عجبك في الملخصات؟" },
      { id: "improve", type: "textarea", label: "وش اللي ما عجبك أو تتمنى نحسّنه؟" },
      { id: "next", type: "text", label: "مواد تتمنى نلخصها الفصل القادم؟" },
      { id: "note", type: "textarea", label: "أي اقتراح أو كلمة لنا؟" }
    ]
  }
];

// اسم العمود في الجدول لكل سؤال (للشبكة: السؤال - البند)
window.SURVEY_COLUMNS = (function () {
  var cols = [];
  window.SURVEY.forEach(function (s) {
    s.questions.forEach(function (q) {
      if (q.type === "grid") {
        q.rows.forEach(function (r) { cols.push({ key: r.id, label: q.label + " - " + r.label, q: q, row: r }); });
      } else {
        cols.push({ key: q.id, label: q.label, q: q });
      }
    });
  });
  return cols;
})();
