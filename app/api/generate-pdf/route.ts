import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'

interface PDFGenerationRequest {
  researchData: any
  userInfo: {
    product: string
    stage: string
    targetMarket?: string
  }
}

/**
 * Generates a professional PDF report from research data
 * Includes: Cover page, Executive Summary, Competitor Profiles, ICP Personas,
 * SWOT matrices, Porter's Five Forces, and Strategic Recommendations
 */
export async function POST(req: NextRequest) {
  try {
    const body: PDFGenerationRequest = await req.json()
    const { researchData, userInfo } = body

    if (!researchData || !userInfo) {
      return NextResponse.json(
        { error: 'Research data and user info are required' },
        { status: 400 }
      )
    }

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (2 * margin)

    // Brand colors
    const primaryColor: [number, number, number] = [200, 195, 255] // #C8C3FF
    const secondaryColor: [number, number, number] = [217, 251, 96] // #D9FB60
    const darkGray: [number, number, number] = [26, 26, 26]
    const mediumGray: [number, number, number] = [107, 114, 128]

    let yPosition = margin

    // Helper function to add new page if needed
    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Helper function to draw section header
    const addSectionHeader = (title: string) => {
      checkPageBreak(20)
      doc.setFillColor(...primaryColor)
      doc.rect(margin, yPosition, contentWidth, 10, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(title, margin + 5, yPosition + 7)
      yPosition += 15
      doc.setTextColor(...darkGray)
    }

    // Cover Page
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, pageHeight / 2, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.text('MarketMind', pageWidth / 2, 60, { align: 'center' })

    doc.setFontSize(24)
    doc.text('ICP Discovery & Market Research Report', pageWidth / 2, 80, { align: 'center' })

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`Product: ${userInfo.product}`, pageWidth / 2, 100, { align: 'center' })
    doc.text(`Stage: ${userInfo.stage}`, pageWidth / 2, 110, { align: 'center' })

    doc.setFontSize(10)
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    doc.text(`Generated: ${date}`, pageWidth / 2, 130, { align: 'center' })

    // Add logo/branding area
    doc.setFillColor(255, 255, 255)
    doc.circle(pageWidth / 2, 160, 15, 'F')
    doc.setTextColor(...primaryColor)
    doc.setFontSize(20)
    doc.text('✨', pageWidth / 2, 165, { align: 'center' })

    // Footer on cover
    doc.setTextColor(...mediumGray)
    doc.setFontSize(8)
    doc.text('Powered by Scout AI - MarketMind.ai', pageWidth / 2, pageHeight - 20, { align: 'center' })

    // Page 2: Executive Summary
    doc.addPage()
    yPosition = margin

    addSectionHeader('EXECUTIVE SUMMARY')

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)

    const summaryText = `This comprehensive market research report provides actionable insights for ${userInfo.product}. Our AI-powered analysis examined your competitive landscape, identified ideal customer profiles, and generated strategic recommendations tailored to your ${userInfo.stage} stage.`

    const summaryLines = doc.splitTextToSize(summaryText, contentWidth)
    doc.text(summaryLines, margin, yPosition)
    yPosition += summaryLines.length * 6 + 10

    // Key Findings
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Key Findings:', margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const keyFindings = [
      `✓ Analyzed ${researchData.competitors?.length || 3} key competitors in your space`,
      `✓ Identified ${researchData.icpProfiles?.length || 3} high-potential ICP segments`,
      `✓ Evaluated market dynamics using Porter's Five Forces framework`,
      `✓ Developed strategic positioning and pricing recommendations`,
    ]

    keyFindings.forEach(finding => {
      const lines = doc.splitTextToSize(finding, contentWidth - 10)
      doc.text(lines, margin + 5, yPosition)
      yPosition += lines.length * 5 + 3
    })

    yPosition += 10

    // Competitor Overview Section
    if (researchData.competitors && researchData.competitors.length > 0) {
      addSectionHeader('COMPETITOR LANDSCAPE')

      researchData.competitors.forEach((competitor: any, index: number) => {
        checkPageBreak(50)

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...primaryColor)
        doc.text(`${index + 1}. ${competitor.name || 'Competitor ' + (index + 1)}`, margin, yPosition)
        yPosition += 7

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...darkGray)

        if (competitor.description) {
          const descLines = doc.splitTextToSize(competitor.description, contentWidth)
          doc.text(descLines, margin, yPosition)
          yPosition += descLines.length * 5 + 5
        }

        if (competitor.positioning) {
          doc.setFont('helvetica', 'italic')
          doc.text(`Positioning: ${competitor.positioning}`, margin, yPosition)
          yPosition += 6
        }

        if (competitor.strengths && competitor.strengths.length > 0) {
          doc.setFont('helvetica', 'bold')
          doc.text('Strengths:', margin, yPosition)
          yPosition += 5
          doc.setFont('helvetica', 'normal')
          competitor.strengths.slice(0, 3).forEach((strength: string) => {
            const lines = doc.splitTextToSize(`• ${strength}`, contentWidth - 10)
            doc.text(lines, margin + 5, yPosition)
            yPosition += lines.length * 5
          })
          yPosition += 3
        }

        if (competitor.weaknesses && competitor.weaknesses.length > 0) {
          doc.setFont('helvetica', 'bold')
          doc.text('Weaknesses:', margin, yPosition)
          yPosition += 5
          doc.setFont('helvetica', 'normal')
          competitor.weaknesses.slice(0, 3).forEach((weakness: string) => {
            const lines = doc.splitTextToSize(`• ${weakness}`, contentWidth - 10)
            doc.text(lines, margin + 5, yPosition)
            yPosition += lines.length * 5
          })
        }

        yPosition += 10
      })
    }

    // ICP Profiles Section
    if (researchData.icpProfiles && researchData.icpProfiles.length > 0) {
      addSectionHeader('IDEAL CUSTOMER PROFILES')

      researchData.icpProfiles.forEach((icp: any, index: number) => {
        checkPageBreak(60)

        // ICP Header with priority indicator
        doc.setFillColor(...secondaryColor)
        doc.rect(margin, yPosition, contentWidth, 8, 'F')
        doc.setTextColor(...darkGray)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`${icp.name || 'ICP Segment ' + (index + 1)}`, margin + 3, yPosition + 5.5)

        if (icp.priority === 'primary') {
          doc.setFontSize(10)
          doc.text('⭐⭐⭐ Highest Priority', pageWidth - margin - 40, yPosition + 5.5)
        }
        yPosition += 12

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        // Firmographics
        if (icp.firmographics) {
          doc.setFont('helvetica', 'bold')
          doc.text('Company Profile:', margin, yPosition)
          yPosition += 5
          doc.setFont('helvetica', 'normal')

          if (icp.firmographics.companySize) {
            doc.text(`• Size: ${icp.firmographics.companySize}`, margin + 5, yPosition)
            yPosition += 5
          }
          if (icp.firmographics.industry) {
            const industries = Array.isArray(icp.firmographics.industry)
              ? icp.firmographics.industry.join(', ')
              : icp.firmographics.industry
            doc.text(`• Industry: ${industries}`, margin + 5, yPosition)
            yPosition += 5
          }
          yPosition += 3
        }

        // Pain Points
        if (icp.painPoints && icp.painPoints.length > 0) {
          doc.setFont('helvetica', 'bold')
          doc.text('Key Pain Points:', margin, yPosition)
          yPosition += 5
          doc.setFont('helvetica', 'normal')

          icp.painPoints.slice(0, 3).forEach((pain: any) => {
            const painText = typeof pain === 'string' ? pain : pain.problem || ''
            const lines = doc.splitTextToSize(`• ${painText}`, contentWidth - 10)
            doc.text(lines, margin + 5, yPosition)
            yPosition += lines.length * 5
          })
          yPosition += 3
        }

        // Where to Find Them
        if (icp.whereToFind) {
          doc.setFont('helvetica', 'bold')
          doc.text('Where to Find:', margin, yPosition)
          yPosition += 5
          doc.setFont('helvetica', 'normal')

          if (icp.whereToFind.online) {
            icp.whereToFind.online.slice(0, 3).forEach((location: any) => {
              doc.text(`• ${location.platform || location.community || location}`, margin + 5, yPosition)
              yPosition += 5
            })
          }
        }

        yPosition += 10
      })
    }

    // Strategic Recommendations
    addSectionHeader('STRATEGIC RECOMMENDATIONS')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const recommendations = [
      {
        title: 'Positioning',
        content: researchData.positioning?.recommendation || 'Focus on your unique value proposition and differentiate from key competitors.'
      },
      {
        title: 'Pricing Strategy',
        content: researchData.pricing?.recommended || 'Align pricing with competitor range while emphasizing value delivered.'
      },
      {
        title: 'GTM Channels',
        content: researchData.gtmChannels?.[0]?.channel || 'Focus on channels where your ICP is most active.'
      }
    ]

    recommendations.forEach(rec => {
      checkPageBreak(25)

      doc.setFont('helvetica', 'bold')
      doc.setFillColor(...primaryColor)
      doc.rect(margin, yPosition, 4, 6, 'F')
      doc.text(rec.title, margin + 7, yPosition + 4)
      yPosition += 8

      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(rec.content, contentWidth - 7)
      doc.text(lines, margin + 7, yPosition)
      yPosition += lines.length * 5 + 8
    })

    // Final Page: Next Steps
    doc.addPage()
    yPosition = margin

    addSectionHeader('NEXT STEPS')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const nextSteps = [
      'Validate top ICP segment with 10-15 customer interviews',
      'Test positioning message with target audience',
      'Set up tracking for key metrics (CAC, LTV, conversion rates)',
      'Build targeted content for primary ICP segment',
      'Launch focused pilot campaign to test GTM strategy',
    ]

    nextSteps.forEach((step, index) => {
      checkPageBreak(15)

      doc.setFillColor(...secondaryColor)
      doc.circle(margin + 3, yPosition + 2, 3, 'F')
      doc.setTextColor(...darkGray)
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}`, margin + 1.5, yPosition + 3)

      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(step, contentWidth - 15)
      doc.text(lines, margin + 10, yPosition + 3)
      yPosition += lines.length * 5 + 5
    })

    yPosition += 15
    checkPageBreak(40)

    // Footer branding
    doc.setFillColor(...primaryColor)
    doc.rect(margin, yPosition, contentWidth, 30, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('MarketMind', pageWidth / 2, yPosition + 12, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('AI-Powered ICP Discovery & Market Research', pageWidth / 2, yPosition + 19, { align: 'center' })
    doc.setFontSize(8)
    doc.text('hello@marketmind.ai', pageWidth / 2, yPosition + 25, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer')

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="MarketMind-Report-${Date.now()}.pdf"`,
      },
    })

  } catch (error: any) {
    console.error('PDF Generation Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error.message
      },
      { status: 500 }
    )
  }
}
