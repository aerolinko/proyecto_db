'use client'

import { useState } from 'react'
import { Button } from '@/ui/button'

interface JasperReportGeneratorProps {
  reportType: string
  parameters: any
  onGenerate?: (success: boolean, error?: string) => void
}

export default function JasperReportGenerator({ 
  reportType, 
  parameters, 
  onGenerate 
}: JasperReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'xlsx' | 'csv'>('pdf')

  const generateReport = async () => {
    setIsGenerating(true)
    
    try {
      console.log('Generando reporte JasperReports:', { reportType, parameters, format })
      
      const response = await fetch('/api/jasper-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          parameters,
          format
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error generando reporte')
      }

      // Obtener el blob del reporte
      const blob = await response.blob()
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Obtener nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `${reportType}_${new Date().toISOString().split('T')[0]}.${format}`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      onGenerate?.(true)
      
    } catch (error) {
      console.error('Error generando reporte:', error)
      onGenerate?.(false, error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generar Reporte con JasperReports</h3>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Formato:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'pdf' | 'xlsx' | 'csv')}
            className="px-3 py-1 border rounded text-sm"
            disabled={isGenerating}
          >
            <option value="pdf">PDF</option>
            <option value="xlsx">Excel</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Tipo de reporte:</strong> {reportType}</p>
        <p><strong>Parámetros:</strong> {JSON.stringify(parameters, null, 2)}</p>
      </div>

      <Button
        onClick={generateReport}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando...
          </>
        ) : (
          <>
            📊 Generar Reporte {format.toUpperCase()}
          </>
        )}
      </Button>

      <div className="text-xs text-gray-500">
        <p>💡 El reporte se descargará automáticamente cuando esté listo</p>
        <p>🔧 Asegúrate de que JasperReports Server esté ejecutándose</p>
      </div>
    </div>
  )
} 