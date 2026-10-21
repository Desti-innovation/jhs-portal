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
      const html2canvas = (await import("html2canvas-pro")).default
      const { jsPDF } = await import("jspdf")

      const element = document.getElementById("printable-slip")
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
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

      {/* Printable Slip */}
      <div
        id="printable-slip"
        className="relative overflow-hidden bg-white text-[#212121] shadow-md border print:shadow-none print:border-none min-h-[1000px] px-10 pt-10 pb-6 flex flex-col"
      >
        {/* LOGO WATERMARK */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <img
            src="/kenlord.png"
            alt=""
            className="w-[480px] h-[480px] object-contain opacity-[0.1]"
          />
        </div>

        <div className="relative z-10 flex flex-col flex-1">
          {/* Banner */}
          <div
            className="flex items-center gap-4 px-5 py-3 border-b-4"
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
          <h2 className="text-center text-lg font-medium mt-6 mb-6">Provisional Mocks Slip</h2>

          <div className="px-4">
            {/* Disclaimer */}
            <h3 className="text-md text-red-600 underline mb-4">DISCLAIMER</h3>
             <p className="text-md text-red-600 leading-snug mb-3">
                THE RESULTS BELOW ARE THE FINAL RESULTS FOR THE {mock.name.toUpperCase()}
              </p>

            <h3 className="text-sm font-bold mb-3">Candidate Results</h3>

            {/* Photo */}
            <div className="flex justify-end mb-6 pr-6">
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
            <div className="grid grid-cols-[1fr_1fr] gap-y-3 text-sm mb-6">
              {details.map(([label, value]) => (
                <div key={label} className="contents">
                  <div className="font-bold">{label}</div>
                  <div className="font-bold">{value}</div>
                </div>
              ))}
            </div>

            {/* Results */}
            <h3 className="text-sm font-bold mb-4">Results</h3>
            <div className="pl-10 grid grid-cols-[1.5fr_70px_70px_1.2fr] gap-y-2.5 font-mono text-sm uppercase">
              <span className="font-bold">Subject</span>
              <span className="font-bold">Score</span>
              <span className="font-bold">Grade</span>
              <span className="font-bold">Remark</span>
              {data.scores.map((s) => (
                <div key={s.code} className="contents">
                  <span>{s.name}</span>
                  <span>{s.score == null ? "-" : s.score}</span>
                  <span>{s.score == null ? "-" : s.grade}</span>
                  <span>{s.score == null ? "MISSING" : getRemark(s.grade)}</span>
                </div>
              ))}
            </div>

            {/* Aggregate Summary */}
            <div className="mt-10 pt-4 border-t border-gray-400 flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold">
                  {summary.totalScore ?? "-"}{" "}
                  <span className="text-sm font-normal text-gray-400">/ 600</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-gray-500">Aggregate</p>
                <p className="text-3xl font-black text-blue-900">{summary.aggregate ?? "-"}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-10 flex justify-between text-[10px] text-gray-600">
            <span>{generatedAt}</span>
            <span>{data.student.index_number}</span>
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

/**
 * Total score & aggregate = English + Maths + Science + Social Studies
 * + the best two of the remaining subjects (lowest grade; ties broken by higher score).
 * Returns nulls if a core subject is missing or fewer than two other subjects have results.
 */
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