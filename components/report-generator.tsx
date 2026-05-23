"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { FileDown } from "lucide-react"
import type { TeamWithPrediction, Recommendation } from "@/lib/types"

interface ReportGeneratorProps {
  teams: TeamWithPrediction[]
  recommendations: Recommendation[]
}

export function ReportGenerator({ teams, recommendations }: ReportGeneratorProps) {
  const generatePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Título
    doc.setFontSize(20)
    doc.setTextColor(30, 58, 138) // Azul oscuro
    doc.text("Reporte de Recomendaciones", pageWidth / 2, 20, { align: "center" })
    
    // Subtítulo
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text("Mundial 2026 - Gestión de Stock de Camisetas", pageWidth / 2, 28, { align: "center" })
    
    // Fecha
    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}`, pageWidth / 2, 35, { align: "center" })

    // Resumen ejecutivo
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text("Resumen Ejecutivo", 14, 50)
    
    const increaseCount = recommendations.filter(r => r.action === "increase_stock").length
    const promotionCount = recommendations.filter(r => r.action === "promotion").length
    const maintainCount = recommendations.filter(r => r.action === "maintain").length
    
    doc.setFontSize(10)
    doc.setTextColor(60)
    const summaryY = 58
    doc.text(`Total de selecciones analizadas: ${teams.length}`, 14, summaryY)
    doc.text(`Recomendaciones de aumento de stock: ${increaseCount}`, 14, summaryY + 6)
    doc.text(`Recomendaciones de promoción: ${promotionCount}`, 14, summaryY + 12)
    doc.text(`Mantener stock actual: ${maintainCount}`, 14, summaryY + 18)

    // Tabla de recomendaciones
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text("Detalle de Recomendaciones", 14, 90)

    const tableData = teams.map(team => {
      const rec = recommendations.find(r => r.team_id === team.id)
      const action = rec?.action === "increase_stock" 
        ? "Aumentar Stock" 
        : rec?.action === "promotion" 
          ? "Promoción" 
          : "Mantener"
      
      return [
        team.name,
        team.code,
        `${((team.prediction?.probability_quarterfinals ?? 0) * 100).toFixed(0)}%`,
        `${((team.prediction?.probability_champion ?? 0) * 100).toFixed(0)}%`,
        team.inventory?.current_stock?.toString() ?? "0",
        action,
        rec?.priority === 3 ? "Alta" : rec?.priority === 2 ? "Media" : "Baja"
      ]
    }).sort((a, b) => {
      const priorityOrder = { "Alta": 0, "Media": 1, "Baja": 2 }
      return (priorityOrder[a[6] as keyof typeof priorityOrder] ?? 2) - 
             (priorityOrder[b[6] as keyof typeof priorityOrder] ?? 2)
    })

    autoTable(doc, {
      startY: 95,
      head: [["Selección", "Código", "Prob. Cuartos", "Prob. Campeón", "Stock", "Acción", "Prioridad"]],
      body: tableData,
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 25, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 30 },
        6: { cellWidth: 25, halign: "center" },
      },
      didParseCell: (data) => {
        // Colorear celdas de acción
        if (data.section === "body" && data.column.index === 5) {
          const text = data.cell.raw as string
          if (text === "Aumentar Stock") {
            data.cell.styles.textColor = [22, 163, 74] // Verde
            data.cell.styles.fontStyle = "bold"
          } else if (text === "Promoción") {
            data.cell.styles.textColor = [220, 38, 38] // Rojo
            data.cell.styles.fontStyle = "bold"
          }
        }
        // Colorear prioridad
        if (data.section === "body" && data.column.index === 6) {
          const text = data.cell.raw as string
          if (text === "Alta") {
            data.cell.styles.textColor = [220, 38, 38]
          } else if (text === "Media") {
            data.cell.styles.textColor = [234, 88, 12]
          }
        }
      },
    })

    // Pie de página
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Página ${i} de ${pageCount} - Mundial 2026 Stock Manager`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      )
    }

    // Descargar
    doc.save(`reporte-recomendaciones-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      <FileDown className="h-4 w-4" />
      Exportar PDF
    </button>
  )
}
