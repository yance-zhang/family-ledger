// ─── Translation dictionaries ─────────────────────────────────────────────────

export const translations = {
  zh: {
    // App
    appTitle: "家庭记账",
    appDescription: "纯前端家庭收支管理工具",

    // Home
    allCards: "全部卡片",
    manageCards: "管理卡片",
    viewSummary: "查看月汇总",
    transactionsSection: "收支明细",
    addRecord: "记一笔",

    // MonthPicker
    prevMonth: "上一月",
    nextMonth: "下一月",
    monthFormat: (year: string, month: number) => `${year}年${month}月`,

    // MonthlySummary
    income: "收入",
    expense: "支出",
    balance: "结余",

    // TransactionList
    loading: "加载中…",
    noRecords: "本月暂无记录",
    confirmDeleteTitle: "确认删除",
    confirmDeleteMsg: (category: string) =>
      `确定要删除「${category}」这条记录吗？此操作不可撤销。`,
    cancel: "取消",
    delete: "删除",

    // TransactionForm
    newRecord: "记一笔",
    editRecord: "编辑记录",
    expenseLabel: "支出",
    incomeLabel: "收入",
    amountLabel: "金额",
    dateLabel: "日期",
    cardLabel: "卡片",
    selectCardPlaceholder: "请选择卡片",
    categoryLabel: "分类",
    selectCategoryPlaceholder: "请选择分类",
    noteLabel: "备注（可选）",
    notePlaceholder: "添加备注…",
    saving: "保存中…",
    saveChanges: "保存修改",
    save: "保存记录",
    errorAmount: "请输入有效金额",
    errorDate: "请选择日期",
    errorCard: "请选择卡片",
    errorCategory: "请选择分类",
    creditCard: "信用卡",
    debitCard: "借记卡",

    // CardManager
    addCardTitle: "新增卡片",
    cardNameLabel: "卡片名称",
    cardNamePlaceholder: "例如：招商银行储蓄卡",
    cardTypeLabel: "卡片类型",
    bankLabel: "银行（可选）",
    bankPlaceholder: "例如：招商银行",
    addingCard: "保存中...",
    addCardBtn: "添加卡片",
    existingCards: "已有卡片",
    noCards: "暂无卡片",
    deleteCardAriaLabel: "删除卡片",
    deleteCardBtn: "删除",

    // Summary page
    monthlySummary: "月汇总",
    backHome: "返回首页",
    totalIncome: "累计收入",
    totalExpense: "累计支出",
    totalBalance: "累计结余",
    monthlyBreakdown: "每月累计收支",
    loadingDots: "加载中...",
    noData: "暂无记录",
    recordCount: (n: number) => `${n} 笔`,

    // Carry over
    carrying: "结转中…",
    carried: "✓ 已结转",
    alreadyCarried: "已结转",
    noSurplus: "无结余",
    carry: "结转",

    // Category names (keyed by DB name)
    categoryNames: {
      餐饮: "餐饮",
      交通: "交通",
      购物: "购物",
      居家: "居家",
      医疗: "医疗",
      娱乐: "娱乐",
      教育: "教育",
      其他支出: "其他支出",
      工资: "工资",
      奖金: "奖金",
      理财: "理财",
      其他收入: "其他收入",
      结余结转: "结余结转",
    },
  },

  en: {
    // App
    appTitle: "Family Ledger",
    appDescription: "Frontend-only family finance tracker",

    // Home
    allCards: "All Cards",
    manageCards: "Cards",
    viewSummary: "Summary",
    transactionsSection: "Transactions",
    addRecord: "Add",

    // MonthPicker
    prevMonth: "Previous month",
    nextMonth: "Next month",
    monthFormat: (year: string, month: number) => {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${months[month - 1]} ${year}`;
    },

    // MonthlySummary
    income: "Income",
    expense: "Expense",
    balance: "Balance",

    // TransactionList
    loading: "Loading…",
    noRecords: "No records this month",
    confirmDeleteTitle: "Confirm Delete",
    confirmDeleteMsg: (category: string) =>
      `Delete "${category}"? This cannot be undone.`,
    cancel: "Cancel",
    delete: "Delete",

    // TransactionForm
    newRecord: "New Record",
    editRecord: "Edit Record",
    expenseLabel: "Expense",
    incomeLabel: "Income",
    amountLabel: "Amount",
    dateLabel: "Date",
    cardLabel: "Card",
    selectCardPlaceholder: "Select card",
    categoryLabel: "Category",
    selectCategoryPlaceholder: "Select category",
    noteLabel: "Note (optional)",
    notePlaceholder: "Add a note…",
    saving: "Saving…",
    saveChanges: "Save Changes",
    save: "Save",
    errorAmount: "Enter a valid amount",
    errorDate: "Select a date",
    errorCard: "Select a card",
    errorCategory: "Select a category",
    creditCard: "Credit",
    debitCard: "Debit",

    // CardManager
    addCardTitle: "Add Card",
    cardNameLabel: "Card name",
    cardNamePlaceholder: "e.g. Chase Debit",
    cardTypeLabel: "Type",
    bankLabel: "Bank (optional)",
    bankPlaceholder: "e.g. Chase",
    addingCard: "Saving...",
    addCardBtn: "Add Card",
    existingCards: "Your Cards",
    noCards: "No cards yet",
    deleteCardAriaLabel: "Delete card",
    deleteCardBtn: "Delete",

    // Summary page
    monthlySummary: "Monthly Summary",
    backHome: "Back",
    totalIncome: "Total Income",
    totalExpense: "Total Expense",
    totalBalance: "Total Balance",
    monthlyBreakdown: "Monthly Breakdown",
    loadingDots: "Loading...",
    noData: "No records",
    recordCount: (n: number) => `${n} record${n === 1 ? "" : "s"}`,

    // Carry over
    carrying: "Carrying…",
    carried: "✓ Carried",
    alreadyCarried: "Carried",
    noSurplus: "No surplus",
    carry: "Carry",

    // Category names (keyed by DB name)
    categoryNames: {
      餐饮: "Dining",
      交通: "Transport",
      购物: "Shopping",
      居家: "Home",
      医疗: "Medical",
      娱乐: "Entertainment",
      教育: "Education",
      其他支出: "Other Expense",
      工资: "Salary",
      奖金: "Bonus",
      理财: "Investment",
      其他收入: "Other Income",
      结余结转: "Balance Carry-over",
    },
  },
} satisfies Record<string, Record<string, unknown>>;

export type Locale = keyof typeof translations;
export type Translations = (typeof translations)[Locale];
