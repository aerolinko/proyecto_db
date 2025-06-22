#!/bin/bash

echo "Iniciando JasperReports Server..."

# Esperar a que PostgreSQL esté disponible
echo "Esperando a que PostgreSQL esté disponible..."
until pg_isready -h postgres -p 5432 -U jasper; do
  echo "PostgreSQL no está listo - esperando..."
  sleep 2
done

echo "PostgreSQL está listo!"

# Configurar JasperReports para usar PostgreSQL
cd /opt/jasperserver

# Iniciar JasperReports Server
echo "Iniciando JasperReports Server..."
./apache-tomcat/bin/startup.sh

# Mantener el contenedor corriendo
tail -f /opt/jasperserver/apache-tomcat/logs/catalina.out 