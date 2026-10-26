"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DownloadIcon, Loader2Icon } from "lucide-react"
import { computeAggregate, gradeFor } from "@/lib/grading" // 👈 Import the logic

export function BroadSheetUI({ 
  mock, 
  publishedMocks,
  subjects,
  students,
  scores
}: { 
  mock: any
  publishedMocks: any[]
  subjects: { id: string, name: string, code: string }[]
  students: { id: string, index_number: string, first_name: string, last_name: string }[]
  scores: { student_id: string, subject_id: string, score: string, grade: string }[]
}) {
  const [downloading, setDownloading] = useState(false)

  // Helper to quickly find a score and grade
  const getScoreData = (studentId: string, subjectId: string) => {
    return scores.find(s => s.student_id === studentId && s.subject_id === subjectId)
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const html2canvas = (await import("html2canvas-pro")).default
      const { jsPDF } = await import("jspdf")

      const element = document.getElementById("broad-sheet-print")
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("l", "mm", "a4") // Landscape
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      const imgHeight = (canvas.height * pageWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0
      
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${mock.name}_Broad_Sheet.pdf`)
    } catch (error) {
      console.error("Failed to download PDF", error)
      alert("There was an error downloading the PDF.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Broad Sheet</h1>
          <p className="text-sm text-muted-foreground">Class summary for {mock.name} ({mock.term})</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {publishedMocks.map(m => (
              <Button
                key={m.id}
                size="sm"
                variant={m.id === mock.id ? "default" : "outline"}
                nativeButton={false}
                render={<Link href={`/dashboard/broad-sheet?mock=${m.id}`} />}
              >
                {m.name}
              </Button>
            ))}
          </div>
          
          <Button onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <DownloadIcon className="mr-2 h-4 w-4" />}
            {downloading ? "Downloading..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* The Printable Sheet */}
      <div 
        id="broad-sheet-print" 
        className="bg-white text-black p-6 shadow-md border rounded-sm overflow-x-auto print:shadow-none print:border-none print:p-0"
      >
        <div className="min-w-[1000px]">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#0d1b3e]">Kenlord Educational Institute</h2>
            <p className="text-sm font-semibold">{mock.name} - {mock.term}, {mock.academic_year}</p>
          </div>

          {/* The Grid */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-y border-black bg-gray-50">
                <th className="py-2 px-2 border-r border-gray-300 w-8 text-center">#</th>
                <th className="py-2 px-2 border-r border-gray-300">Index</th>
                <th className="py-2 px-2 border-r border-gray-300 min-w-[150px]">Student Name</th>
                {subjects.map(sub => (
                  <th key={sub.id} className="py-2 px-1 border-r border-gray-300 text-center font-bold" title={sub.name}>
                    {sub.code}
                  </th>
                ))}
                <th className="py-2 px-2 border-r border-gray-300 text-center font-bold bg-blue-50">Best 6 Score</th>
                <th className="py-2 px-2 text-center font-bold bg-blue-50">Agg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((st, i) => {
                // 1. Map this student's scores to the format expected by computeAggregate
                const studentSubjectScores = subjects.map(sub => {
                  const data = getScoreData(st.id, sub.id)
                  return {
                    subject_code: sub.code,
                    score: data ? Number(data.score) : null
                  }
                })

                // 2. Use the same logic as the result slip!
                const aggregateData = computeAggregate(studentSubjectScores)

                // 3. Calculate Best 6 Total Score
                const bestSixCodes = aggregateData.bestSix.map(b => b.subject_code)
                const bestSixScores = studentSubjectScores.filter(s => bestSixCodes.includes(s.subject_code))
                const totalBestSixScore = bestSixScores.reduce((acc, curr) => acc + Number(curr.score || 0), 0)

                return (
                  <tr key={st.id} className="hover:bg-gray-50">
                    <td className="py-1.5 px-2 text-center border-r border-gray-300 text-gray-500">{i + 1}</td>
                    <td className="py-1.5 px-2 border-r border-gray-300">{st.index_number}</td>
                    <td className="py-1.5 px-2 border-r border-gray-300 font-medium uppercase">{st.last_name} {st.first_name}</td>
                    
                    {subjects.map(sub => {
                      const data = getScoreData(st.id, sub.id)
                      return (
                        <td key={sub.id} className="py-1.5 px-1 text-center border-r border-gray-300">
                          {data ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-semibold">{Number(data.score)}</span>
                              <span className="text-[10px] text-gray-500 font-bold">
                                ({data.grade})
                              </span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                      )
                    })}
                    
                    {/* 👇 The same calculations as the Result Slip 👇 */}
                    <td className="py-1.5 px-2 text-center font-bold border-r border-gray-300 bg-blue-50/30 text-blue-900">
                      {totalBestSixScore}
                    </td>
                    <td className="py-1.5 px-2 text-center font-black bg-blue-50/30 text-blue-900 text-sm">
                      {aggregateData.aggregate}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          <div className="mt-8 text-xs text-gray-500 flex justify-between">
            <p>Generated on: {new Date().toLocaleDateString()}</p>
            <p>Kenlord Educational Institute - Destora Portal</p>
          </div>
        </div>
      </div>

    </div>
  )
}