import { LegalShell } from "@/components/legal/LegalShell";

export default function TerminosPage() {
  return (
    <LegalShell
      eyebrow="Operux · mrzlabs"
      title="Términos y Condiciones de Uso"
      updated="junio de 2026"
    >
      <h2>1. Identificación del prestador</h2>
      <p>
        Operux CRM es un producto de <strong>mrzlabs</strong>, operado por{" "}
        <strong>Andrés Martínez</strong> en Colombia. El canal de contacto es{" "}
        <a href="mailto:contacto@mrzlabs.anonaddy.com">contacto@mrzlabs.anonaddy.com</a>.
      </p>

      <h2>2. Objeto</h2>
      <p>
        Operux es una plataforma SaaS para barberías, peluquerías, centros de uñas, estudios de
        tatuajes y negocios de servicios personales. Incluye agenda, clientes, empleados, servicios,
        turnos, ventas, inventario, gastos, reportes y administración de suscripciones.
      </p>

      <h2>3. Aceptación</h2>
      <p>
        El acceso y uso de Operux exige la aceptación de estos Términos y de la Política de
        Tratamiento de Datos Personales. Si el usuario no está de acuerdo debe abstenerse de acceder.
      </p>

      <h2>4. Cuenta y credenciales</h2>
      <ul>
        <li>El usuario debe suministrar información veraz y actualizada.</li>
        <li>Las credenciales son personales e intransferibles.</li>
        <li>El usuario debe informar cualquier acceso no autorizado.</li>
        <li>El negocio administrador define los roles y permisos de sus usuarios.</li>
      </ul>

      <h2>5. Planes y suscripción</h2>
      <p>
        Operux opera mediante planes Starter, Pro y Enterprise. El alcance, precio, fecha de
        renovación, límites y soporte aplicables son los aceptados en la cotización, orden de servicio
        o panel de suscripción. Los valores pueden cambiar con aviso previo de 30 días.
      </p>

      <h2>6. Suspensión y conservación</h2>
      <p>
        El incumplimiento de pago, el uso ilegal, el fraude o el riesgo de seguridad pueden causar la
        suspensión del acceso. Los datos se conservarán por 90 días posteriores a la cancelación o
        suspensión, salvo obligación legal diferente.
      </p>

      <h2>7. Obligaciones del usuario</h2>
      <ul>
        <li>Usar la plataforma conforme a la ley colombiana.</li>
        <li>Respetar la privacidad de clientes, empleados y demás titulares.</li>
        <li>No intentar acceder a cuentas o datos de otros negocios.</li>
        <li>No introducir código malicioso ni afectar la disponibilidad del servicio.</li>
        <li>Validar la información operativa antes de tomar decisiones comerciales o contables.</li>
      </ul>

      <h2>8. Tratamiento de datos</h2>
      <p>
        El tratamiento de datos personales se rige por la{" "}
        <a href="/privacidad">Política de Tratamiento de Datos Personales</a>. El negocio suscriptor
        es responsable de contar con autorización para registrar información de sus clientes y
        empleados.
      </p>

      <h2>9. Propiedad intelectual</h2>
      <p>
        Operux, su código, diseño, marca y documentación son propiedad de mrzlabs. La suscripción
        concede una licencia limitada, no exclusiva e intransferible. No se permite copiar, distribuir,
        revender, descompilar ni realizar ingeniería inversa del servicio.
      </p>

      <h2>10. Disponibilidad</h2>
      <p>
        mrzlabs procurará una disponibilidad mensual del 99 por ciento. Pueden presentarse
        interrupciones por mantenimiento, conectividad, fuerza mayor o fallas de proveedores como
        Supabase y Vercel.
      </p>

      <h2>11. Limitación de responsabilidad</h2>
      <p>mrzlabs no responde por:</p>
      <ul>
        <li>Errores, eliminaciones o configuraciones realizadas por el usuario.</li>
        <li>Decisiones comerciales, laborales, tributarias o contables basadas en la plataforma.</li>
        <li>Daños indirectos, lucro cesante o pérdida de oportunidad.</li>
        <li>Fallas de internet, dispositivos o servicios de terceros.</li>
      </ul>
      <p>
        La responsabilidad máxima se limita al valor pagado por el suscriptor durante el mes anterior
        al hecho que origine la reclamación.
      </p>

      <h2>12. Modificaciones</h2>
      <p>
        mrzlabs puede modificar estos Términos. Los cambios relevantes se informarán con al menos 15
        días de anticipación. El uso posterior a su entrada en vigencia constituye aceptación.
      </p>

      <h2>13. Terminación</h2>
      <p>
        El suscriptor puede solicitar la cancelación según las condiciones de su plan. No se realizan
        reembolsos por periodos ya facturados. mrzlabs puede terminar el servicio por fraude, uso
        ilegal, mora reiterada o incumplimiento material.
      </p>

      <h2>14. Ley y jurisdicción</h2>
      <p>
        Estos Términos se rigen por las leyes de Colombia. Las controversias se someterán a los jueces
        competentes de Bogotá D.C.
      </p>
    </LegalShell>
  );
}
