"use client"

import { PrinterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Mock } from "@/lib/mocks"

export function BECEPrintSlip({ 
  mock, 
  data 
}: { 
  mock: Mock; 
  data: NonNullable<Awaited<ReturnType<typeof import("@/lib/results").getStudentResult>>> 
}) {
  const handlePrint = () => {
    window.print()
  }

  const bestSixCodes = data.aggregate.bestSix.map((b) => b.subject_code)
  const bestSixScores = data.scores.filter((s) => bestSixCodes.includes(s.code))
  const totalBestSixScore = bestSixScores.reduce((acc, curr) => acc + Number(curr.score || 0), 0)

  // Generate initials as a fallback
  const initials = `${data.student.first_name[0]}${data.student.last_name[0]}`.toUpperCase()

  return (
    <div className="max-w-3xl mx-auto space-y-4 print:max-w-none print:m-0 print:p-0">
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <PrinterIcon className="mr-2 h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Printable Slip */}
      <div id="printable-slip" className="bg-white text-black p-8 shadow-md border rounded-sm print:shadow-none print:border-none print:p-0 relative overflow-hidden min-h-[600px]">
        
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
          <div className="text-[120px] font-black rotate-[-30deg] uppercase tracking-widest text-gray-200">
            DESTORA
          </div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center border-b border-black pb-4 mb-6">
            <h1 className="text-xl font-bold tracking-widest uppercase">Kenlord Educational Institute Examinations Council</h1>
            <h2 className="text-lg font-semibold mt-1">Provisional Results Slip</h2>
          </div>

          {/* Candidate Details & Photo */}
          <div className="flex justify-between items-start mb-8">
            
            {/* Details */}
            <div className="grid grid-cols-[140px_1fr] gap-2 text-sm font-medium flex-1">
              <div className="text-gray-500 uppercase">Index Number:</div>
              <div>{data.student.index_number}</div>
              
              <div className="text-gray-500 uppercase">Candidate Name:</div>
              <div className="font-bold uppercase">{data.student.first_name} {data.student.last_name}</div>
              
              <div className="text-gray-500 uppercase">Type of Exam:</div>
              <div>BECE Mock</div>
              
              <div className="text-gray-500 uppercase">School:</div>
              <div>Kenlord Educational Institute</div>
              
              <div className="text-gray-500 uppercase">Mock Name:</div>
              <div>{mock.name} ({mock.term}, {mock.academic_year})</div>
            </div>

            {/* Photo (Displays Image if available, otherwise Initials) */}
            <div className="ml-6 shrink-0 flex flex-col items-center">
              {data.student.image_url ? (
                <img 
                  src={data.student.image_url} 
                  alt="Student" 
                  className="w-[100px] h-[120px] object-cover border-2 border-black" 
                />
              ) : (
                <div className="w-[100px] h-[120px] border-2 border-black flex items-center justify-center bg-gray-100 text-gray-400 text-3xl font-bold">
                  {initials}
                </div>
              )}
              <span className="text-[10px] uppercase text-gray-500 mt-1"></span>
            </div>

          </div>

          {/* Results Table */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black font-bold text-xs uppercase">
                  <th className="text-left py-2">Subject</th>
                  <th className="text-center py-2 w-[60px]">Score</th>
                  <th className="text-center py-2 w-[60px]">Grade</th>
                  <th className="text-right py-2 w-[130px]">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.scores.map((s) => (
                  <tr key={s.code}>
                    <td className="py-2 uppercase">{s.name}</td>
                    <td className="py-2 text-center font-bold">
                      {s.score == null ? "-" : Number(s.score)}
                    </td>
                    <td className="py-2 text-center font-bold">
                      {s.score == null ? "-" : s.grade}
                    </td>
                    <td className="py-2 text-right uppercase text-[11px] text-gray-700 font-medium tracking-wide">
                      {s.score == null ? "MISSING" : getRemark(s.grade)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Aggregate Summary */}
          <div className="mt-12 pt-6 border-t-2 border-dotted border-gray-400 flex justify-between items-end">
            <div>
              <p className="text-sm font-bold uppercase text-gray-500">Best 6 Total Score</p>
              <p className="text-3xl font-bold">
                {totalBestSixScore} <span className="text-lg font-normal text-gray-400">/ 600</span>
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-bold uppercase text-gray-500">Aggregate</p>
              <p className="text-4xl font-black text-blue-900">{data.aggregate.aggregate}</p>
              {data.aggregate.incomplete && (
                <p className="text-xs text-red-500 uppercase font-bold mt-1">* Incomplete Results</p>
              )}
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