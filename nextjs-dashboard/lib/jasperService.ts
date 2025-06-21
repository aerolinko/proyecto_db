import axios from 'axios';

export interface JasperReportParams {
  reportType: string;
  parameters: any;
  format?: 'pdf' | 'xlsx' | 'csv';
}

export interface JasperReportResponse {
  success: boolean;
  reportUrl?: string;
  reportData?: Buffer;
  error?: string;
}

class JasperService {
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor() {
    this.baseUrl = process.env.JASPER_SERVER_URL || 'http://localhost:8080';
    this.username = process.env.JASPER_USERNAME || 'admin';
    this.password = process.env.JASPER_PASSWORD || 'admin123';
  }

  private async getAuthToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/jasperserver/rest_v2/login`, {
        username: this.username,
        password: this.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.headers['set-cookie']?.[0] || '';
    } catch (error) {
      console.error('Error obteniendo token de autenticación:', error);
      throw new Error('No se pudo autenticar con JasperReports Server');
    }
  }

  async generateReport(params: JasperReportParams): Promise<JasperReportResponse> {
    try {
      const authToken = await this.getAuthToken();
      const reportPath = `/reports/${params.reportType}.jasper`;
      const format = params.format || 'pdf';

      const response = await axios.get(
        `${this.baseUrl}/jasperserver/rest_v2/reports${reportPath}.${format}`,
        {
          params: params.parameters,
          headers: {
            'Cookie': authToken,
            'Accept': `application/${format}`
          },
          responseType: 'arraybuffer'
        }
      );

      return {
        success: true,
        reportData: Buffer.from(response.data),
        reportUrl: `${this.baseUrl}/jasperserver/rest_v2/reports${reportPath}.${format}`
      };
    } catch (error) {
      console.error('Error generando reporte JasperReports:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async uploadReportTemplate(templateName: string, jrxmlContent: string): Promise<boolean> {
    try {
      const authToken = await this.getAuthToken();
      
      const response = await axios.put(
        `${this.baseUrl}/jasperserver/rest_v2/resources/reports/${templateName}.jrxml`,
        jrxmlContent,
        {
          headers: {
            'Cookie': authToken,
            'Content-Type': 'application/xml'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error subiendo plantilla de reporte:', error);
      return false;
    }
  }

  async listReports(): Promise<string[]> {
    try {
      const authToken = await this.getAuthToken();
      
      const response = await axios.get(
        `${this.baseUrl}/jasperserver/rest_v2/resources/reports`,
        {
          headers: {
            'Cookie': authToken,
            'Accept': 'application/json'
          }
        }
      );

      return response.data.resourceLookup?.map((item: any) => item.label) || [];
    } catch (error) {
      console.error('Error listando reportes:', error);
      return [];
    }
  }
}

export const jasperService = new JasperService(); 