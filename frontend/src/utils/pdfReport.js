import jsPDF from 'jspdf'

export function generateMonthlyReport({
  monthLabel,
  totalSpent,
  averageDailySpending,
  topCategory,
  highestSpendingDay,
  spendingChange,
  categoryTotals,
  insights,
}) {
  const pdf = new jsPDF()

  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20

  let y = 22

  // Title
  pdf.setFontSize(22)
  pdf.setFont('helvetica', 'bold')
  pdf.text('BudgetWise', margin, y)

  y += 10

  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text(
    `${monthLabel} Financial Report`,
    margin,
    y,
  )

  y += 15

  // Divider
  pdf.setDrawColor(220, 220, 220)
  pdf.line(
    margin,
    y,
    pageWidth - margin,
    y,
  )

  y += 15

  // Summary heading
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Summary', margin, y)

  y += 10

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')

  const summary = [
    [
      'Total spent',
      `INR ${formatNumber(totalSpent)}`,
    ],
    [
      'Average daily spending',
      `INR ${formatNumber(
        Math.round(
          averageDailySpending,
        ),
      )}`,
    ],
    [
      'Top category',
      topCategory
        ? topCategory.category
        : 'No data',
    ],
    [
      'Highest spending day',
      highestSpendingDay
        ? `INR ${formatNumber(
            highestSpendingDay.amount,
          )} - ${highestSpendingDay.date}`
        : 'No data',
    ],
    [
      'Compared with previous month',
      spendingChange === null
        ? 'No previous month data'
        : `${
            spendingChange > 0
              ? '+'
              : ''
          }${spendingChange.toFixed(
            1,
          )}%`,
    ],
  ]

  summary.forEach(
    ([label, value]) => {
      pdf.setFont('helvetica', 'bold')
      pdf.text(
        label,
        margin,
        y,
      )

      pdf.setFont('helvetica', 'normal')
      pdf.text(
        value,
        margin + 65,
        y,
      )

      y += 8
    },
  )

  y += 8

  // Category breakdown
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text(
    'Category Breakdown',
    margin,
    y,
  )

  y += 10

  pdf.setFontSize(11)

  if (
    !categoryTotals ||
    categoryTotals.length === 0
  ) {
    pdf.setFont('helvetica', 'normal')
    pdf.text(
      'No category data available.',
      margin,
      y,
    )

    y += 10
  } else {
    categoryTotals.forEach(
      (category) => {
        pdf.setFont(
          'helvetica',
          'normal',
        )

        pdf.text(
          category.category,
          margin,
          y,
        )

        pdf.text(
          `INR ${formatNumber(
            category.amount,
          )}`,
          margin + 100,
          y,
        )

        y += 8

        if (y > 265) {
          pdf.addPage()
          y = 22
        }
      },
    )
  }

  y += 8

  // Insights
  if (y > 235) {
    pdf.addPage()
    y = 22
  }

  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text(
    'BudgetWise Insights',
    margin,
    y,
  )

  y += 10

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')

  if (
    !insights ||
    insights.length === 0
  ) {
    pdf.text(
      'No insights available.',
      margin,
      y,
    )
  } else {
    insights.forEach((insight) => {
      const lines =
        pdf.splitTextToSize(
          `• ${insight}`,
          pageWidth -
            margin * 2,
        )

      pdf.text(
        lines,
        margin,
        y,
      )

      y +=
        lines.length * 5 + 4

      if (y > 265) {
        pdf.addPage()
        y = 22
      }
    })
  }

  // Footer
  const pageCount =
    pdf.internal.getNumberOfPages()

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {
    pdf.setPage(page)

    pdf.setFontSize(8)
    pdf.setFont(
      'helvetica',
      'normal',
    )

    pdf.setTextColor(
      120,
      120,
      120,
    )

    pdf.text(
      `BudgetWise • Page ${page} of ${pageCount}`,
      margin,
      290,
    )
  }

  pdf.save(
    `BudgetWise-${monthLabel.replace(
      /\s+/g,
      '-',
    )}-Report.pdf`,
  )
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString(
    'en-IN',
  )
}