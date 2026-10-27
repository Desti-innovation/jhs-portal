"use client"

import { useEffect, useState } from "react"
import { DownloadIcon, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Mock } from "@/lib/mocks"

export function BECEPrintSlip({
  mock,
  data,
}: {
  mock: Mock
  data: NonNullable<Awaited<ReturnType<typeof import("@/lib/results").getStudentResult>>>
}) {
  const [downloading, setDownloading] = useState(false)
  const [generatedAt, setGeneratedAt] = useState("")

  useEffect(() => {
    const d = new Date()
    const p = (n: number) => String(n).padStart(2, "0")
    const h = d.getHours()
    const h12 = h % 12 === 0 ? 12 : h % 12
    setGeneratedAt(
      `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(h12)}:${p(d.getMinutes())}:${p(d.getSeconds())}${h >= 12 ? "pm" : "am"}`
    )
  }, [])

  const summary = computeSummary(data.scores)

  const initials = `${data.student.first_name[0]}${data.student.last_name[0]}`.toUpperCase()

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      // 👇 1. Log the download to the database (fire and forget)
      fetch("/api/log-download", {
        method: "POST",
        body: JSON.stringify({ mockId: mock.id }),
      }).catch((err) => console.error("Failed to log download", err))

      const html2canvas = (await import("html2canvas-pro")).default
      const { jsPDF } = await import("jspdf")

      const element = document.getElementById("printable-slip")
      if (!element) return

      // We temporarily remove the scale transform for the screenshot
      const originalTransform = element.style.transform
      const originalWidth = element.style.width
      element.style.transform = "none"
      element.style.width = "794px" // Standard A4 width in px

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      // Restore the transform
      element.style.transform = originalTransform
      element.style.width = originalWidth

      const imgData = canvas.toDataURL("image/png")
      
      // Create a SINGLE A4 Page PDF
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgHeight = (canvas.height * pageWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight)
      pdf.save(`${data.student.last_name}_${mock.name.replace(/\s+/g, "_")}_Result.pdf`)
    } catch (error) {
      console.error("Failed to download PDF", error)
      alert("There was an error downloading the PDF. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  const details: [string, string][] = [
    ["Index Number", data.student.index_number],
    ["Candidate Name", `${data.student.last_name} ${data.student.first_name}`.toUpperCase()],
    ["Type of Examination", `BECE Mock (${mock.term}, ${mock.academic_year})`],
    ["School / Centre", "KENLORD EDUCATIONAL INSTITUTE"],
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-4 print:max-w-none print:m-0 print:p-0">
      <div className="flex justify-end print:hidden">
        <Button onClick={handleDownloadPDF} disabled={downloading} variant="default">
          {downloading ? (
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <DownloadIcon className="mr-2 h-4 w-4" />
          )}
          {downloading ? "Downloading..." : "Download PDF"}
        </Button>
      </div>

      {/* Responsive Wrapper for Mobile View */}
      <div className="w-full overflow-x-auto pb-4 flex justify-center">
        <div className="origin-top scale-[0.45] sm:scale-100 shrink-0 w-[794px] min-h-[1123px]">
          
          <div
            id="printable-slip"
            className="relative bg-white text-[#212121] shadow-md border print:shadow-none print:border-none w-[794px] min-h-[1123px] px-12 pt-10 pb-16"
          >
            {/* LOGO WATERMARK */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <img
                src="/kenlord.png"
                alt=""
                className="w-[480px] h-[480px] object-contain opacity-[0.1]"
              />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              
              <div className="flex-1">
                {/* Banner */}
                <div
                  className="flex items-center gap-4 px-5 py-3 border-b-4 mb-6"
                  style={{
                    background: "linear-gradient(90deg,#fff176 0%,#fff9c4 60%,#ffffff 100%)",
                    borderBottomColor: "#c62828",
                  }}
                >
                  <img src="/kenlord.png" alt="Kenlord Logo" className="h-16 w-auto object-contain" />
                  <h1 className="text-2xl font-extrabold tracking-wide uppercase text-[#0d1b3e]">
                    Kenlord Educational Institute
                  </h1>
                </div>

                {/* Title */}
                <h2 className="text-center text-lg font-medium mb-6">Provisional Mocks Slip</h2>

                <div className="px-2">
                  {/* Disclaimer */}
                  <h3 className="text-sm font-bold text-red-600 underline mb-1">DISCLAIMER</h3>
                  <p className="text-xs text-red-600 leading-snug mb-6">
                    THE RESULTS BELOW ARE THE FINAL RESULTS FOR THE {mock.name.toUpperCase()}
                  </p>

                  <h3 className="text-sm font-bold mb-4">Candidate Results</h3>

                  {/* Photo */}
                  <div className="flex justify-end mb-4 pr-6">
                    {data.student.image_url ? (
                      <img
                        src={data.student.image_url}
                        alt="Student"
                        className="w-[110px] h-[138px] object-cover"
                      />
                    ) : (
                      <div className="w-[110px] h-[138px] flex items-center justify-center bg-gray-100 text-gray-400 text-3xl font-bold">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Candidate details */}
                  <table className="w-full text-xs mb-6">
                    <tbody>
                      {details.map(([label, value]) => (
                        <tr key={label}>
                          <td className="font-bold w-[180px] py-1">{label}</td>
                          <td className="font-bold py-1">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Results */}
                  <h3 className="text-sm font-bold mb-2">Results</h3>
                  <table className="w-full font-mono text-xs uppercase">
                    <thead>
                      <tr className="border-b border-black text-left">
                        <th className="font-bold pb-2">Subject</th>
                        <th className="font-bold pb-2 w-[60px]">Score</th>
                        <th className="font-bold pb-2 w-[60px]">Grade</th>
                        <th className="font-bold pb-2 text-right">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.scores.map((s) => (
                        <tr key={s.code} className="border-b border-gray-200">
                          <td className="py-1.5">{s.name}</td>
                          <td className="py-1.5">{s.score == null ? "-" : s.score}</td>
                          <td className="py-1.5">{s.score == null ? "-" : s.grade}</td>
                          <td className="py-1.5 text-right">
                            {s.score == null ? "MISSING" : getRemark(s.grade)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Aggregate Summary */}
                  <div className="mt-8 pt-4 border-t border-gray-400 flex justify-between items-start">
                    <div>
                      <p className="text-2xl font-bold">
                        {summary.totalScore ?? "-"}{" "}
                        <span className="text-sm font-normal text-gray-400">/ 600</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Aggregate</p>
                      <p className="text-3xl font-black text-blue-900 leading-none">
                        {summary.aggregate ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer pinned to the bottom of the paper */}
              <div className="mt-auto pt-8 border-t border-transparent flex justify-between text-[10px] text-gray-600">
                <span>{generatedAt}</span>
                <span>{data.student.index_number}</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getRemark(grade: number | string | null) {
  if (grade === null || grade === undefined) return ""
  const g = Number(grade)
  switch (g) {
    case 1: return "HIGHEST"
    case 2: return "HIGHER"
    case 3: return "HIGH"
    case 4: return "HIGH AVERAGE"
    case 5: return "AVERAGE"
    case 6: return "LOW AVERAGE"
    case 7: return "LOW"
    case 8: return "LOWER"
    case 9: return "LOWEST"
    default: return ""
  }
}

const CORE_PATTERNS = [/english/i, /math/i, /science/i, /social/i]

type ScoreRow = { name: string; score: number | null; grade: number | string | null }

function computeSummary(scores: ScoreRow[]) {
  const valid = scores.filter((s) => s.score != null && s.grade != null)

  const core = CORE_PATTERNS.map((re) => valid.find((s) => re.test(s.name)))
  if (core.some((c) => !c)) return { totalScore: null, aggregate: null }

  const coreSet = new Set(core)
  const others = valid
    .filter((s) => !coreSet.has(s))
    .sort((a, b) => Number(a.grade) - Number(b.grade) || Number(b.score) - Number(a.score))
    .slice(0, 2)

  if (others.length < 2) return { totalScore: null, aggregate: null }

  const chosen = [...(core as ScoreRow[]), ...others]
  return {
    totalScore: chosen.reduce((sum, s) => sum + Number(s.score), 0),
    aggregate: chosen.reduce((sum, s) => sum + Number(s.grade), 0),
  }
}