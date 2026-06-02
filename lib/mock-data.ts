import { generateLotteryNumbers } from "@/lib/lottery";

export const demoUser = {
  id: "demo-user",
  name: "阿和",
  birthday: "2001-04-21",
  city: "杭州",
  zodiac: "金牛座",
  recordDays: 18,
  memories: 42
};

export const todayNote = {
  text: "今天下午有个小转机，别主动追问，等它来。",
  possibility: 73
};

export const openTodayOptions = [
  {
    zh: "耐心",
    en: "Patience",
    subtitle: "事情会在自己的节奏里发生，不用推。"
  },
  {
    zh: "转机",
    en: "A Turn",
    subtitle: "今天会有一个不太明显的转弯。"
  },
  {
    zh: "慢一点",
    en: "Slower",
    subtitle: "别着急回复，也别着急决定。"
  }
];

export const noteResult = {
  text:
    "今天的你处在一个“想说又没说出口”的节点。下午三点之后会出现一个契机，可能是一条不相关的消息让你换个角度看事情，也可能是有人主动打破沉默。不必今天做决定，先把话说一半。",
  possibility: 73
};

export const historyInsights = {
  summary: "提到了 4 次“烦”，3 次工作相关。周三状态最好，那天你和朋友吃了火锅。",
  insights: [
    {
      title: "你最近把话收得很快",
      detail: "两次记录都停在一句没说完的话那里。你可能不是没想清楚，只是不想把它说重。",
      hook: "要聊聊吗？"
    },
    {
      title: "晚上 23 点后更容易想很多",
      detail: "这不是问题，只是提醒。下次很晚还想记录，可以先写一句最短的。",
      hook: "一句也算。"
    },
    {
      title: "火锅那天你轻了一点",
      detail: "有些答案不是想出来的，是吃完一顿热的之后自己松开的。",
      hook: "记得再约。"
    }
  ]
};

export const records = [
  {
    id: "r1",
    date: "4 月 20 日",
    weekday: "周日",
    timeOfDay: "下午",
    count: "1 条记录",
    preview: "今天要不要去那家新开的咖啡馆？其实我心里已经有点想去了。",
    text: "今天要不要去那家新开的咖啡馆？其实我心里已经有点想去了。但又怕一个人坐在那边显得太刻意。最后还是没去——明天再说吧。",
    inputType: "text" as const,
    images: ["图 1"]
  },
  {
    id: "r2",
    date: "4 月 19 日",
    weekday: "周六",
    timeOfDay: "晚上",
    count: "2 条记录 · 1 张图",
    preview: "下班路上看到一片很淡的云，突然觉得今天没有那么糟。",
    text: "下班路上看到一片很淡的云，突然觉得今天没有那么糟。\n\n（另一条）有点想给爸妈打个电话，又有点不知道说什么。先吃饭吧。",
    inputType: "text" as const,
    images: ["图 1"]
  },
  {
    id: "r3",
    date: "4 月 17 日",
    weekday: "周四",
    timeOfDay: "深夜",
    count: "1 条语音 · 38 秒",
    preview: "好像还是会在同一个问题上绕回来。",
    text: "好像还是会在同一个问题上绕回来。可能不是问题没解决，是我一直在回头看。",
    inputType: "voice" as const,
    audioDuration: 38,
    images: []
  }
];

// 收下的预感 — saved 今日预感 notes (different from daily journal records)
export const savedNotes = [
  {
    id: "n1",
    date: "4 月 18 日",
    choice: "转机",
    text: "今天的你处在一个\"想说又没说出口\"的节点。下午三点之后会出现一个契机...",
    possibility: 73
  },
  {
    id: "n2",
    date: "4 月 12 日",
    choice: "耐心",
    text: "事情会在自己的节奏里发生。你不用推它，也不用催它...",
    possibility: 64
  }
];

export const lottery = generateLotteryNumbers(
  demoUser.birthday,
  demoUser.id,
  "double_color"
);
