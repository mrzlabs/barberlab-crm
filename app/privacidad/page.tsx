import { LegalShell } from "@/components/legal/LegalShell";

export default function PrivacidadPage() {
  return (
    <LegalShell
      eyebrow="Operux CRM · mrzlabs"
      title="Política de Tratamiento de Datos Personales"
      updated="junio de 2026"
    >
      <p className="rounded-xl border-l-4 border-cyan-600 bg-cyan-50 px-5 py-4">
        Esta política se adopta en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y
        las demás normas colombianas aplicables a la protección de datos personales.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        <strong>Nombre:</strong> Andrés Martínez
        <br />
        <strong>Marca comercial:</strong> mrzlabs · Operux
        <br />
        <strong>Producto:</strong> Operux CRM
        <br />
        <strong>Correo:</strong>{" "}
        <a href="mailto:contacto@mrzlabs.anonaddy.com">contacto@mrzlabs.anonaddy.com</a>
        <br />
        <strong>País:</strong> Colombia
      </p>

      <h2>2. Datos que recolectamos</h2>
      <ul>
        <li><strong>Administradores:</strong> nombre, correo, teléfono y datos del establecimiento.</li>
        <li><strong>Empleados:</strong> nombre, correo, teléfono, especialidad, disponibilidad, turnos y comisiones.</li>
        <li><strong>Clientes:</strong> nombre, correo, teléfono, historial de citas, servicios y observaciones operativas.</li>
        <li><strong>Operación:</strong> agenda, ventas, gastos, inventario, pagos, propinas, descuentos y reportes.</li>
        <li><strong>Acceso:</strong> identificadores de cuenta, rol, fecha de último acceso y registros de seguridad.</li>
      </ul>
      <p>
        Operux no solicita datos sensibles como origen racial, orientación sexual, datos biométricos
        o información clínica. El establecimiento debe abstenerse de registrar este tipo de datos en
        campos de texto libre.
      </p>

      <h2>3. Finalidades del tratamiento</h2>
      <ol>
        <li>Prestar el servicio de gestión operativa contratado.</li>
        <li>Administrar citas, servicios, clientes, empleados, inventario, gastos y reportes.</li>
        <li>Gestionar la cuenta, la suscripción, la facturación y el soporte.</li>
        <li>Enviar notificaciones operativas, alertas de seguridad y comunicaciones del servicio.</li>
        <li>Cumplir obligaciones legales y atender solicitudes de autoridades competentes.</li>
        <li>Medir el funcionamiento y mejorar la seguridad y las funcionalidades de la plataforma.</li>
      </ol>
      <p>
        Los datos no se venden, ceden ni comparten con terceros para publicidad o fines comerciales
        ajenos al servicio.
      </p>

      <h2>4. Derechos del titular</h2>
      <p>El titular puede:</p>
      <ul>
        <li>Conocer y acceder gratuitamente a sus datos personales.</li>
        <li>Actualizar y rectificar información inexacta o incompleta.</li>
        <li>Solicitar prueba de la autorización otorgada.</li>
        <li>Solicitar la supresión cuando no exista un deber legal o contractual de conservación.</li>
        <li>Revocar la autorización de tratamiento.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
      </ul>
      <p>
        Envía la solicitud a{" "}
        <a href="mailto:contacto@mrzlabs.anonaddy.com">contacto@mrzlabs.anonaddy.com</a> con nombre
        completo, identificación, datos de contacto y descripción de la petición. Las consultas y
        reclamos se responderán dentro de los términos establecidos por la legislación colombiana.
      </p>

      <h2>5. Base legal y autorización</h2>
      <ul>
        <li>La autorización previa, expresa e informada del titular.</li>
        <li>La ejecución de la relación contractual y la prestación del servicio.</li>
        <li>El cumplimiento de obligaciones legales aplicables.</li>
      </ul>
      <p>
        La aceptación registrada en el inicio de sesión constituye evidencia de lectura y aceptación
        de esta política y de los Términos y Condiciones vigentes.
      </p>

      <h2>6. Seguridad de los datos</h2>
      <ul>
        <li>Cifrado en tránsito mediante TLS.</li>
        <li>Autenticación segura y control de sesiones.</li>
        <li>Separación de datos por negocio y control de acceso por roles.</li>
        <li>Reglas de acceso de mínimo privilegio.</li>
        <li>Registros de actividad y medidas de recuperación de datos.</li>
      </ul>

      <h2>7. Encargados y transmisión de datos</h2>
      <p>
        Operux utiliza servicios tecnológicos de Supabase y Vercel para autenticación, base de datos,
        alojamiento y distribución de la aplicación. Estos proveedores actúan como encargados o
        proveedores de infraestructura y aplican sus propias medidas de privacidad y seguridad.
      </p>

      <h2>8. Conservación</h2>
      <p>
        Los datos se conservan durante la vigencia de la cuenta y por 90 días posteriores a su
        cancelación o suspensión, salvo que una obligación legal o contractual exija un plazo
        diferente. Durante este periodo puede solicitarse exportación o eliminación.
      </p>

      <h2>9. Responsabilidad del establecimiento</h2>
      <p>
        Cada negocio que registra datos de sus clientes y empleados actúa como responsable frente a
        esos titulares. Debe obtener las autorizaciones necesarias, informar las finalidades y usar
        Operux conforme a la legislación aplicable.
      </p>

      <h2>10. Modificaciones</h2>
      <p>
        mrzlabs puede actualizar esta política. La versión vigente permanecerá publicada en Operux y
        los cambios relevantes se comunicarán por los canales registrados.
      </p>

      <h2>11. Contacto y reclamos</h2>
      <p>
        <strong>Correo:</strong>{" "}
        <a href="mailto:contacto@mrzlabs.anonaddy.com">contacto@mrzlabs.anonaddy.com</a>
        <br />
        <strong>Autoridad de control:</strong>{" "}
        <a href="https://www.sic.gov.co">Superintendencia de Industria y Comercio</a>
      </p>
    </LegalShell>
  );
}
