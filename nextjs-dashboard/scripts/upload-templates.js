const fs = require('fs');
const path = require('path');
const axios = require('axios');

const JASPER_SERVER_URL = process.env.JASPER_SERVER_URL || 'http://localhost:8080';
const JASPER_USERNAME = process.env.JASPER_USERNAME || 'admin';
const JASPER_PASSWORD = process.env.JASPER_PASSWORD || 'admin123';

class TemplateUploader {
  constructor() {
    this.baseUrl = JASPER_SERVER_URL;
    this.username = JASPER_USERNAME;
    this.password = JASPER_PASSWORD;
    this.authToken = null;
  }

  async getAuthToken() {
    try {
      console.log('🔐 Obteniendo token de autenticación...');
      
      const response = await axios.post(`${this.baseUrl}/jasperserver/rest_v2/login`, {
        username: this.username,
        password: this.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.authToken = response.headers['set-cookie']?.[0] || '';
      console.log('✅ Token obtenido exitosamente');
      return this.authToken;
    } catch (error) {
      console.error('❌ Error obteniendo token de autenticación:', error.message);
      throw new Error('No se pudo autenticar con JasperReports Server');
    }
  }

  async uploadTemplate(templateName, jrxmlContent) {
    try {
      if (!this.authToken) {
        await this.getAuthToken();
      }

      console.log(`📤 Subiendo plantilla: ${templateName}.jrxml`);
      
      const response = await axios.put(
        `${this.baseUrl}/jasperserver/rest_v2/resources/reports/${templateName}.jrxml`,
        jrxmlContent,
        {
          headers: {
            'Cookie': this.authToken,
            'Content-Type': 'application/xml'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Plantilla ${templateName}.jrxml subida exitosamente`);
        return true;
      } else {
        console.log(`⚠️  Respuesta inesperada: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error subiendo plantilla ${templateName}:`, error.message);
      return false;
    }
  }

  async uploadAllTemplates() {
    try {
      console.log('🚀 Iniciando subida de plantillas...');
      
      const templatesDir = path.join(__dirname, '..', 'jasper-reports');
      const files = fs.readdirSync(templatesDir).filter(file => file.endsWith('.jrxml'));

      if (files.length === 0) {
        console.log('⚠️  No se encontraron archivos .jrxml en el directorio de plantillas');
        return;
      }

      console.log(`📁 Encontrados ${files.length} archivos de plantilla:`);
      files.forEach(file => console.log(`   - ${file}`));

      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        const templateName = path.basename(file, '.jrxml');
        const filePath = path.join(templatesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        const success = await this.uploadTemplate(templateName, content);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      console.log('\n📊 Resumen de subida:');
      console.log(`   ✅ Exitosas: ${successCount}`);
      console.log(`   ❌ Fallidas: ${errorCount}`);
      console.log(`   📋 Total: ${files.length}`);

    } catch (error) {
      console.error('❌ Error durante la subida de plantillas:', error.message);
    }
  }

  async testConnection() {
    try {
      console.log('🔍 Probando conexión con JasperReports Server...');
      
      const response = await axios.get(`${this.baseUrl}/jasperserver/rest_v2/serverInfo`, {
        timeout: 5000
      });

      if (response.status === 200) {
        console.log('✅ Conexión exitosa con JasperReports Server');
        console.log(`   📍 URL: ${this.baseUrl}`);
        console.log(`   🔧 Versión: ${response.data.version || 'No disponible'}`);
        return true;
      }
    } catch (error) {
      console.error('❌ Error conectando con JasperReports Server:', error.message);
      console.log('💡 Asegúrate de que JasperReports Server esté ejecutándose');
      console.log('   Puedes iniciarlo con: docker-compose up -d');
      return false;
    }
  }
}

async function main() {
  const uploader = new TemplateUploader();

  try {
    // Probar conexión primero
    const isConnected = await uploader.testConnection();
    if (!isConnected) {
      console.log('\n🛑 No se puede continuar sin conexión al servidor');
      process.exit(1);
    }

    // Subir todas las plantillas
    await uploader.uploadAllTemplates();

    console.log('\n🎉 Proceso completado!');
    console.log('📖 Puedes acceder a JasperReports Server en:');
    console.log(`   🌐 ${JASPER_SERVER_URL}/jasperserver`);
    console.log(`   👤 Usuario: ${JASPER_USERNAME}`);
    console.log(`   🔑 Contraseña: ${JASPER_PASSWORD}`);

  } catch (error) {
    console.error('❌ Error en el proceso principal:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = TemplateUploader; 