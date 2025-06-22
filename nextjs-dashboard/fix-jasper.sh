#!/bin/bash

echo "Arreglando JasperReports Server..."

# Crear archivos de configuración faltantes
mkdir -p /opt/jasperserver/apache-tomcat/webapps/jasperserver/WEB-INF

# Crear archivo de propiedades faltante
cat > /opt/jasperserver/apache-tomcat/webapps/jasperserver/WEB-INF/js.quartz.properties.template << 'EOF'
# Quartz configuration file
org.quartz.scheduler.instanceName=JasperScheduler
org.quartz.scheduler.instanceId=AUTO
org.quartz.threadPool.class=org.quartz.simpl.SimpleThreadPool
org.quartz.threadPool.threadCount=5
org.quartz.threadPool.threadPriority=5
org.quartz.jobStore.class=org.quartz.simpl.RAMJobStore
EOF

# Crear directorio de logs si no existe
mkdir -p /opt/jasperserver/apache-tomcat/logs

# Crear archivo de log inicial
touch /opt/jasperserver/apache-tomcat/logs/catalina.out

echo "JasperReports Server arreglado!" 