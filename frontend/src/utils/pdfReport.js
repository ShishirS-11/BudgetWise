import jsPDF from 'jspdf'

export function generateMonthlyReport({
  monthLabel = 'Monthly Report',

  totalSpent = 0,

  totalCredits = 0,

  monthlyBudget = 0,

  averageDailySpending = 0,

  topCategory = null,

  highestSpendingDay = null,

  spendingChange = null,

  categoryTotals = [],

  dailyExpenses = [],

  insights = [],

  /*
   * Currency
   *
   * All application amounts are stored
   * in INR.
   *
   * exchangeRate converts:
   *
   * INR -> selected currency
   */

  currency = 'INR',

  currencySymbol = '₹',

  exchangeRate = 1,
}) {
  const pdf =
    new jsPDF()

  const pageWidth =
    pdf.internal.pageSize.getWidth()

  const pageHeight =
    pdf.internal.pageSize.getHeight()

  const margin = 16

  const contentWidth =
    pageWidth -
    margin * 2

  const purple = [
    124,
    58,
    237,
  ]

  const purpleLight = [
    245,
    243,
    255,
  ]

  const green = [
    16,
    185,
    129,
  ]

  const greenLight = [
    236,
    253,
    245,
  ]

  const red = [
    239,
    68,
    68,
  ]

  const redLight = [
    254,
    242,
    242,
  ]

  const dark = [
    24,
    24,
    27,
  ]

  const text = [
    39,
    39,
    42,
  ]

  const muted = [
    113,
    113,
    122,
  ]

  const border = [
    228,
    228,
    231,
  ]

  const grid = [
    235,
    235,
    238,
  ]

  const white = [
    255,
    255,
    255,
  ]

  const background = [
    250,
    250,
    250,
  ]

  /*
   * =========================================
   * CURRENCY
   * =========================================
   */

  const safeRate =
    Number(exchangeRate)

  /*
   * Every amount entering this PDF is
   * assumed to be in INR.
   *
   * Example:
   *
   * INR 1000
   *
   * USD rate = 0.011
   *
   * PDF = USD 11
   */

  function convertAmount(
    value,
  ) {
    const number =
      Number(value || 0)

    if (
      !Number.isFinite(
        number,
      )
    ) {
      return 0
    }

    if (
      !Number.isFinite(
        safeRate,
      ) ||
      safeRate <= 0
    ) {
      return number
    }

    return (
      number *
      safeRate
    )
  }

  /*
   * IMPORTANT:
   *
   * Use currency CODE instead of
   * currencySymbol in the PDF.
   *
   * This avoids jsPDF Helvetica
   * Unicode problems.
   *
   * Examples:
   *
   * INR 70,000
   * USD 850
   * EUR 720
   * AED 3,000
   */

  function money(
    value,
  ) {
    const converted =
      convertAmount(
        value,
      )

    const formatted =
      converted.toLocaleString(
        'en-IN',
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        },
      )

    return `${currency} ${formatted}`
  }

  /*
   * =========================================
   * DATE
   * =========================================
   */

  function formatDate(
    dateString,
  ) {
    if (!dateString) {
      return 'Unknown date'
    }

    const date =
      new Date(
        `${dateString}T00:00:00`,
      )

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return dateString
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      },
    )
  }

  function shortDate(
    dateString,
  ) {
    if (!dateString) {
      return ''
    }

    const date =
      new Date(
        `${dateString}T00:00:00`,
      )

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return dateString
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
      },
    )
  }

  /*
   * =========================================
   * COLORS
   * =========================================
   */

  function setText(
    color,
  ) {
    pdf.setTextColor(
      color[0],
      color[1],
      color[2],
    )
  }

  function setFill(
    color,
  ) {
    pdf.setFillColor(
      color[0],
      color[1],
      color[2],
    )
  }

  function setDraw(
    color,
  ) {
    pdf.setDrawColor(
      color[0],
      color[1],
      color[2],
    )
  }

  /*
   * =========================================
   * BACKGROUND
   * =========================================
   */

  function drawBackground() {
    setFill(
      background,
    )

    pdf.rect(
      0,
      0,
      pageWidth,
      pageHeight,
      'F',
    )

    setFill(
      purple,
    )

    pdf.rect(
      0,
      0,
      pageWidth,
      4,
      'F',
    )
  }

  /*
   * =========================================
   * FOOTER
   * =========================================
   */

  function footer(
    pageNumber,
  ) {
    const y =
      pageHeight - 9

    setDraw(
      border,
    )

    pdf.setLineWidth(
      0.3,
    )

    pdf.line(
      margin,
      y - 4,
      pageWidth -
        margin,
      y - 4,
    )

    pdf.setFont(
      'helvetica',
      'normal',
    )

    pdf.setFontSize(
      7,
    )

    setText(
      muted,
    )

    pdf.text(
      'BudgetWise - Personal Finance Report',
      margin,
      y,
    )

    pdf.text(
      `Page ${pageNumber}`,
      pageWidth -
        margin,
      y,
      {
        align:
          'right',
      },
    )
  }

  /*
   * =========================================
   * HEADER
   * =========================================
   */

  function header(
    title,
    subtitle,
  ) {
    let y = 18

    pdf.setFont(
      'helvetica',
      'bold',
    )

    pdf.setFontSize(
      22,
    )

    setText(
      dark,
    )

    pdf.text(
      'BudgetWise',
      margin,
      y,
    )

    y += 9

    pdf.setFont(
      'helvetica',
      'normal',
    )

    pdf.setFontSize(
      10,
    )

    setText(
      muted,
    )

    pdf.text(
      `${monthLabel} - ${title}`,
      margin,
      y,
    )

    y += 5

    if (subtitle) {
      pdf.setFontSize(
        8,
      )

      pdf.text(
        subtitle,
        margin,
        y,
      )

      y += 4
    }

    /*
     * Currency shown explicitly.
     */

    pdf.setFontSize(
      7,
    )

    setText(
      muted,
    )

    pdf.text(
      `Currency: ${currency}`,
      pageWidth -
        margin,
      y,
      {
        align:
          'right',
      },
    )

    setDraw(
      border,
    )

    pdf.setLineWidth(
      0.3,
    )

    pdf.line(
      margin,
      y + 4,
      pageWidth -
        margin,
      y + 4,
    )

    return y + 14
  }

  /*
   * =========================================
   * SECTION TITLE
   * =========================================
   */

  function sectionTitle(
    title,
    subtitle,
    y,
  ) {
    pdf.setFont(
      'helvetica',
      'bold',
    )

    pdf.setFontSize(
      12,
    )

    setText(
      text,
    )

    pdf.text(
      title,
      margin,
      y,
    )

    y += 5

    if (subtitle) {
      pdf.setFont(
        'helvetica',
        'normal',
      )

      pdf.setFontSize(
        7.5,
      )

      setText(
        muted,
      )

      pdf.text(
        subtitle,
        margin,
        y,
      )

      y += 4
    }

    return y + 5
  }

  /*
   * =========================================
   * CARD
   * =========================================
   */

  function card({
    x,
    y,
    width,
    height,
    label,
    value,
    color,
    bg,
  }) {
    setFill(
      bg || white,
    )

    setDraw(
      border,
    )

    pdf.roundedRect(
      x,
      y,
      width,
      height,
      3,
      3,
      'FD',
    )

    setFill(
      color,
    )

    pdf.roundedRect(
      x + 5,
      y + 6,
      2,
      height - 12,
      1,
      1,
      'F',
    )

    pdf.setFont(
      'helvetica',
      'normal',
    )

    pdf.setFontSize(
      7,
    )

    setText(
      muted,
    )

    pdf.text(
      label,
      x + 11,
      y + 10,
    )

    pdf.setFont(
      'helvetica',
      'bold',
    )

    pdf.setFontSize(
      12,
    )

    setText(
      color,
    )

    let display =
      String(value)

    if (
      display.length >
      22
    ) {
      display =
        display.substring(
          0,
          22,
        ) + '...'
    }

    pdf.text(
      display,
      x + 11,
      y + 22,
    )
  }

  /*
   * =========================================
   * BOX
   * =========================================
   */

  function box(
    x,
    y,
    width,
    height,
  ) {
    setFill(
      white,
    )

    setDraw(
      border,
    )

    pdf.roundedRect(
      x,
      y,
      width,
      height,
      4,
      4,
      'FD',
    )
  }

  /*
   * =========================================
   * DAILY CHART
   * =========================================
   */

  function dailyChart(
    x,
    y,
    width,
    height,
  ) {
    box(
      x,
      y,
      width,
      height,
    )

    if (
      !dailyExpenses ||
      dailyExpenses.length ===
        0
    ) {
      pdf.setFont(
        'helvetica',
        'normal',
      )

      pdf.setFontSize(
        8,
      )

      setText(
        muted,
      )

      pdf.text(
        'No spending data available.',
        x +
          width / 2,
        y +
          height / 2,
        {
          align:
            'center',
        },
      )

      return
    }

    const values =
      dailyExpenses.map(
        (item) =>
          Number(
            item.amount ||
              0,
          ),
      )

    const maxValue =
      Math.max(
        ...values,
        1,
      )

    const left =
      x + 22

    const right =
      x +
      width -
      8

    const top =
      y + 10

    const bottom =
      y +
      height -
      15

    const chartWidth =
      right -
      left

    const chartHeight =
      bottom -
      top

    for (
      let i = 0;
      i <= 4;
      i += 1
    ) {
      const gridY =
        top +
        (chartHeight /
          4) *
          i

      setDraw(
        grid,
      )

      pdf.setLineWidth(
        0.25,
      )

      pdf.line(
        left,
        gridY,
        right,
        gridY,
      )

      const value =
        maxValue -
        (maxValue /
          4) *
          i

      pdf.setFontSize(
        5.5,
      )

      setText(
        muted,
      )

      pdf.text(
        money(value),
        x + 3,
        gridY + 2,
      )
    }

    const points =
      dailyExpenses.map(
        (
          item,
          index,
        ) => {
          const value =
            Number(
              item.amount ||
                0,
            )

          const pointX =
            dailyExpenses.length ===
            1
              ? left +
                chartWidth /
                  2
              : left +
                (chartWidth /
                  (dailyExpenses.length -
                    1)) *
                  index

          const pointY =
            bottom -
            (value /
              maxValue) *
              chartHeight

          return {
            x: pointX,
            y: pointY,
            value,
            date:
              item.date,
          }
        },
      )

    setDraw(
      purple,
    )

    pdf.setLineWidth(
      1.1,
    )

    for (
      let i = 1;
      i < points.length;
      i += 1
    ) {
      pdf.line(
        points[i - 1].x,
        points[i - 1].y,
        points[i].x,
        points[i].y,
      )
    }

    points.forEach(
      (point) => {
        setFill(
          purple,
        )

        pdf.circle(
          point.x,
          point.y,
          1.5,
          'F',
        )
      },
    )

    const indexes =
      points.length <= 4
        ? points.map(
            (_, index) =>
              index,
          )
        : [
            0,
            Math.floor(
              (points.length -
                1) /
                2,
            ),
            points.length -
              1,
          ]

    indexes.forEach(
      (index) => {
        const point =
          points[index]

        pdf.setFontSize(
          5.5,
        )

        setText(
          muted,
        )

        pdf.text(
          shortDate(
            point.date,
          ),
          point.x,
          y +
            height -
            5,
          {
            align:
              'center',
          },
        )
      },
    )
  }

  /*
   * =========================================
   * CATEGORY CHART
   * =========================================
   */

  function categoryChart(
    x,
    y,
    width,
    height,
  ) {
    box(
      x,
      y,
      width,
      height,
    )

    if (
      !categoryTotals ||
      categoryTotals.length ===
        0
    ) {
      pdf.setFontSize(
        8,
      )

      setText(
        muted,
      )

      pdf.text(
        'No category data available.',
        x +
          width / 2,
        y +
          height / 2,
        {
          align:
            'center',
        },
      )

      return
    }

    const maxAmount =
      Math.max(
        ...categoryTotals.map(
          (item) =>
            Number(
              item.amount ||
                0,
            ),
        ),
        1,
      )

    categoryTotals.forEach(
      (
        item,
        index,
      ) => {
        const amount =
          Number(
            item.amount ||
              0,
          )

        const rowY =
          y +
          8 +
          index *
            13

        pdf.setFont(
          'helvetica',
          'normal',
        )

        pdf.setFontSize(
          7,
        )

        setText(
          text,
        )

        pdf.text(
          item.category ||
            'Other',
          x + 6,
          rowY + 4,
        )

        const barX =
          x + 42

        const barWidth =
          width -
          82

        setFill([
          242,
          242,
          244,
        ])

        pdf.roundedRect(
          barX,
          rowY,
          barWidth,
          6,
          3,
          3,
          'F',
        )

        const fillWidth =
          barWidth *
          (amount /
            maxAmount)

        setFill(
          purple,
        )

        if (
          amount > 0
        ) {
          pdf.roundedRect(
            barX,
            rowY,
            Math.max(
              fillWidth,
              2,
            ),
            6,
            3,
            3,
            'F',
          )
        }

        pdf.setFont(
          'helvetica',
          'bold',
        )

        pdf.setFontSize(
          6.5,
        )

        setText(
          text,
        )

        pdf.text(
          money(
            amount,
          ),
          x +
            width -
            6,
          rowY + 4,
          {
            align:
              'right',
          },
        )
      },
    )
  }

  /*
   * =========================================
   * MONEY FLOW
   * =========================================
   */

  function moneyFlowChart(
    x,
    y,
    width,
    height,
  ) {
    box(
      x,
      y,
      width,
      height,
    )

    const credits =
      Number(
        totalCredits || 0,
      )

    const spent =
      Number(
        totalSpent || 0,
      )

    const maxValue =
      Math.max(
        credits,
        spent,
        1,
      )

    const rows = [
      {
        label:
          'Money received',
        amount:
          credits,
        color:
          green,
      },

      {
        label:
          'Money spent',
        amount:
          spent,
        color:
          red,
      },
    ]

    rows.forEach(
      (
        row,
        index,
      ) => {
        const rowY =
          y +
          14 +
          index *
            25

        pdf.setFontSize(
          7,
        )

        setText(
          text,
        )

        pdf.text(
          row.label,
          x + 7,
          rowY + 4,
        )

        const barX =
          x + 52

        const barWidth =
          width -
          82

        setFill([
          242,
          242,
          244,
        ])

        pdf.roundedRect(
          barX,
          rowY,
          barWidth,
          7,
          3,
          3,
          'F',
        )

        const fillWidth =
          barWidth *
          (row.amount /
            maxValue)

        if (
          row.amount > 0
        ) {
          setFill(
            row.color,
          )

          pdf.roundedRect(
            barX,
            rowY,
            Math.max(
              fillWidth,
              2,
            ),
            7,
            3,
            3,
            'F',
          )
        }

        pdf.setFont(
          'helvetica',
          'bold',
        )

        pdf.setFontSize(
          7,
        )

        setText(
          row.color,
        )

        pdf.text(
          `+${money(
            Math.abs(
              row.amount,
            ),
          )}`,
          x +
            width -
            7,
          rowY + 5,
          {
            align:
              'right',
          },
        )
      },
    )
  }

  /*
   * =========================================
   * INSIGHT BOX
   * =========================================
   */

  function insightBox(
    x,
    y,
    width,
    message,
  ) {
    const lines =
      pdf.splitTextToSize(
        String(message),
        width - 25,
      )

    const height =
      Math.max(
        18,
        lines.length *
          4.5 +
          10,
      )

    setFill(
      white,
    )

    setDraw(
      border,
    )

    pdf.roundedRect(
      x,
      y,
      width,
      height,
      3,
      3,
      'FD',
    )

    setFill(
      purple,
    )

    pdf.circle(
      x + 8,
      y + 9,
      1.6,
      'F',
    )

    pdf.setFont(
      'helvetica',
      'normal',
    )

    pdf.setFontSize(
      7.5,
    )

    setText(
      text,
    )

    pdf.text(
      lines,
      x + 14,
      y + 9,
      {
        lineHeightFactor:
          1.3,
      },
    )

    return height
  }

  /*
   * =========================================
   * PAGE 1
   * =========================================
   */

  drawBackground()

  let y =
    header(
      'Financial Overview',
      'A complete summary of your income, spending and budget.',
    )

  const gap = 4

  const cardWidth =
    (contentWidth -
      gap * 3) /
    4

  card({
    x: margin,
    y,
    width:
      cardWidth,
    height: 32,
    label:
      'Total spent',
    value: `-${money(
      totalSpent,
    )}`,
    color:
      red,
    bg:
      redLight,
  })

  card({
    x:
      margin +
      cardWidth +
      gap,
    y,
    width:
      cardWidth,
    height: 32,
    label:
      'Money received',
    value: `+${money(
      totalCredits,
    )}`,
    color:
      green,
    bg:
      greenLight,
  })

  card({
    x:
      margin +
      (cardWidth +
        gap) *
        2,
    y,
    width:
      cardWidth,
    height: 32,
    label:
      'Monthly budget',
    value:
      money(
        monthlyBudget,
      ),
    color:
      purple,
    bg:
      purpleLight,
  })

  card({
    x:
      margin +
      (cardWidth +
        gap) *
        3,
    y,
    width:
      cardWidth,
    height: 32,
    label:
      'Daily average',
    value:
      money(
        Math.round(
          averageDailySpending,
        ),
      ),
    color:
      dark,
    bg:
      white,
  })

  y += 41

  y =
    sectionTitle(
      'Budget progress',
      'How much of your monthly budget has been used.',
      y,
    )

  const budgetUsed =
    monthlyBudget > 0
      ? (totalSpent /
          monthlyBudget) *
        100
      : 0

  const progress =
    Math.min(
      Math.max(
        budgetUsed,
        0,
      ),
      100,
    )

  setFill(
    grid,
  )

  pdf.roundedRect(
    margin,
    y,
    contentWidth,
    6,
    3,
    3,
    'F',
  )

  if (
    progress > 0
  ) {
    setFill(
      purple,
    )

    pdf.roundedRect(
      margin,
      y,
      contentWidth *
        (progress /
          100),
      6,
      3,
      3,
      'F',
    )
  }

  y += 11

  pdf.setFontSize(
    7.5,
  )

  setText(
    muted,
  )

  pdf.text(
    `${budgetUsed.toFixed(
      1,
    )}% used`,
    margin,
    y,
  )

  const remaining =
    Math.max(
      Number(
        monthlyBudget ||
          0,
      ) -
        Number(
          totalSpent ||
            0,
        ),
      0,
    )

  pdf.text(
    `${money(
      remaining,
    )} remaining`,
    pageWidth -
      margin,
    y,
    {
      align:
        'right',
    },
  )

  y += 14

  y =
    sectionTitle(
      'Daily spending',
      'Your spending activity throughout the selected month.',
      y,
    )

  dailyChart(
    margin,
    y,
    contentWidth,
    78,
  )

  footer(
    1,
  )

  /*
   * =========================================
   * PAGE 2
   * =========================================
   */

  pdf.addPage()

  drawBackground()

  y =
    header(
      'Spending Analysis',
      'Where your money is going this month.',
    )

  y =
    sectionTitle(
      'Spending by category',
      'Categories ranked by spending.',
      y,
    )

  const categoryHeight =
    Math.max(
      70,
      categoryTotals.length *
        13 +
        15,
    )

  categoryChart(
    margin,
    y,
    contentWidth,
    categoryHeight,
  )

  y +=
    categoryHeight +
    10

  const half =
    (contentWidth -
      gap) /
    2

  card({
    x: margin,
    y,
    width: half,
    height: 34,
    label:
      'Top spending category',
    value:
      topCategory
        ? `${topCategory.category} - ${money(
            topCategory.amount,
          )}`
        : 'No data',
    color:
      purple,
    bg:
      purpleLight,
  })

  card({
    x:
      margin +
      half +
      gap,
    y,
    width: half,
    height: 34,
    label:
      'Highest spending day',
    value:
      highestSpendingDay
        ? money(
            highestSpendingDay.amount,
          )
        : 'No data',
    color:
      red,
    bg:
      redLight,
  })

  y += 45

  if (
    highestSpendingDay
  ) {
    pdf.setFontSize(
      7.5,
    )

    setText(
      muted,
    )

    pdf.text(
      `Highest spending occurred on ${formatDate(
        highestSpendingDay.date,
      )}.`,
      margin,
      y,
    )

    y += 10
  }

  y =
    sectionTitle(
      'Money flow',
      'Money received versus money spent.',
      y,
    )

  moneyFlowChart(
    margin,
    y,
    contentWidth,
    68,
  )

  y += 78

  footer(
    2,
  )

  /*
   * =========================================
   * PAGE 3
   * =========================================
   */

  pdf.addPage()

  drawBackground()

  y =
    header(
      'Financial Insights',
      'Personalized observations from your transactions.',
    )

  y =
    sectionTitle(
      'Performance summary',
      'Important signals from your monthly activity.',
      y,
    )

  const changeText =
    spendingChange ===
        null ||
    spendingChange ===
      undefined
      ? 'No previous data'
      : `${
          spendingChange >
          0
            ? '+'
            : ''
        }${Number(
          spendingChange,
        ).toFixed(
          1,
        )}%`

  const changeColor =
    spendingChange ===
        null ||
    spendingChange ===
      undefined
      ? dark
      : spendingChange >
          0
        ? red
        : green

  const changeBg =
    spendingChange ===
        null ||
    spendingChange ===
      undefined
      ? white
      : spendingChange >
          0
        ? redLight
        : greenLight

  card({
    x: margin,
    y,
    width: half,
    height: 34,
    label:
      'Month-over-month spending',
    value:
      changeText,
    color:
      changeColor,
    bg:
      changeBg,
  })

  card({
    x:
      margin +
      half +
      gap,
    y,
    width: half,
    height: 34,
    label:
      'Budget utilization',
    value: `${budgetUsed.toFixed(
      1,
    )}%`,
    color:
      purple,
    bg:
      purpleLight,
  })

  y += 45

  y =
    sectionTitle(
      'BudgetWise insights',
      'What your spending data tells you.',
      y,
    )

  const cleanInsights =
    Array.isArray(
      insights,
    )
      ? insights.slice(
          0,
          5,
        )
      : []

  if (
    cleanInsights.length ===
    0
  ) {
    insightBox(
      margin,
      y,
      contentWidth,
      'No additional insights are available yet. Continue recording expenses to build a useful spending history.',
    )
  } else {
    cleanInsights.forEach(
      (item) => {
        const height =
          insightBox(
            margin,
            y,
            contentWidth,
            item,
          )

        y +=
          height + 5
      },
    )
  }

  y += 6

  let recommendation =
    'Continue recording your expenses to build a clearer picture of your spending habits.'

  if (
    monthlyBudget > 0 &&
    totalSpent >
      monthlyBudget
  ) {
    recommendation =
      'Your spending is above your monthly budget. Review your largest categories and reduce unnecessary spending.'
  } else if (
    monthlyBudget > 0 &&
    totalSpent /
        monthlyBudget >=
      0.8
  ) {
    recommendation =
      'You are approaching your monthly budget. Keep an eye on discretionary spending for the rest of the month.'
  } else if (
    spendingChange !==
        null &&
    spendingChange !==
        undefined &&
    spendingChange < 0
  ) {
    recommendation =
      'Your spending is lower than the previous month. Keep the same discipline and continue tracking your expenses.'
  } else if (
    topCategory
  ) {
    recommendation =
      `${topCategory.category} is your largest spending category. Reviewing this category could have the biggest impact on your monthly spending.`
  }

  const recommendationLines =
    pdf.splitTextToSize(
      recommendation,
      contentWidth - 16,
    )

  const recommendationHeight =
    recommendationLines.length *
      4.5 +
    20

  if (
    y +
      recommendationHeight <
    pageHeight - 20
  ) {
    setFill(
      purpleLight,
    )

    pdf.roundedRect(
      margin,
      y,
      contentWidth,
      recommendationHeight,
      4,
      4,
      'F',
    )

    pdf.setFont(
      'helvetica',
      'bold',
    )

    pdf.setFontSize(
      8.5,
    )

    setText([
      91,
      33,
      182,
    ])

    pdf.text(
      'Spending recommendation',
      margin + 8,
      y + 8,
    )

    pdf.setFont(
      'helvetica',
      'normal',
    )

    pdf.setFontSize(
      7,
    )

    setText(
      text,
    )

    pdf.text(
      recommendationLines,
      margin + 8,
      y + 15,
      {
        lineHeightFactor:
          1.3,
      },
    )
  }

  footer(
    3,
  )

  /*
   * =========================================
   * SAVE
   * =========================================
   */

  const safeMonth =
    String(
      monthLabel,
    )
      .replace(
        /\s+/g,
        '-',
      )
      .replace(
        /,/g,
        '',
      )

  pdf.save(
    `BudgetWise-${safeMonth}-${currency}-Report.pdf`,
  )
}